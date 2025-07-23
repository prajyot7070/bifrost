/*
Copyright © 2025 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"log"

	"github.com/spf13/cobra"
  "bifrost/client/internal"
)

var port int
const serverAddr string = "52.7.141.2:8080"

// bridgeCmd represents the bridge command
var bridgeCmd = &cobra.Command{
	Use:   "bridge",
	Short: "Expose your local service to the internet",
	Run: func(cmd *cobra.Command, args []string) {
    apiKey := loadApiKey()
    if apiKey == "" {
      fmt.Println("Counldn't load Apikey \n Run `bifrost auth --key <API_KEY>` first")
      return
    }
    client := client.NewTunnelClient(serverAddr, port, apiKey)
		// Handle shutdown signals
		shutdownChan := make(chan os.Signal, 1)
		signal.Notify(shutdownChan, syscall.SIGINT, syscall.SIGTERM)
		go func() {
			<-shutdownChan
			log.Println("Interrupt received, shutting down...")
			client.Close()
			os.Exit(0)
		}()

		if err := client.Start(); err != nil {
			log.Fatalf("❌ Failed to start tunnel: %v", err)
		}
	},
}

func init() {
	rootCmd.AddCommand(bridgeCmd)
}

func loadApiKey() string {
  path := getConfigPath()
  data, err := os.ReadFile(path)
  if err != nil {
    return ""
  }
  var config map[string]string
  json.Unmarshal(data, &config)
  return config["apiKey"]
}
