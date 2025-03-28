# Visual Regression Testing

This directory contains configuration and utilities for visual regression testing of Galileo Glass UI components.

## Overview

Visual regression testing captures screenshots of components in various states and compares them against baseline images to detect unintended visual changes. This helps ensure that UI components maintain their appearance as code changes are made.

## Setup

1. Install the required dependencies:
   ```
   npm install --save-dev @storybook/test-runner jest-image-snapshot puppeteer
   ```

2. Run Storybook:
   ```
   npm run storybook
   ```

3. Run visual regression tests:
   ```
   npm run test:visual
   ```

## Configuration

The `visual-regression.config.js` file defines:

- Screenshot scenarios for each component
- Browser viewports to test
- Threshold for acceptable differences
- Custom setup and teardown procedures

## Directory Structure

- `__visual_snapshots__`: Contains the baseline and diff images
- `visual-regression.config.js`: Main configuration file
- `README.md`: Documentation

## Adding Tests for New Components

To add visual regression tests for a new component:

1. Add scenarios to the `scenarios` array in the config file:
   ```javascript
   {
     name: 'your-component-name',
     url: '/iframe.html?id=components-yourcomponent--default',
     viewport: { width: 1200, height: 800 },
     delay: 1000 // Wait for animations to settle
   }
   ```

2. Add variants to test different states or configurations:
   ```javascript
   {
     name: 'your-component-name-variant',
     url: '/iframe.html?id=components-yourcomponent--variant',
     viewport: { width: 1200, height: 800 },
     delay: 1000
   }
   ```

3. Include mobile viewports:
   ```javascript
   {
     name: 'your-component-name-mobile',
     url: '/iframe.html?id=components-yourcomponent--default',
     viewport: { width: 480, height: 800 },
     delay: 1000
   }
   ```

## Best Practices

1. Disable animations when capturing screenshots to ensure consistency
2. Test each component in all variants and states
3. Test responsive layouts with different viewports
4. Update baselines when intentional visual changes are made
5. Review diffs carefully to catch unintended changes

## Troubleshooting

- **Inconsistent results**: Try increasing the `delay` parameter to ensure components are fully rendered
- **False positives**: Adjust the `threshold` parameter to allow for minor pixel variations
- **Missing elements**: Check that all async content has loaded using `beforeScreenshot` hooks

## Cross-Browser Testing

The configuration includes testing in multiple browsers (Chromium, Firefox, WebKit) to catch browser-specific rendering issues.