#!/bin/bash

echo "Galileo Glass UI - Enhanced Installation Script"
echo "=============================================="

# Set environment to production for smoother installation
export NODE_ENV=production

echo "Setting NODE_ENV=production to skip build process during installation"

# First check if dist directory exists
if [ -d "dist" ]; then
  echo "Found existing pre-built version in dist directory."
else
  echo "Pre-built version not found. Creating it now..."
  
  # Run the prebuild script
  node prebuild.js
  
  # Check if prebuild was successful
  if [ ! -d "dist" ]; then
    echo "❌ Failed to create pre-built version. Please check the errors above."
    exit 1
  fi
  
  echo "✅ Pre-built version created successfully!"
fi

echo ""
echo "You can now import Galileo Glass UI in your projects:"
echo ""
echo "  import { Button, GlassCard, ThemeProvider } from 'galileo-glass-ui';"
echo ""
echo "Installation path: $(pwd)/dist"
echo ""
echo "To install in another project:"
echo "  npm install $(pwd)/dist styled-components"
echo ""