/*
Copyright © 2025 NAME HERE <EMAIL ADDRESS>

*/
package main

import (
  "os"
  "bifrost/client/cmd"
)

func main() {
	if len(os.Args) == 1 {
    cmd.PrintAsciiArt()
	}
	cmd.Execute()
}

