package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// --- Message Structs for Server Communication ---

// BaseMessage is used to determine the type of an incoming message.
type BaseMessage struct {
	Type string `json:"type"`
}

// ConnectMessage is sent by the client to initiate a tunnel.
type ConnectMessage struct {
	Type      string `json:"type"`
	LocalPort int    `json:"localPort"`
	// TODO: Add an AuthToken for security
	// AuthToken string `json:"authToken"`
}

// ConnectionResponse is received from the server after a successful connection.
type ConnectionResponse struct {
	Type      string `json:"type"`
	ClientID  string `json:"clientId"`
	PublicURL string `json:"publicUrl"`
	Status    string `json:"status"`
	Message   string `json:"message"` // For errors
}

// ServerHTTPRequest is the format of an HTTP request forwarded by the server.
type ServerHTTPRequest struct {
	Type      string      `json:"type"`
	RequestID string      `json:"requestId"`
	Method    string      `json:"method"`
	URL       string      `json:"url"`
	Headers   http.Header `json:"headers"`
	Body      string      `json:"body"`
}

// ClientHTTPResponse is sent back to the server after processing a request locally.
type ClientHTTPResponse struct {
	Type       string      `json:"type"`
	RequestID  string      `json:"requestId"`
	StatusCode int         `json:"statusCode"`
	Headers    http.Header `json:"headers"`
	Body       string      `json:"body"`
}

// Heartbeat is received from the server to check if the client is alive.
type Heartbeat struct {
	Type      string `json:"type"`
	Timestamp int64  `json:"timestamp"`
}

// HeartbeatResponse is sent by the client to respond to a heartbeat.
type HeartbeatResponse struct {
	Type string `json:"type"`
}

// --- TunnelClient ---

// TunnelClient manages the connection to the server and the local forwarding.
type TunnelClient struct {
	conn      net.Conn
	localPort int
	serverAddr string
}

// NewTunnelClient creates a new client instance.
func NewTunnelClient(serverAddr string, localPort int) *TunnelClient {
	return &TunnelClient{
		serverAddr: serverAddr,
		localPort:  localPort,
	}
}

// Start connects to the server and begins listening for requests.
func (tc *TunnelClient) Start() error {
	log.Printf("Connecting to Bifrost server at %s...", tc.serverAddr)
	conn, err := net.Dial("tcp", tc.serverAddr)
	if err != nil {
		return fmt.Errorf("failed to connect to server: %v", err)
	}
	tc.conn = conn
	log.Printf("✅ Connected to TCP server.")

	// Send connection message
	connectMsg := ConnectMessage{
		Type:      "CONNECT",
		LocalPort: tc.localPort,
	}
	if err := tc.sendMessage(connectMsg); err != nil {
		return fmt.Errorf("failed to send connect message: %v", err)
	}

	// Read the first response, which should be CONNECTION_ESTABLISHED
	reader := bufio.NewReader(tc.conn)
	responseBytes, err := reader.ReadBytes('\n')
	if err != nil {
		return fmt.Errorf("failed to read connection response: %v", err)
	}

	var connResp ConnectionResponse
	if err := json.Unmarshal(responseBytes, &connResp); err != nil {
		return fmt.Errorf("failed to parse connection response: %s", string(responseBytes))
	}

	if connResp.Type != "CONNECTION_ESTABLISHED" || connResp.Status != "success" {
		return fmt.Errorf("connection failed: %s", connResp.Message)
	}

	log.Println("🎉 CONNECTION ESTABLISHED!")
	log.Printf("   ├── Client ID: %s", connResp.ClientID)
	log.Printf("   └── Public URL: %s", connResp.PublicURL)
	log.Println("Forwarding traffic to http://localhost:", tc.localPort)

	// Start the main loop to listen for messages from the server
	go tc.listen()

	return nil
}

// listen runs the main loop, reading messages from the server.
func (tc *TunnelClient) listen() {
	defer tc.Close()
	scanner := bufio.NewScanner(tc.conn)
	log.Println("👂 Listening for server messages...")

	for scanner.Scan() {
		messageBytes := scanner.Bytes()
		
		var baseMsg BaseMessage
		if err := json.Unmarshal(messageBytes, &baseMsg); err != nil {
			log.Printf("⚠️ Could not parse message type: %v", err)
			continue
		}

		// Dispatch based on message type
		switch baseMsg.Type {
		case "HTTP_REQUEST":
			var req ServerHTTPRequest
			if err := json.Unmarshal(messageBytes, &req); err != nil {
				log.Printf("⚠️ Error parsing HTTP_REQUEST: %v", err)
				continue
			}
			go tc.handleHTTPRequest(req)
		case "HEARTBEAT":
			log.Println("💓 Received heartbeat, sending response...")
			tc.handleHeartbeat()
		default:
			log.Printf("❓ Received unknown message type: %s", baseMsg.Type)
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("❌ Error reading from server connection: %v", err)
	}
	log.Println("Connection closed by server.")
}

// handleHTTPRequest forwards an incoming request to the local server.
func (tc *TunnelClient) handleHTTPRequest(req ServerHTTPRequest) {
	log.Printf("🌐 Handling request [%s]: %s %s", req.RequestID, req.Method, req.URL)

	localURL := fmt.Sprintf("http://localhost:%d%s", tc.localPort, req.URL)
	
	// Create a new request to the local service
	localReq, err := http.NewRequest(req.Method, localURL, bytes.NewReader([]byte(req.Body)))
	if err != nil {
		log.Printf("❌ [%s] Failed to create local request: %v", req.RequestID, err)
		tc.sendErrorResponse(req.RequestID, 500, "Internal client error")
		return
	}

	// Copy headers from the original request
	localReq.Header = req.Headers
	// The http client will set the Host header correctly based on the URL
	localReq.Host = fmt.Sprintf("localhost:%d", tc.localPort)

	// Execute the request against the local service
	client := &http.Client{Timeout: 25 * time.Second}
	resp, err := client.Do(localReq)
	if err != nil {
		log.Printf("❌ [%s] Failed to forward request to local service: %v", req.RequestID, err)
		tc.sendErrorResponse(req.RequestID, 502, "Bad Gateway: Local service is unavailable.")
		return
	}
	defer resp.Body.Close()

	// Read the response body from the local service
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("❌ [%s] Failed to read local response body: %v", req.RequestID, err)
		tc.sendErrorResponse(req.RequestID, 500, "Internal client error")
		return
	}

	// Construct the response to send back to the Bifrost server
	httpResp := ClientHTTPResponse{
		Type:       "HTTP_RESPONSE",
		RequestID:  req.RequestID,
		StatusCode: resp.StatusCode,
		Headers:    resp.Header,
		Body:       string(respBody),
	}

	if err := tc.sendMessage(httpResp); err != nil {
		log.Printf("❌ [%s] Failed to send response to server: %v", req.RequestID, err)
	} else {
		log.Printf("✅ [%s] Sent response with status %d", req.RequestID, resp.StatusCode)
	}
}

// handleHeartbeat sends a heartbeat response to the server.
func (tc *TunnelClient) handleHeartbeat() {
	resp := HeartbeatResponse{Type: "HEARTBEAT_RESPONSE"}
	if err := tc.sendMessage(resp); err != nil {
		log.Printf("⚠️ Failed to send heartbeat response: %v", err)
	}
}

// sendMessage marshals a struct to JSON and sends it to the server with a newline.
func (tc *TunnelClient) sendMessage(v interface{}) error {
	msgBytes, err := json.Marshal(v)
	if err != nil {
		return err
	}
	// Append newline as a message delimiter
	msgBytes = append(msgBytes, '\n')
	_, err = tc.conn.Write(msgBytes)
	return err
}

// sendErrorResponse sends a standardized error back to the server.
func (tc *TunnelClient) sendErrorResponse(requestID string, statusCode int, errorMsg string) {
	httpResp := ClientHTTPResponse{
		Type:       "HTTP_RESPONSE",
		RequestID:  requestID,
		StatusCode: statusCode,
		Headers:    http.Header{"Content-Type": []string{"text/plain"}},
		Body:       errorMsg,
	}
	if err := tc.sendMessage(httpResp); err != nil {
		log.Printf("❌ Failed to send error response for %s: %v", requestID, err)
	}
}

// Close gracefully shuts down the connection.
func (tc *TunnelClient) Close() {
	if tc.conn != nil {
		log.Println("👋 Closing connection to server...")
		tc.conn.Close()
	}
}

func main() {
	// --- Configuration Flags ---
	serverAddr := flag.String("server", "127.0.0.1:8080", "Address of the Bifrost TCP server")
	localPort := flag.Int("localport", 3000, "The local port to forward traffic to")
	flag.Parse()

	log.Println("🚀 Starting Bifrost Tunnel Client...")

	client := NewTunnelClient(*serverAddr, *localPort)
	
	// --- Graceful Shutdown Setup ---
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-shutdownChan
		log.Println("Interrupt received, shutting down.")
		client.Close()
		os.Exit(0)
	}()

	// --- Start the Client ---
	if err := client.Start(); err != nil {
		log.Fatalf("❌ Client failed to start: %v", err)
	}

	// Block forever until an interrupt is received
	select {}
}

