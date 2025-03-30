import React from 'react';
import { MagneticSnapExample } from '../animations/physics/examples/MagneticSnapExample';

const MagneticSnapDemo: React.FC = () => {
  return (
    <div className="example-container">
      <h1>Magnetic Snap Points and Alignment Guides Demo</h1>
      <p>
        This demo demonstrates the magnetic snap points and alignment guides system,
        allowing for precise element positioning with visual feedback. Elements snap
        to grid points, guide lines, and other elements using physics-based motion,
        creating an intuitive and natural-feeling layout experience.
      </p>
      
      <MagneticSnapExample />
      
      <div className="example-description">
        <h2>How It Works</h2>
        <p>
          The magnetic snap points system uses physics-based forces to attract elements
          to designated points, lines, grids, and other elements. When an element comes
          within a threshold distance of a snap point, a magnetic force pulls it into
          alignment, while visual guides appear to show the relationship.
        </p>
        
        <h3>Key Features:</h3>
        <ul>
          <li><strong>Physics-Based Snapping:</strong> Elements snap with natural-feeling momentum and inertia</li>
          <li><strong>Grid Snapping:</strong> Snap to a customizable grid for consistent spacing</li>
          <li><strong>Line Guides:</strong> Snap to horizontal and vertical alignment guides</li>
          <li><strong>Element Alignment:</strong> Snap to edges, centers, and corners of other elements</li>
          <li><strong>Visual Feedback:</strong> Dynamically rendered alignment guides with measurements</li>
          <li><strong>Accessibility:</strong> Fully supports reduced motion preferences</li>
          <li><strong>Customizable:</strong> Adjust snap strength, threshold distances, and visual appearance</li>
          <li><strong>React Integration:</strong> Easy to use hooks for adding to any React component</li>
        </ul>
        
        <h3>Implementation Details:</h3>
        <p>
          This system is implemented as a series of React hooks that handle different aspects
          of the magnetic layout system:
        </p>
        <ul>
          <li><code>useSnapPoints</code>: Core hook for physics-based snap point behavior</li>
          <li><code>useAlignmentGuides</code>: Visualizes magnetic connections with dynamic guides</li>
          <li><code>useMagneticLayout</code>: Combines snap points and guides for a complete solution</li>
        </ul>
        
        <p>
          The system supports multiple snap point types including points, grids, lines, and element edges,
          with configurable strength and threshold values for fine-tuned control over the snapping behavior.
        </p>
      </div>
    </div>
  );
};

export default MagneticSnapDemo;