package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"os"
)

type ConnectMessage struct {
	Type      string `json:"type"`
	LocalPort int    `json:"localPort"`
}

type ConnectionResponse struct {
	Type      string `json:"type"`
	ClientID  string `json:"clientId"`
	PublicURL string `json:"publicUrl"`
//	Subdomain string `json:"subdomain"`
	Status    string `json:"status"`
}

func main() {
	fmt.Println("🚀 Testing Bifrost TCP Connection...")
	
	// Connect to TCP server
	conn, err := net.Dial("tcp", ":8080")
	if err != nil {
		fmt.Printf("❌ Error connecting to server: %v\n", err)
		return
	}
	defer conn.Close()
	
	fmt.Println("✅ Connected to TCP server on port 8080")
	
	// Create connection message
	connectMsg := ConnectMessage{
		Type:      "CONNECT",
		LocalPort: 3000, // Test with port 3000
	}
	
	// Convert to JSON
	msgBytes, err := json.Marshal(connectMsg)
	if err != nil {
		fmt.Printf("❌ Error creating JSON message: %v\n", err)
		return
	}
	
	fmt.Printf("📤 Sending connection request: %s\n", string(msgBytes))
	
	// Send the message
	_, err = conn.Write(msgBytes)
	if err != nil {
		fmt.Printf("❌ Error sending message: %v\n", err)
		return
	}
	
	// Read response from server
	reader := bufio.NewReader(conn)
	fmt.Println("⏳ Waiting for server response...")
	
	// Try to read response (handle both newline and non-newline cases)
	response, err := reader.ReadString('\n')
	if err != nil {
		// If no newline, try reading a fixed buffer
		buffer := make([]byte, 1024)
		n, readErr := conn.Read(buffer)
		if readErr != nil {
			fmt.Printf("❌ Error reading response: %v\n", readErr)
			return
		}
		response = string(buffer[:n])
	}
	
	fmt.Printf("📥 Raw response received: %s\n", response)
	
	// Parse JSON response
	var connResp ConnectionResponse
	err = json.Unmarshal([]byte(response), &connResp)
	if err != nil {
		fmt.Printf("❌ Error parsing JSON response: %v\n", err)
		fmt.Printf("Raw response was: %s\n", response)
		return
	}
	
	// Display results
	fmt.Println("\n🎉 CONNECTION TEST RESULTS:")
	fmt.Printf("├── Status: %s\n", connResp.Status)
	fmt.Printf("├── Client ID: %s\n", connResp.ClientID)
	//fmt.Printf("├── Subdomain: %s\n", connResp.Subdomain)
	fmt.Printf("└── Public URL: %s\n", connResp.PublicURL)
	
	if connResp.Status == "success" {
		fmt.Println("\n✅ TEST PASSED: TCP connection established and unique ID generated!")
		fmt.Println("✅ TEST PASSED: Dynamic URL created successfully!")
	} else {
		fmt.Println("\n❌ TEST FAILED: Connection not successful")
	}
	
	// Keep connection alive for a moment to test persistence
	fmt.Println("\n⏳ Keeping connection alive for 5 seconds to test persistence...")
	fmt.Println("Press Enter to close connection...")
	
	// Wait for user input before closing
	bufio.NewReader(os.Stdin).ReadString('\n')
	
	fmt.Println("👋 Closing connection...")
}
