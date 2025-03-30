import React from 'react';
import { PointerFollowExample } from '../animations/physics/examples/PointerFollowExample';

const PointerFollowDemo: React.FC = () => {
  return (
    <div className="example-container">
      <h1>Pointer Follow Demo</h1>
      <p>
        This demo shows how elements can follow the pointer with physics-based motion.
        Select between different behaviors and configurations to see how the system works.
      </p>
      
      <PointerFollowExample />
      
      <div className="example-description">
        <h2>How it works</h2>
        <p>
          The pointer following system uses inertial physics to create natural motion
          when elements follow the cursor. This creates a more engaging and fluid experience
          than simple direct following.
        </p>
        <h3>Features:</h3>
        <ul>
          <li>Single element following with various behaviors</li>
          <li>Group following with staggered motion</li>
          <li>Multiple following patterns (trail, radial, orbit, wave, zigzag)</li>
          <li>Physics-based rotation and scaling based on velocity</li>
          <li>Reduced motion support for accessibility</li>
          <li>Configurable physics parameters</li>
        </ul>
      </div>
    </div>
  );
};

export default PointerFollowDemo;