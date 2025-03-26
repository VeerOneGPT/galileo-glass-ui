#!/bin/bash

# verify.sh - Script to run verification steps for Galileo Glass UI
# Usage: ./scripts/verify.sh [--fix]

set -e # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SHOULD_FIX=false

# Check for --fix flag
if [[ "$1" == "--fix" ]]; then
  SHOULD_FIX=true
fi

# Function to print section header
print_header() {
  echo -e "\n${BLUE}====== $1 ======${NC}\n"
}

# Function to print success message
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error message
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to print warning message
print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Step 1: Run TypeScript type checking
run_typecheck() {
  print_header "Running TypeScript Type Checking"
  npm run typecheck
  if [ $? -eq 0 ]; then
    print_success "TypeScript type checking passed"
  else
    print_error "TypeScript type checking failed"
    exit 1
  fi
}

# Step 2: Run ESLint with different severity levels
run_linting() {
  print_header "Running ESLint"
  
  if $SHOULD_FIX; then
    # Run with auto-fix
    echo "Running ESLint with auto-fix..."
    npm run lint:fix
  else
    # Run without fixing
    echo "Running ESLint..."
    npm run lint:lenient
  fi
  
  # Get warning count
  WARNING_COUNT=$(npx eslint --ext .ts,.tsx,.js,.jsx src/ --max-warnings=9999 | grep -c warning || true)
  ERROR_COUNT=$(npx eslint --ext .ts,.tsx,.js,.jsx src/ --max-warnings=9999 | grep -c error || true)
  
  echo ""
  if [ $ERROR_COUNT -eq 0 ]; then
    print_success "No ESLint errors found"
  else
    print_error "$ERROR_COUNT ESLint errors found"
  fi
  
  if [ $WARNING_COUNT -eq 0 ]; then
    print_success "No ESLint warnings found"
  else
    print_warning "$WARNING_COUNT ESLint warnings found"
    
    # Show summary of warning types
    print_header "ESLint Warning Summary"
    npx eslint --ext .ts,.tsx,.js,.jsx src/ --format json | \
      node -e "
        const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
        const warnings = data.flatMap(file => 
          file.messages.filter(msg => msg.severity === 1)
            .map(msg => msg.ruleId)
        );
        const counts = {};
        warnings.forEach(rule => { counts[rule] = (counts[rule] || 0) + 1; });
        
        console.log('Warning types:');
        Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .forEach(([rule, count]) => {
            console.log(\`  \${rule}: \${count}\`);
          });
      "
  fi
}

# Step 3: Run build process
run_build() {
  print_header "Running Build Process"
  npm run build
  if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
  else
    print_error "Build failed"
    exit 1
  fi
}

# Step 4: Auto-fix unused variables if requested
fix_unused_vars() {
  if $SHOULD_FIX; then
    print_header "Fixing Unused Variables"
    node scripts/fix-unused-vars.js
  fi
}

# Main execution
echo "Galileo Glass UI Verification"
echo "============================"

if $SHOULD_FIX; then
  echo "Running in FIX mode: Will attempt to automatically fix issues"
else
  echo "Running in CHECK mode: Will only report issues (use --fix to auto-fix)"
fi

# Run all verification steps
run_typecheck
run_linting
fix_unused_vars
run_build

# Final summary
print_header "Verification Summary"
if $SHOULD_FIX; then
  print_success "All verification steps completed with auto-fixes applied"
else
  print_success "All verification steps completed successfully"
fi

echo -e "\nTo fix remaining issues, run: ${BLUE}./scripts/verify.sh --fix${NC}" 