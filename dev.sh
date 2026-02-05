#!/bin/bash

echo "🏗️ Building Laravel + React for production..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install it first."
    exit 1
fi

# Install dependencies only if node_modules folder is missing
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ node_modules already exists. Skipping npm install."
fi

# Build the production assets
echo "🚀 Running build..."
npm run build
