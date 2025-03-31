# Galileo Glass UI 1.0.4 Release Notes

This maintenance release builds on the extensive enhancements from 1.0.3, focusing on chart visualizations and data presentation capabilities. We've added several quality-of-life improvements to the GlassDataChart component while maintaining backward compatibility.

## What's New

### Enhanced Glass Chart Components 

#### 1. Improved Visual Styling
- Added atmospheric background gradients that adapt to chart colors
- Enhanced glass styling for legend items with hover and active states
- Improved visual hierarchy with subtle glow effects for active items
- Added smooth animations for chart elements with better physics
- Implemented SVG filter effects for better visual depth and clarity

#### 2. Advanced Data Formatting 
- Added comprehensive value formatting utilities for different data types
- Implemented intelligent number formatting with unit selection (K, M, B, T)
- Added currency formatting with locale support and compact display
- Created percentage formatting with customizable precision and sign display
- Added date and duration formatting with multiple presentation options
- Implemented smart detection of value types based on property names

#### 3. Enhanced Export & Sharing
- Redesigned export system with higher quality output
- Added support for PNG and JPEG formats with configurable quality
- Implemented title and subtitle inclusion in exported images
- Added automatic timestamp addition to exported filenames
- Created configurable background options for exported images
- Added styled export button with glass morphism effects
- Implemented custom export button rendering capabilities

#### 4. Improved Tooltip Experience
- Enhanced tooltip formatting with intelligent value display
- Added smart formatting for different value types in tooltip displays
- Improved tooltip positioning and z-index handling
- Added support for additional tooltip styles
- Enhanced tooltip animation with smoother entrance effects
- Implemented context-aware value formatting in tooltips

## Bug Fixes
- Fixed tooltip z-index issues to ensure proper layering
- Improved overflow handling to prevent content clipping
- Enhanced accessibility for screen readers and keyboard navigation
- Fixed animation sequencing for smoother visual transitions

## Import System Fixes
- Fixed critical issue with `createContext` import from styled-components by using React's createContext
- Added proper subpath exports for all package modules including `/mixins`, `/core`, and `/animations`
- Fixed the minimal bundle to correctly reference React's createContext API
- Added re-export files to ensure documented import patterns (`@veerone/galileo-glass-ui/mixins`, etc.) work correctly
- Fixed TypeScript type definitions for better IDE integration
- Ensured backward compatibility with existing import patterns

## Developer Experience
- Added comprehensive documentation for new formatting options
- Expanded props interface with TypeScript definitions for new features
- Improved code organization with separate utility files
- Added examples demonstrating the new capabilities

## Upgrade Instructions
This release is a version bump from 1.0.3. To upgrade:

```bash
npm install @veerone/galileo-glass-ui@1.0.4
```

To take advantage of the new formatting capabilities, update your chart datasets to include format types:

```jsx
const datasets = [
  {
    id: 'revenue',
    label: 'Revenue',
    formatType: 'currency',
    formatOptions: {
      currencySymbol: '$',
      compact: true
    },
    data: [...],
    // other properties
  }
];
```

## What's Next
We're continuing to enhance the Galileo Glass UI library with a focus on performance optimizations and additional interactive components. Stay tuned for future updates! 