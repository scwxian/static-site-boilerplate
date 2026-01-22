#!/usr/bin/env bash

# This script automates the process of building the Vite project in an isolated
# nerdctl environment and then cleans up all build artifacts, leaving only
# the final 'dist' directory.

# --- Configuration ---
set -e
set -o pipefail

# --- Variables ---
readonly IMAGE_NAME="personal-site-build:latest"

echo "🚀 Starting the build process..."
echo "Step 0: 🧹 Cleaning up the old ./dist directory..."
rm -rf ./dist

echo "Step 1: 🏗️  Building the image: $IMAGE_NAME"
nerdctl.lima build -t "$IMAGE_NAME" .

echo "Step 2: 📦 Extracting files from the build container..."
CID=$(nerdctl.lima run -d "$IMAGE_NAME" sleep 30)
nerdctl.lima cp "$CID":/app/dist ./dist
nerdctl.lima rm -f "$CID"

echo "Step 3: 🗑️  Removing the build image to save space..."
nerdctl.lima rmi "$IMAGE_NAME"

# --- Completion ---
echo "✅ Build complete! Optimized files are ready in the ./dist directory."
