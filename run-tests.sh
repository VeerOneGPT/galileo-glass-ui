#!/bin/bash

# Run Jest tests with the specified environment
echo "🧪 Running Galileo Glass UI tests..."

# Check if jest is installed
if ! command -v jest &> /dev/null
then
    echo "Jest could not be found, installing dependencies first..."
    npm install
fi

# Set environment variables
export NODE_ENV=test

# Run the tests with coverage
echo "Running tests with coverage report..."
npm run test:coverage

# Check exit code
if [ $? -eq 0 ]
then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed."
    exit 1
fi