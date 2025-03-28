#!/bin/bash

echo "Galileo Glass UI - Minimal Installation Script"
echo "=============================================="

# Set environment to production for smoother installation
export NODE_ENV=production

echo "Setting NODE_ENV=production to skip build process"

# Check if dist-min directory exists, if not create it
if [ -d "dist-min" ]; then
  echo "Found existing minimal distribution."
else
  echo "Creating minimal distribution..."
  
  # Run the minimal installation script
  node install-local.js
  
  # Check if creation was successful
  if [ ! -d "dist-min" ]; then
    echo "❌ Failed to create minimal distribution. Please check the errors above."
    exit 1
  fi
  
  echo "✅ Minimal distribution created successfully!"
fi

# Add a tag for the minimal version
git tag minimal-dist -f 2>/dev/null || echo "Note: Not creating git tag (not a git repository or insufficient permissions)"

# Create a tarball for even faster installation
echo "Creating installable tarball..."
tar -czf galileo-minimal.tgz -C dist-min .

echo ""
echo "Installation Options:"
echo "===================="
echo ""
echo "1. NPM Installation (Recommended):"
echo "   npm install @veerone/galileo-glass-ui styled-components"
echo ""
echo "2. Local Directory Installation:"
echo "   npm install $(pwd)/dist-min styled-components"
echo ""
echo "3. Tarball Installation (FASTEST):"
echo "   npm install $(pwd)/galileo-minimal.tgz styled-components"
echo ""
echo "4. GitHub Installation (after committing and pushing):"
echo "   npm install github:VeerOneGPT/galileo-glass-ui-minimal styled-components"
echo ""
echo "The minimal version includes only essential components and dependencies."
echo "Perfect for quickly testing the library with minimal overhead."
echo ""
echo "IMPORTANT: If you experience installation issues, use option #2 (tarball)"
echo "           which bypasses dependency resolution problems."