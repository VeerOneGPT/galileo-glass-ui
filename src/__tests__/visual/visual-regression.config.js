/**
 * Visual Regression Testing Configuration
 * 
 * This file configures visual regression testing for Galileo Glass UI components.
 * It sets up scenarios to capture screenshots of components in various states,
 * which can be compared against baseline images to detect visual changes.
 */

module.exports = {
  // Base URL for serving the components
  baseUrl: 'http://localhost:6006',
  
  // Directory to store screenshots
  screenshotDir: '__visual_snapshots__',
  
  // Threshold for pixel difference (0-1, where 0 means exact match)
  threshold: 0.01,
  
  // Scenarios to test
  scenarios: [
    // GlassTimeline scenarios
    {
      name: 'timeline-vertical-default',
      url: '/iframe.html?id=components-timeline--vertical-default',
      viewport: { width: 1200, height: 800 },
      delay: 1000 // Wait for animations to settle
    },
    {
      name: 'timeline-horizontal-default',
      url: '/iframe.html?id=components-timeline--horizontal-default',
      viewport: { width: 1200, height: 800 },
      delay: 1000
    },
    {
      name: 'timeline-frosted-variant',
      url: '/iframe.html?id=components-timeline--frosted-variant',
      viewport: { width: 1200, height: 800 },
      delay: 1000
    },
    {
      name: 'timeline-tinted-variant',
      url: '/iframe.html?id=components-timeline--tinted-variant',
      viewport: { width: 1200, height: 800 },
      delay: 1000
    },
    {
      name: 'timeline-mobile-view',
      url: '/iframe.html?id=components-timeline--vertical-default',
      viewport: { width: 480, height: 800 },
      delay: 1000
    },
    
    // GlassMasonry scenarios
    {
      name: 'masonry-default',
      url: '/iframe.html?id=components-masonry--default',
      viewport: { width: 1200, height: 800 },
      delay: 1000
    },
    {
      name: 'masonry-responsive',
      url: '/iframe.html?id=components-masonry--responsive',
      viewport: { width: 1200, height: 800 },
      delay: 1000
    },
    {
      name: 'masonry-mobile-view',
      url: '/iframe.html?id=components-masonry--default',
      viewport: { width: 480, height: 800 },
      delay: 1000
    },
    
    // GlassMultiSelect scenarios
    {
      name: 'multiselect-default',
      url: '/iframe.html?id=components-multiselect--default',
      viewport: { width: 800, height: 600 },
      delay: 500
    },
    {
      name: 'multiselect-with-values',
      url: '/iframe.html?id=components-multiselect--with-values',
      viewport: { width: 800, height: 600 },
      delay: 500
    },
    {
      name: 'multiselect-dropdown-open',
      url: '/iframe.html?id=components-multiselect--dropdown-open',
      viewport: { width: 800, height: 600 },
      delay: 500
    },
    
    // GlassDateRangePicker scenarios
    {
      name: 'daterangepicker-default',
      url: '/iframe.html?id=components-daterangepicker--default',
      viewport: { width: 800, height: 600 },
      delay: 500
    },
    {
      name: 'daterangepicker-with-comparison',
      url: '/iframe.html?id=components-daterangepicker--with-comparison',
      viewport: { width: 800, height: 600 },
      delay: 500
    },
    {
      name: 'daterangepicker-mobile-view',
      url: '/iframe.html?id=components-daterangepicker--default',
      viewport: { width: 480, height: 800 },
      delay: 500
    }
  ],
  
  // Test against multiple browsers
  browsers: ['chromium', 'firefox', 'webkit'],
  
  // Theme variants to test
  themes: ['light', 'dark'],
  
  // Setup to run before tests
  beforeScreenshot: async (page) => {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *,
        *::before,
        *::after {
          transition-duration: 0s !important;
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
    
    // Wait for any lazy-loaded content
    await page.waitForTimeout(300);
  },
  
  // Run after tests
  afterScreenshot: async (page) => {
    // Any cleanup or post-processing
  },
  
  // Command to run Storybook
  storybookCommand: 'npm run storybook',
  
  // Report configuration
  report: {
    format: 'html',
    outputDir: 'visual-regression-report'
  }
};