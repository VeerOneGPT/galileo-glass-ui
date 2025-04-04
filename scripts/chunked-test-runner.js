/**
 * Chunked Test Runner
 * Runs tests in smaller batches to prevent memory issues
 */
const { execSync } = require('child_process');
const glob = require('glob');
const fs = require('fs');

const CHUNK_SIZE = 10;
const MEMORY_LIMIT = 8192;  // 8GB
const testFiles = glob.sync('src/**/*.test.{ts,tsx}');
const chunks = [];

// Track successes/failures for reporting
const results = {
  success: [],
  failure: []
};

// Split into manageable chunks
for (let i = 0; i < testFiles.length; i += CHUNK_SIZE) {
  chunks.push(testFiles.slice(i, i + CHUNK_SIZE));
}

console.log(`Running ${testFiles.length} tests in ${chunks.length} chunks...`);

chunks.forEach((chunk, index) => {
  console.log(`\nRunning chunk ${index + 1}/${chunks.length} (${chunk.length} tests)`);
  try {
    execSync(
      `node --max-old-space-size=${MEMORY_LIMIT} node_modules/.bin/jest ${chunk.join(' ')} --no-cache`,
      { stdio: 'inherit' }
    );
    results.success.push(...chunk);
  } catch (e) {
    console.error(`Chunk ${index + 1} failed`);
    results.failure.push(...chunk);
  }
});

// Write results to disk for future reference
fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));

console.log('\nTest Summary:');
console.log(`Passing: ${results.success.length} tests`);
console.log(`Failing: ${results.failure.length} tests`);

// Return appropriate exit code
process.exit(results.failure.length > 0 ? 1 : 0); 