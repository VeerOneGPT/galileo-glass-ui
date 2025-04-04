/**
 * Custom Jest environment with improved garbage collection and error handling
 */
const JsdomEnvironment = require('jest-environment-jsdom').default;

class CustomTestEnvironment extends JsdomEnvironment {
  async setup() {
    await super.setup();
    // Global error handler for unhandled promise rejections
    this.global.process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection in test:', reason);
    });
  }
  
  async teardown() {
    // Force garbage collection if available
    if (this.global.gc) this.global.gc();
    
    // Clear any mocks/timers before moving to next test
    if (this.global.jest && this.global.jest.clearAllMocks) {
      this.global.jest.clearAllMocks();
    }
    
    if (this.global.jest && this.global.jest.clearAllTimers) {
      this.global.jest.clearAllTimers();
    }
    
    await super.teardown();
  }
}

module.exports = CustomTestEnvironment; 