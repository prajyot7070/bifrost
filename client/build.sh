#!/bin/bash
set -e

echo "Building for Linux..."
GOOS=linux GOARCH=amd64 go build -o bin/bifrost-linux

echo "Building for macOS (Intel)..."
GOOS=darwin GOARCH=amd64 go build -o bin/bifrost-mac

echo "Building for macOS (M1)..."
GOOS=darwin GOARCH=arm64 go build -o bin/bifrost-mac-arm64

echo "Building for Windows..."
GOOS=windows GOARCH=amd64 go build -o bin/bifrost.exe

echo "✅ All builds complete!"

