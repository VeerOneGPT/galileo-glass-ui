#!/bin/bash

# auto-fix-all.sh
# 
# This script runs all automated fixing tools in sequence to address common issues
# in the codebase. It's useful for a quick cleanup before committing changes.
#
# Usage:
#   ./scripts/auto-fix-all.sh
#
# What it does:
# 1. Runs the verification script to identify issues
# 2. Fixes unused variables by prefixing them with underscores
# 3. Fixes React Hook dependencies in useEffect, useMemo, and useCallback hooks
# 4. Runs verification again to check if issues were resolved

echo -e "\n\033[1;34m====== STEP 1: INITIAL VERIFICATION ======\033[0m\n"
./scripts/verify.sh

echo -e "\n\033[1;34m====== STEP 2: FIXING UNUSED VARIABLES ======\033[0m\n"
node scripts/fix-unused-vars.js

echo -e "\n\033[1;34m====== STEP 3: FIXING HOOK DEPENDENCIES ======\033[0m\n"
node scripts/fix-hooks.js

echo -e "\n\033[1;34m====== STEP 4: FINAL VERIFICATION ======\033[0m\n"
./scripts/verify.sh

echo -e "\n\033[1;32m✓ Automated fixes complete!\033[0m"
echo -e "\033[0;33mNote: Some issues may require manual fixes. See the verification output above.\033[0m" 