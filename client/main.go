package main

import (
	"bufio"
//	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
//	"os"
	"strings"
	"time"
)

type ConnectMessage struct {
	Type      string `json:"type"`
	LocalPort int    `json:"localPort"`
}

type ConnectionResponse struct {
	Type      string `json:"type"`
	ClientID  string `json:"clientId"`  // Fixed: match server's camelCase
	PublicURL string `json:"publicUrl"` // Fixed: match server's camelCase
	Status    string `json:"status"`
}

type HTTPRequest struct {
	Type      string                 `json:"type"`
	RequestID string                 `json:"requestId"`
	Method    string                 `json:"method"`
	URL       string                 `json:"url"`
	Headers   map[string]interface{} `json:"headers"`
	Body      string                 `json:"body"`
}

type HTTPResponse struct {
	Type       string                 `json:"type"`
	RequestID  string                 `json:"requestId"`
	StatusCode int                    `json:"statusCode"`
	Headers    map[string]interface{} `json:"headers"`
	Body       string                 `json:"body"`
}

type TunnelClient struct {
	conn      net.Conn
	localPort int
	publicURL string
	clientID  string
}

func NewTunnelClient(localPort int) *TunnelClient {
	return &TunnelClient{
		localPort: localPort,
	}
}

func (tc *TunnelClient) Connect(serverHost string, serverPort int) error {
	// Connect to TCP server
	conn, err := net.Dial("tcp", fmt.Sprintf("%s:%d", serverHost, serverPort))
	if err != nil {
		return fmt.Errorf("failed to connect to server: %v", err)
	}
	tc.conn = conn

	fmt.Printf("✅ Connected to TCP server on %s:%d\n", serverHost, serverPort)

	// Send connection message
	connectMsg := ConnectMessage{
		Type:      "CONNECT",
		LocalPort: tc.localPort,
	}

	msgBytes, err := json.Marshal(connectMsg)
	if err != nil {
		return fmt.Errorf("failed to create JSON message: %v", err)
	}

	fmt.Printf("📤 Sending connection request: %s\n", string(msgBytes))

	// Fixed: Add newline to match server expectation
	_, err = tc.conn.Write(append(msgBytes, '\n'))
	if err != nil {
		return fmt.Errorf("failed to send message: %v", err)
	}

	// Read response
	reader := bufio.NewReader(tc.conn)
	response, err := reader.ReadString('\n')
	if err != nil {
		return fmt.Errorf("failed to read response: %v", err)
	}

	fmt.Printf("📥 Raw response received: %s", response)

	// Parse response
	var connResp ConnectionResponse
	err = json.Unmarshal([]byte(strings.TrimSpace(response)), &connResp)
	if err != nil {
		return fmt.Errorf("failed to parse JSON response: %v", err)
	}

	if connResp.Status != "success" {
		return fmt.Errorf("connection failed with status: %s", connResp.Status)
	}

	tc.clientID = connResp.ClientID
	tc.publicURL = connResp.PublicURL

	fmt.Println("\n🎉 CONNECTION ESTABLISHED:")
	fmt.Printf("├── Status: %s\n", connResp.Status)
	fmt.Printf("├── Client ID: %s\n", connResp.ClientID)
	fmt.Printf("└── Public URL: %s\n", connResp.PublicURL)

	return nil
}

func (tc *TunnelClient) StartListening() {
	fmt.Println("\n🔄 Starting to listen for HTTP requests...")
	
	reader := bufio.NewReader(tc.conn)
	
	for {
		// Read incoming messages
		message, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				fmt.Println("📡 Connection closed by server")
				break
			}
			fmt.Printf("❌ Error reading message: %v\n", err)
			continue
		}

		message = strings.TrimSpace(message)
		if message == "" {
			continue
		}

		fmt.Printf("📥 Received message: %s\n", message)

		// Try to parse as HTTP request
		var httpReq HTTPRequest
		err = json.Unmarshal([]byte(message), &httpReq)
		if err != nil {
			fmt.Printf("❌ Error parsing HTTP request: %v\n", err)
			continue
		}

		if httpReq.Type == "HTTP_REQUEST" {
			go tc.handleHTTPRequest(httpReq)
		}
	}
}

func (tc *TunnelClient) handleHTTPRequest(httpReq HTTPRequest) {
	fmt.Printf("🌐 Handling HTTP request: %s %s\n", httpReq.Method, httpReq.URL)

	// Create request to local server
	localURL := fmt.Sprintf("http://localhost:%d%s", tc.localPort, httpReq.URL)
	
	var body io.Reader
	if httpReq.Body != "" {
		body = strings.NewReader(httpReq.Body)
	}

	req, err := http.NewRequest(httpReq.Method, localURL, body)
	if err != nil {
		tc.sendErrorResponse(httpReq.RequestID, fmt.Sprintf("Failed to create request: %v", err))
		return
	}

	// Set headers
	for key, value := range httpReq.Headers {
		if key == "host" {
			continue // Skip host header to avoid conflicts
		}
		if strValue, ok := value.(string); ok {
			req.Header.Set(key, strValue)
		}
	}

	// Make request to local server
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		tc.sendErrorResponse(httpReq.RequestID, fmt.Sprintf("Failed to forward request: %v", err))
		return
	}
	defer resp.Body.Close()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		tc.sendErrorResponse(httpReq.RequestID, fmt.Sprintf("Failed to read response: %v", err))
		return
	}

	// Convert response headers
	headers := make(map[string]interface{})
	for key, values := range resp.Header {
		if len(values) > 0 {
			headers[key] = values[0]
		}
	}

	// Send response back to server
	httpResp := HTTPResponse{
		Type:       "HTTP_RESPONSE",
		RequestID:  httpReq.RequestID,
		StatusCode: resp.StatusCode,
		Headers:    headers,
		Body:       string(respBody),
	}

	respBytes, err := json.Marshal(httpResp)
	if err != nil {
		fmt.Printf("❌ Error marshaling response: %v\n", err)
		return
	}

	_, err = tc.conn.Write(append(respBytes, '\n'))
	if err != nil {
		fmt.Printf("❌ Error sending response: %v\n", err)
		return
	}

	fmt.Printf("✅ Sent response for request %s (Status: %d)\n", httpReq.RequestID, resp.StatusCode)
}

func (tc *TunnelClient) sendErrorResponse(requestID, errorMsg string) {
	fmt.Printf("❌ Sending error response: %s\n", errorMsg)
	
	httpResp := HTTPResponse{
		Type:       "HTTP_RESPONSE",
		RequestID:  requestID,
		StatusCode: 500,
		Headers:    map[string]interface{}{"Content-Type": "text/plain"},
		Body:       errorMsg,
	}

	respBytes, err := json.Marshal(httpResp)
	if err != nil {
		fmt.Printf("❌ Error marshaling error response: %v\n", err)
		return
	}

	tc.conn.Write(append(respBytes, '\n'))
}

func (tc *TunnelClient) Close() {
	if tc.conn != nil {
		tc.conn.Close()
	}
}

func main() {
	fmt.Println("🚀 Starting Bifrost Tunnel Client...")

	// Configuration
	serverHost := "localhost" // Change this to your EC2 IP when deployed
	serverPort := 8080
	localPort := 3000

	// Start a simple local HTTP server for testing
	go startTestServer(localPort)

	// Create and connect tunnel client
	client := NewTunnelClient(localPort)
	defer client.Close()

	err := client.Connect(serverHost, serverPort)
	if err != nil {
		fmt.Printf("❌ Connection failed: %v\n", err)
		return
	}

	fmt.Printf("\n🌍 Your local server is now accessible at: %s\n", client.publicURL)
	fmt.Println("📝 Test it by opening the URL in your browser!")
	fmt.Println("⏳ Press Ctrl+C to stop the tunnel...")

	// Start listening for HTTP requests
	client.StartListening()
}

func startTestServer(port int) {
	mux := http.NewServeMux()
	
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <title>Bifrost Tunnel - Local Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; }
        .info { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .success { color: #27ae60; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Bifrost Tunnel Working!</h1>
        <p class="success">✅ Your local server is successfully exposed through the tunnel!</p>
        
        <div class="info">
            <strong>Request Details:</strong><br>
            📍 URL: %s<br>
            🔧 Method: %s<br>
            🕒 Time: %s<br>
            🌐 User Agent: %s<br>
            🏠 Local Port: %d
        </div>
        
        <p>Try different paths:</p>
        <ul>
            <li><a href="/api/test">/api/test</a></li>
            <li><a href="/hello">/hello</a></li>
            <li><a href="/status">/status</a></li>
        </ul>
    </div>
</body>
</html>
        `, r.URL.Path, r.Method, time.Now().Format("2006-01-02 15:04:05"), r.UserAgent(), port)
		
		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(200)
		w.Write([]byte(html))
	})

	mux.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
		response := map[string]interface{}{
			"status":    "success",
			"message":   "API endpoint working through tunnel!",
			"timestamp": time.Now().Unix(),
			"method":    r.Method,
			"path":      r.URL.Path,
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	mux.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte("Hello from your local server via Bifrost tunnel! 🚀"))
	})

	fmt.Printf("🌐 Test server starting on http://localhost:%d\n", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", port), mux); err != nil {
		fmt.Printf("❌ Failed to start test server: %v\n", err)
	}
}
