/**
 * AnimationSequenceDemo.tsx
 * 
 * Demonstrates the use of animation sequences to create complex, coordinated
 * animations with precise timing and dependencies.
 */

import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  useAnimationSequence,
  PlaybackDirection,
  StaggerPattern,
  TimingRelationship,
  PlaybackState
} from '../animations/orchestration/useAnimationSequence';
import { useReducedMotion } from '../animations/accessibility/useReducedMotion';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';

// Demo container
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

// Controls section
const ControlsSection = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

// Control row
const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
`;

// Button
const Button = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#3498db' : '#f1f1f1'};
  color: ${props => props.$primary ? 'white' : 'black'};
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: ${props => props.$primary ? 'bold' : 'normal'};
  
  &:hover {
    background: ${props => props.$primary ? '#2980b9' : '#e1e1e1'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Toggle switch container
const ToggleContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

// Toggle switch
const ToggleSwitch = styled.div<{ $checked: boolean }>`
  position: relative;
  width: 40px;
  height: 20px;
  background: ${({ $checked }) => $checked ? '#4CAF50' : '#ccc'};
  border-radius: 20px;
  transition: background 0.3s;
  margin-right: 10px;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $checked }) => $checked ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    transition: left 0.3s;
  }
`;

// Progress bar
const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background: #eee;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 10px;
`;

const ProgressBarFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress * 100}%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 5px;
  transition: width 0.1s linear;
`;

// Status display
const StatusDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 14px;
`;

// Animation container
const AnimationContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 8px;
  background: #f9f9f9;
  overflow: hidden;
  margin-bottom: 20px;
`;

// Animation element
const AnimationShape = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

// Example section
const ExampleSection = styled.div`
  margin-bottom: 30px;
`;

// Example header
const ExampleHeader = styled.h3`
  margin-top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Animation sequence demo component
export const AnimationSequenceDemo: React.FC = () => {
  // Container ref
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reduced motion check
  const { prefersReducedMotion, setAppReducedMotion, appReducedMotion } = useReducedMotion();
  
  // Animation elements
  const [elements, setElements] = useState<string[]>([]);
  
  // Add elements to the container
  useEffect(() => {
    if (containerRef.current) {
      // Create elements
      const newElements: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        const id = `element-${i}`;
        
        // Create element if it doesn't exist
        if (!document.getElementById(id)) {
          const element = document.createElement('div');
          element.id = id;
          element.className = 'animation-element';
          element.style.width = '50px';
          element.style.height = '50px';
          element.style.borderRadius = '50%';
          element.style.position = 'absolute';
          element.style.backgroundColor = '#3498db';
          element.style.display = 'flex';
          element.style.alignItems = 'center';
          element.style.justifyContent = 'center';
          element.style.color = 'white';
          element.style.fontWeight = 'bold';
          element.textContent = String(i + 1);
          
          // Random position within container
          element.style.left = `${Math.random() * 80 + 10}%`;
          element.style.top = `${Math.random() * 80 + 10}%`;
          
          containerRef.current.appendChild(element);
        }
        
        newElements.push(id);
      }
      
      setElements(newElements);
    }
    
    // Clean up on unmount
    return () => {
      if (containerRef.current) {
        elements.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.remove();
          }
        });
      }
    };
  }, [elements.length]);
  
  // Create animation sequence
  const sequence = useAnimationSequence({
    id: 'demo-sequence',
    stages: [
      // Stage 1: Initialize elements with opacity 0
      {
        id: 'initialization',
        type: 'style',
        targets: '.animation-element',
        from: { opacity: 0, transform: 'scale(0)' },
        to: { opacity: 0, transform: 'scale(0)' },
        duration: 0,
        category: AnimationCategory.ENTRANCE
      },
      
      // Stage 2: Reveal elements one by one
      {
        id: 'reveal',
        type: 'stagger',
        targets: '.animation-element',
        from: { opacity: 0, transform: 'scale(0) translateY(20px)' },
        to: { opacity: 1, transform: 'scale(1) translateY(0)' },
        duration: 1000,
        staggerDelay: 100,
        staggerPattern: StaggerPattern.FROM_CENTER,
        easing: 'easeOutElastic',
        category: AnimationCategory.ENTRANCE,
        dependsOn: ['initialization']
      },
      
      // Stage 3: Move elements to circle formation
      {
        id: 'circle-formation',
        type: 'callback',
        duration: 1200,
        callback: (progress) => {
          const elements = document.querySelectorAll('.animation-element');
          const centerX = containerRef.current ? containerRef.current.offsetWidth / 2 : 300;
          const centerY = containerRef.current ? containerRef.current.offsetHeight / 2 : 200;
          const radius = Math.min(centerX, centerY) * 0.7;
          
          elements.forEach((element, index) => {
            const angle = (index / elements.length) * Math.PI * 2;
            const targetX = centerX + Math.cos(angle) * radius - 25; // Adjust for element size
            const targetY = centerY + Math.sin(angle) * radius - 25; // Adjust for element size
            
            // Get current position
            const rect = element.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();
            
            if (!containerRect) return;
            
            const currentX = rect.left - containerRect.left;
            const currentY = rect.top - containerRect.top;
            
            // Interpolate position
            const x = currentX + (targetX - currentX) * progress;
            const y = currentY + (targetY - currentY) * progress;
            
            // Apply new position
            (element as HTMLElement).style.left = `${x}px`;
            (element as HTMLElement).style.top = `${y}px`;
          });
        },
        easing: 'easeInOutQuad',
        category: AnimationCategory.ATTENTION,
        dependsOn: ['reveal']
      },
      
      // Stage 4: Pulsate elements
      {
        id: 'pulse',
        type: 'stagger',
        targets: '.animation-element',
        from: { transform: 'scale(1)' },
        to: { transform: 'scale(1.2)' },
        duration: 800,
        staggerDelay: 100,
        staggerPattern: StaggerPattern.WAVE,
        easing: 'easeInOutQuad',
        category: AnimationCategory.ATTENTION,
        dependsOn: ['circle-formation'],
        repeatCount: 2,
        yoyo: true
      },
      
      // Stage 5: Change colors
      {
        id: 'color-change',
        type: 'stagger',
        targets: '.animation-element',
        from: { backgroundColor: '#3498db' },
        to: { backgroundColor: '#e74c3c' },
        duration: 1000,
        staggerDelay: 80,
        staggerPattern: StaggerPattern.SEQUENTIAL,
        easing: 'easeInOutCubic',
        category: AnimationCategory.ATTENTION,
        dependsOn: ['pulse'],
        reducedMotionAlternative: {
          duration: 0,
        }
      },
      
      // Stage 6: Rearrange to grid
      {
        id: 'grid-formation',
        type: 'callback',
        duration: 1500,
        callback: (progress) => {
          const elements = document.querySelectorAll('.animation-element');
          const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 600;
          const containerHeight = containerRef.current ? containerRef.current.offsetHeight : 400;
          
          const cols = Math.ceil(Math.sqrt(elements.length));
          const rows = Math.ceil(elements.length / cols);
          
          const cellWidth = containerWidth / cols;
          const cellHeight = containerHeight / rows;
          
          elements.forEach((element, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            const targetX = col * cellWidth + cellWidth / 2 - 25; // Center in cell
            const targetY = row * cellHeight + cellHeight / 2 - 25; // Center in cell
            
            // Get current position
            const rect = element.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();
            
            if (!containerRect) return;
            
            const currentX = rect.left - containerRect.left;
            const currentY = rect.top - containerRect.top;
            
            // Interpolate position
            const x = currentX + (targetX - currentX) * progress;
            const y = currentY + (targetY - currentY) * progress;
            
            // Apply new position
            (element as HTMLElement).style.left = `${x}px`;
            (element as HTMLElement).style.top = `${y}px`;
          });
        },
        easing: 'easeOutBack',
        category: AnimationCategory.ATTENTION,
        dependsOn: ['color-change']
      },
      
      // Stage 7: Rotate grid
      {
        id: 'rotate',
        type: 'style',
        targets: containerRef.current,
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
        duration: 3000,
        easing: 'easeInOutQuart',
        category: AnimationCategory.BACKGROUND,
        dependsOn: ['grid-formation']
      },
      
      // Stage 8: Final exit
      {
        id: 'exit',
        type: 'stagger',
        targets: '.animation-element',
        from: { opacity: 1, transform: 'scale(1)' },
        to: { opacity: 0, transform: 'scale(0)' },
        duration: 800,
        staggerDelay: 50,
        staggerPattern: StaggerPattern.FROM_EDGES,
        easing: 'easeInBack',
        category: AnimationCategory.EXIT,
        dependsOn: ['rotate']
      }
    ],
    autoplay: false,
    repeatCount: 0,
    category: AnimationCategory.ATTENTION,
    onStart: () => console.log('Sequence started'),
    onComplete: () => console.log('Sequence completed')
  });
  
  return (
    <DemoContainer>
      <h2>Animation Sequence Demo</h2>
      <p>
        This demo showcases the animation sequencing system for coordinated animations
        with precise timing and dependencies. The system enables complex animation
        choreography with stages that can depend on one another.
      </p>
      
      <ControlsSection>
        <h3>Animation Controls</h3>
        
        <ControlRow>
          <Button 
            $primary 
            onClick={sequence.play}
            disabled={sequence.playbackState === PlaybackState.PLAYING}
          >
            Play
          </Button>
          
          <Button 
            onClick={sequence.pause}
            disabled={sequence.playbackState !== PlaybackState.PLAYING}
          >
            Pause
          </Button>
          
          <Button 
            onClick={sequence.stop}
            disabled={sequence.playbackState === PlaybackState.IDLE}
          >
            Stop
          </Button>
          
          <Button onClick={sequence.restart}>
            Restart
          </Button>
          
          <Button onClick={sequence.reverse}>
            Reverse
          </Button>
        </ControlRow>
        
        <ControlRow>
          <div style={{ flex: 1 }}>
            <label htmlFor="seek-slider">Seek:</label>
            <input
              id="seek-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sequence.progress}
              onChange={(e) => sequence.seekProgress(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label htmlFor="speed-slider">Speed:</label>
            <input
              id="speed-slider"
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              defaultValue="1"
              onChange={(e) => sequence.setPlaybackRate(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          
          <ToggleContainer>
            <ToggleSwitch 
              $checked={appReducedMotion}
              onClick={() => setAppReducedMotion(!appReducedMotion)}
            />
            <span>Reduced Motion</span>
          </ToggleContainer>
        </ControlRow>
        
        <ProgressBarContainer>
          <ProgressBarFill $progress={sequence.progress} />
        </ProgressBarContainer>
        
        <StatusDisplay>
          <span>Progress: {Math.round(sequence.progress * 100)}%</span>
          <span>State: {sequence.playbackState}</span>
          <span>Duration: {sequence.duration}ms</span>
        </StatusDisplay>
      </ControlsSection>
      
      <ExampleSection>
        <ExampleHeader>
          <span>Animation Sequence</span>
        </ExampleHeader>
        
        <AnimationContainer ref={containerRef}>
          {/* Animation elements will be added here dynamically */}
        </AnimationContainer>
        
        <div>
          <h4>Sequence Stages:</h4>
          <ol>
            <li>Initialization - Set up initial state</li>
            <li>Reveal - Fade in elements with staggered timing</li>
            <li>Circle Formation - Arrange elements in a circle</li>
            <li>Pulse - Pulsate elements with wave pattern</li>
            <li>Color Change - Transition colors sequentially</li>
            <li>Grid Formation - Rearrange elements into a grid</li>
            <li>Rotate - Rotate the entire container</li>
            <li>Exit - Elements fade out from edges to center</li>
          </ol>
        </div>
      </ExampleSection>
      
      <ExampleSection>
        <h3>Features Demonstrated</h3>
        <ul>
          <li><strong>Dependency Resolution</strong> - Animations wait for predecessors to complete</li>
          <li><strong>Staggered Animations</strong> - Elements animate with coordinated delays</li>
          <li><strong>Multiple Patterns</strong> - FROM_CENTER, WAVE, SEQUENTIAL, FROM_EDGES patterns</li>
          <li><strong>Callback Animations</strong> - Complex animations via progress callbacks</li>
          <li><strong>Playback Controls</strong> - Play, pause, stop, reverse, and seek</li>
          <li><strong>Reduced Motion Alternatives</strong> - Respect user preferences</li>
          <li><strong>Yoyo Repetition</strong> - Animations can alternate direction</li>
          <li><strong>Variable Playback Rate</strong> - Speed up or slow down animations</li>
        </ul>
      </ExampleSection>
      
      <ExampleSection>
        <h3>Common Use Cases</h3>
        <ol>
          <li><strong>Page Transitions</strong> - Coordinate exit and entrance animations</li>
          <li><strong>Data Visualization</strong> - Animate charts and graphs with sequenced reveals</li>
          <li><strong>UI Interactions</strong> - Create cohesive feedback across multiple elements</li>
          <li><strong>Onboarding Flows</strong> - Guide attention with carefully timed animations</li>
          <li><strong>Loading Sequences</strong> - Create engaging loading experiences</li>
          <li><strong>Multi-step Forms</strong> - Animate between form sections</li>
        </ol>
      </ExampleSection>
    </DemoContainer>
  );
};

export default AnimationSequenceDemo;