package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
)

func main() {
  fmt.Println("Hello World")
  conn, err := net.Dial("tcp",":8080")
  if err != nil {
    fmt.Println("Error occured")
  }
  defer conn.Close()
  fmt.Print("[INPUT]:- ")
  reader := bufio.NewReader(os.Stdin)
  input, err := reader.ReadString('\n')
  if err != nil {
    fmt.Println("Error occured")
    return
  }

  _, err = conn.Write([]byte(input))
  if err != nil {
    fmt.Println("Error occured")
    return
  }
}
