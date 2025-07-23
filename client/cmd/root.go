/*
Copyright © 2025 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"os"
  "strings"
  "strconv"

	"github.com/spf13/cobra"
  "github.com/fatih/color"
)


var rootCmd = &cobra.Command{
	Use:   "bifrost",
	Short: "Expose your local services to the internet",
	Long: `Bifrost is a lightweight tunneling tool that creates secure,
temporary public URLs for your local ports.

It's self-hosted, easy to run, and perfect for sharing localhost projects.`,
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		if cmd.Use == "bifrost" && len(os.Args) == 1 {
			PrintAsciiArt()
		}
	},
}



func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
		rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

// hexToRGB converts a hex color string to R, G, B values.
func hexToRGB(hex string) (uint8, uint8, uint8) {
	hex = strings.TrimPrefix(hex, "#")
	val, err := strconv.ParseUint(hex, 16, 32)
	if err != nil {
		return 255, 255, 255 // Default to white on error
	}
	return uint8(val >> 16), uint8((val >> 8) & 0xFF), uint8(val & 0xFF)
}

// PrintAsciiArt displays the Bifrost banner with a smooth, custom gradient.
func PrintAsciiArt() {
	// A 6-step gradient from a steel blue to a soft purple.
	gradient := []string{
		"#6a93cb", // Step 1: Blue
		"#7a8dc1", // Step 2
		"#8b87b8", // Step 3
		"#9b81ae", // Step 4
		"#ac7ba5", // Step 5
		"#bc759b", // Step 6: Purple/Mauve
	}

	artLines := []string{
		"██████╗ ██╗███████╗██████╗  ██████╗ ███████╗████████╗",
		"██╔══██╗██║██╔════╝██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝",
		"██████╔╝██║█████╗  ██████╔╝██║   ██║███████╗   ██║   ",
		"██╔══██╗██║██╔══╝  ██╔══██╗██║   ██║╚════██║   ██║   ",
		"██████╔╝██║██║     ██║  ██║╚██████╔╝███████║   ██║   ",
		"╚═════╝ ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ",
	}

	// Print each line of the art with its corresponding gradient color.
	for i, line := range artLines {
		r, g, b := hexToRGB(gradient[i])
		// This is the ANSI escape code for 24-bit (TrueColor) foreground text.
		// \x1b[38;2;R;G;Bm tells the terminal to use the specified RGB color.
		// \x1b[0m resets the color back to default.
		fmt.Printf("\x1b[38;2;%d;%d;%dm%s\x1b[0m\n", r, g, b, line)
	}

	fmt.Println()

	// You can still use the fatih/color library for other, simpler styling.
	tagline := color.New(color.FgHiWhite, color.Bold).SprintFunc()
	fmt.Println(tagline("Lightweight self-hosted tunneling CLI — expose local services instantly.\n"))
}

