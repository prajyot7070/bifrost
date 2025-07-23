/*
Copyright © 2025 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
)

var apiKey string 

// authCmd represents the auth command
var authCmd = &cobra.Command{
	Use:   "auth",
  Short: "Store your Bifrost API key for future use",
  Long: `The auth command securely stores your API key used to authenticate 
  with the Bifrost server. You must run this before using 'bridge'.

  Example:
    bifrost auth --key sk-bifrost-xxxxxxxxxxxx
  `,	
  Run: func(cmd *cobra.Command, args []string) {
    //check if the apikey is set
    if apiKey == "" {
      fmt.Println("Please provide apiKey using --key ")
      return
    }
    config := map[string]string{"apiKey":apiKey}
    data, _ := json.Marshal(config)
    os.MkdirAll(getConfigDir(), os.ModePerm)
    err := os.WriteFile(getConfigPath(), data, 0600)
    if err != nil {
      fmt.Println("Failed to store ApiKey")
    }
    fmt.Println("Apikey stored at :", getConfigPath())
	},
}

func init() {
  authCmd.Flags().StringVar(&apiKey, "key", "", "Your Bifrost apiKey")
	rootCmd.AddCommand(authCmd)
}

func getConfigDir() string {
  dir, _ := os.UserConfigDir()
  return filepath.Join(dir,"bifrost")
}

func getConfigPath() string {
  return filepath.Join(getConfigDir(),"config.json")
}
