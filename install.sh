#!/bin/bash

echo "Galileo Glass UI - Enhanced Installation Script"
echo "=============================================="

# Set environment to production for smoother installation
export NODE_ENV=production

echo "Setting NODE_ENV=production to skip build process during installation"

# Check for existing node_modules to clean if necessary
if [ -d "node_modules" ]; then
  echo "Found existing node_modules directory."
  
  # Look for problematic dependencies
  PROBLEM_DEPS=("chart.js" "framesync" "framer-motion" "popmotion" "react-chartjs-2")
  
  for dep in "${PROBLEM_DEPS[@]}"; do
    if [ -d "node_modules/$dep" ] || ls -la node_modules/.$dep-* >/dev/null 2>&1; then
      echo "Detected problematic dependency: $dep - cleaning"
      rm -rf node_modules/$dep node_modules/.$dep-* 2>/dev/null
    fi
  done
fi

# Run npm install
echo "Installing dependencies..."
npm install

# Check for success
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Installation completed successfully!"
  echo ""
  echo "You can now import Galileo Glass UI in your project:"
  echo ""
  echo "  import { Button, GlassCard, ThemeProvider } from 'galileo-glass-ui';"
  echo ""
else
  echo ""
  echo "⚠️ Installation encountered issues."
  echo ""
  echo "Try these troubleshooting steps:"
  echo "1. Remove node_modules directory: rm -rf node_modules"
  echo "2. Clear npm cache: npm cache clean --force"
  echo "3. Try again with: ./install.sh"
  echo ""
fi