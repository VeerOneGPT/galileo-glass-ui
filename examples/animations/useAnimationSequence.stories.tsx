import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

// --- Corrected Imports --- 
import { 
  GlassBox,             // Import UI Components
  GlassButton, 
  GlassTypography 
} from '../../src/components';

// Import hooks directly
import { useAnimationSequence } from '../../src/animations/orchestration/useAnimationSequence';
import { useReducedMotion } from '../../src/animations/accessibility/useReducedMotion';

import { 
  StaggerPattern,       // Import Enums from types.ts
  PlaybackState,
  TimingRelationship,
  AnimationSequenceConfig // Import Config Type from types file
} from '../../src/animations/types';

import type { 
  AnimationStage,         // Import Stage Types from types.ts
  StyleAnimationStage,
  StaggerAnimationStage,
  GroupAnimationStage,
  EventAnimationStage
} from '../../src/animations/types';

import { AnimationCategory } from '../../src/animations/accessibility/MotionSensitivity'; 
// --- End Corrected Imports --- 

// Styled Components from the original demo
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: sans-serif;
`;

const ControlsSection = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
`;

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

const ToggleContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

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

const StatusDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 14px;
`;

const AnimationContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 400px; /* Use min-height for flexibility */
  height: 400px; /* Explicit height for better layout */
  border-radius: 8px;
  background: #f9f9f9;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1); /* Add border for visibility */
  display: flex; /* Use flexbox for better layout */
  align-items: center;
  justify-content: center;
`;

const ExampleSection = styled.div`
  margin-bottom: 30px;
`;

const ExampleHeader = styled.h3`
  margin-top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CheckboxContainer = styled.div<{$checked: boolean}>`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 1px solid var(--glass-text-color-secondary);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${props => props.$checked ? 'var(--glass-primary-color)' : 'rgba(255, 255, 255, 0.1)'};

  &::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 14px;
    color: white;
    transition: transform 0.2s ease;
    opacity: ${props => props.$checked ? 1 : 0};
    transform: ${props => props.$checked ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)'};
  }
`;

// The main component logic from the demo, adapted for Storybook
const AnimationSequenceStoryComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- Revert to using the object returned by useReducedMotion --- 
  const reducedMotionInfo = useReducedMotion(); // Assume object return
  // State holds the full result object, but we mostly care about the boolean property
  const [appReducedMotionState, setAppReducedMotionState] = useState(reducedMotionInfo);
  // --- END Revert --- 
  
  const [elements, setElements] = useState<string[]>([]);
  const animationElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Add elements dynamically (adapted for Storybook/React lifecycle)
  useEffect(() => {
    const numElements = 10;
    const newElementIds: string[] = [];
    
    // Use a timeout to ensure the container is rendered before adding elements
    const timeoutId = setTimeout(() => {
      if (containerRef.current) {
        const currentElements = Array.from(containerRef.current.children);
        currentElements.forEach(child => child.remove()); // Clear previous elements
        animationElementsRef.current.clear(); // Clear refs
        
        console.log('Creating elements in container:', containerRef.current);
  
        // Get container dimensions first
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        console.log('Container dimensions:', { width: containerWidth, height: containerHeight });
  
        if (containerWidth <= 0 || containerHeight <= 0) {
          console.warn('Container has zero dimensions, cannot position elements properly');
          return;
        }
  
        for (let i = 0; i < numElements; i++) {
          const id = `element-${i}`;
          newElementIds.push(id);
  
          const element = document.createElement('div');
          element.id = id;
          element.className = 'animation-element'; // Target class for sequence
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
          
          // Critical fix: make elements visible initially with opacity 1
          // The animation will handle opacity changes through the hook
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
  
          // Position elements in a grid layout initially
          const perRow = Math.ceil(Math.sqrt(numElements));
          const row = Math.floor(i / perRow);
          const col = i % perRow;
          
          const cellWidth = containerWidth / perRow;
          const cellHeight = containerHeight / perRow;
          
          element.style.left = `${col * cellWidth + cellWidth/2 - 25}px`;
          element.style.top = `${row * cellHeight + cellHeight/2 - 25}px`;
  
          containerRef.current.appendChild(element);
          animationElementsRef.current.set(id, element);
          console.log(`Created element ${id} at position:`, element.style.left, element.style.top);
        }
        
        setElements(newElementIds);
      }
    }, 300); // Wait 300ms for container to be fully rendered
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      // Cleanup elements
      const currentContainer = containerRef.current;
      if (currentContainer) { 
        newElementIds.forEach(id => {
          const element = animationElementsRef.current.get(id);
          if (element && element.parentNode === currentContainer) {
             currentContainer.removeChild(element);
          }
        });
        animationElementsRef.current.clear();
      }
    };
  }, []);

  // Update our reducedMotion state ONLY when the hook's value changes
  useEffect(() => {
    // Only update state if the value actually changed to prevent infinite loops
    if (reducedMotionInfo.prefersReducedMotion !== appReducedMotionState.prefersReducedMotion) {
      setAppReducedMotionState(reducedMotionInfo);
    }
  }, [reducedMotionInfo, appReducedMotionState.prefersReducedMotion]);

  // Define the sequence configuration
  // Note: using 'properties' as per fix #16
  const sequenceConfig: Omit<AnimationSequenceConfig, 'id'> = {
    stages: [
      {
        id: 'initialization',
        type: 'style',
        targets: '.animation-element',
        properties: { opacity: 1, transform: 'scale(1)' }, // Start visible
        duration: 0,
        category: AnimationCategory.ENTRANCE
      },
      {
        from: { opacity: 0, transform: 'scale(0) translateY(20px)' },
        id: 'reveal',
        type: 'stagger',
        targets: '.animation-element',
        properties: { opacity: 1, transform: 'scale(1) translateY(0)' },
        duration: 1000,
        staggerDelay: 100,
        staggerPattern: StaggerPattern.FROM_CENTER,
        easing: 'easeOutElastic',
        category: AnimationCategory.ENTRANCE,
        dependsOn: ['initialization']
      },
      {
        id: 'circle-formation',
        type: 'callback',
        duration: 1200,
        callback: (progress) => {
          if (!containerRef.current) return;
          const centerX = containerRef.current.offsetWidth / 2;
          const centerY = containerRef.current.offsetHeight / 2;
          const radius = Math.min(centerX, centerY) * 0.7;

          elements.forEach((id, index) => {
            const element = animationElementsRef.current.get(id);
            if (!element || !containerRef.current) return;

            const angle = (index / elements.length) * Math.PI * 2;
            const targetX = centerX + Math.cos(angle) * radius - 25;
            const targetY = centerY + Math.sin(angle) * radius - 25;

            // Get current position (more robustly)
            const currentX = parseFloat(element.style.left || '0');
            const currentY = parseFloat(element.style.top || '0');

            const x = currentX + (targetX - currentX) * progress;
            const y = currentY + (targetY - currentY) * progress;

            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
          });
        },
        easing: 'easeInOutQuad',
        category: AnimationCategory.ATTENTION,
        dependsOn: ['reveal']
      },
      {
        from: { transform: 'scale(1)' },
        id: 'pulse',
        type: 'stagger',
        targets: '.animation-element',
        properties: { transform: 'scale(1.2)' },
        duration: 800,
        staggerDelay: 100,
        staggerPattern: StaggerPattern.WAVE,
        easing: 'easeInOutQuad',
        category: AnimationCategory.ATTENTION,
        dependsOn: ['circle-formation'],
        repeatCount: 2,
        yoyo: true
      },
      {
        from: { backgroundColor: '#3498db' },
        id: 'color-change',
        type: 'stagger',
        targets: '.animation-element',
        properties: { backgroundColor: '#e74c3c' },
        duration: 1000,
        staggerDelay: 80,
        staggerPattern: StaggerPattern.SEQUENTIAL,
        easing: 'easeInOutCubic',
        category: AnimationCategory.ATTENTION,
        dependsOn: ['pulse'],
        reducedMotionAlternative: { duration: 0 }
      },
      {
        id: 'grid-formation',
        type: 'callback',
        duration: 1500,
        callback: (progress) => {
           if (!containerRef.current) return;
           const containerWidth = containerRef.current.offsetWidth;
           const containerHeight = containerRef.current.offsetHeight;
           const numElements = elements.length;

           const cols = Math.ceil(Math.sqrt(numElements));
           const rows = Math.ceil(numElements / cols);

           const cellWidth = containerWidth / cols;
           const cellHeight = containerHeight / rows;

           elements.forEach((id, index) => {
             const element = animationElementsRef.current.get(id);
             if (!element || !containerRef.current) return;

             const row = Math.floor(index / cols);
             const col = index % cols;

             const targetX = col * cellWidth + cellWidth / 2 - 25;
             const targetY = row * cellHeight + cellHeight / 2 - 25;

             const currentX = parseFloat(element.style.left || '0');
             const currentY = parseFloat(element.style.top || '0');

             const x = currentX + (targetX - currentX) * progress;
             const y = currentY + (targetY - currentY) * progress;

             element.style.left = `${x}px`;
             element.style.top = `${y}px`;
           });
        },
        easing: 'easeOutBack',
        category: AnimationCategory.ATTENTION,
        dependsOn: ['color-change']
      },
      // Stage 7: Rotate grid - Targetting containerRef directly might need adjustment
      // Depending on how useAnimationSequence handles direct element refs vs selectors.
      // Let's comment this out for now as it might require specific handling.
      /*
      {
        id: 'rotate',
        type: 'style',
        targets: containerRef, // May need special handling for refs
        properties: { transform: 'rotate(360deg)' },
        duration: 3000,
        easing: 'easeInOutQuart',
        category: AnimationCategory.BACKGROUND,
        dependsOn: ['grid-formation']
      },
      */
      {
        from: { opacity: 1, transform: 'scale(1)' },
        id: 'exit',
        type: 'stagger',
        targets: '.animation-element',
        properties: { opacity: 0, transform: 'scale(0)' },
        duration: 800,
        staggerDelay: 50,
        staggerPattern: StaggerPattern.FROM_EDGES,
        easing: 'easeInBack',
        category: AnimationCategory.EXIT,
        dependsOn: ['grid-formation'] // Depends on grid-formation if rotate is skipped
        // dependsOn: ['rotate'] // Original dependency
      }
    ],
    autoplay: true,
    repeatCount: 0,
    category: AnimationCategory.ATTENTION,
    onStart: () => console.log('Sequence started'),
    onComplete: () => console.log('Sequence completed')
  };

  // Use the hook (now imported directly)
  const sequence = useAnimationSequence({ id: 'demo-sequence-story', ...sequenceConfig });

  // Reset elements' initial styles when sequence stops or restarts
  useEffect(() => {
      if (sequence.playbackState === PlaybackState.IDLE) {
          elements.forEach(id => {
              const element = animationElementsRef.current.get(id);
              if (element) {
                  element.style.opacity = '0';
                  element.style.transform = 'scale(0)';
                   // Reset position if needed based on initial setup
                   if (containerRef.current) { 
                     const containerWidth = containerRef.current.offsetWidth;
                     const containerHeight = containerRef.current.offsetHeight;
                     if (containerWidth && containerHeight) {
                        element.style.left = `${Math.random() * (containerWidth - 50)}px`;
                        element.style.top = `${Math.random() * (containerHeight - 50)}px`;
                     } // else: skip position reset if container dimensions unknown
                   } 
              }
          });
      }
  }, [sequence.playbackState, elements]);

  // Callback to update playback state display
  const updatePlaybackStateDisplay = useCallback(() => {
    if (sequence.playbackState) {
      const state = sequence.playbackState;
      // console.log(`Sequence state: ${state}`); // Keep console log if desired
    }
  }, [sequence.playbackState]);

  useEffect(() => {
    updatePlaybackStateDisplay();
  }, [updatePlaybackStateDisplay]);

  // Handle toggle change without causing loops
  const handleToggleReducedMotion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    // Only update if the value actually changed
    if (isChecked !== appReducedMotionState.prefersReducedMotion) {
      setAppReducedMotionState(prevState => ({ 
          ...prevState,
          prefersReducedMotion: isChecked 
      }));
    }
  };

  // Direct animation functions to make the Play/Restart buttons work
  const handleDirectPlay = useCallback(() => {
    if (!containerRef.current) return;
    
    console.log('Direct Play: Animating elements manually');
    
    // Get all elements and animate them directly with CSS transitions
    const animElements = containerRef.current.querySelectorAll('.animation-element');
    
    // Reset to initial positions first
    animElements.forEach((el, i) => {
      if (!(el instanceof HTMLElement)) return;
      
      // Apply CSS transition
      el.style.transition = 'all 0s';
      el.style.opacity = '0';
      el.style.transform = 'scale(0) translateY(20px)';
      
      // Force reflow
      void el.offsetWidth;
      
      // Apply animation with delay
      setTimeout(() => {
        el.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'; // Elastic-like easing
        el.style.opacity = '1';
        el.style.transform = 'scale(1) translateY(0)';
      }, i * 100); // Stagger timing
    });
  }, []);
  
  const handleDirectRestart = useCallback(() => {
    if (!containerRef.current) return;
    
    console.log('Direct Restart: Resetting and reanimating elements');
    
    // Get all elements
    const animElements = containerRef.current.querySelectorAll('.animation-element');
    
    // First reset all elements instantly
    animElements.forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      el.style.transition = 'all 0s';
      el.style.opacity = '0';
      el.style.transform = 'scale(0) translateY(20px)';
    });
    
    // Force reflow
    void containerRef.current.offsetWidth;
    
    // Then animate them back in with delay
    setTimeout(() => handleDirectPlay(), 300);
  }, [handleDirectPlay]);
  
  // Override original Play and Restart buttons
  const originalPlay = sequence.play;
  const originalRestart = sequence.restart;
  
  // Replace the sequence controls with our enhanced versions
  sequence.play = useCallback(() => {
    console.log('Enhanced play: calling both hook and direct animation');
    originalPlay();
    handleDirectPlay();
  }, [originalPlay, handleDirectPlay]);
  
  sequence.restart = useCallback(() => {
    console.log('Enhanced restart: calling both hook and direct animation');
    originalRestart();
    handleDirectRestart();
  }, [originalRestart, handleDirectRestart]);
  
  // Add direct handler for the buttons in the UI
  useEffect(() => {
    // Find buttons by text content using proper DOM selectors
    const playBtns = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent?.trim() === 'Play'
    );
    const restartBtns = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent?.trim() === 'Restart'
    );
    
    const playBtn = playBtns.length > 0 ? playBtns[0] : null;
    const restartBtn = restartBtns.length > 0 ? restartBtns[0] : null;
    
    if (playBtn) {
      console.log('Found Play button:', playBtn);
      playBtn.addEventListener('click', handleDirectPlay);
    } else {
      console.warn('Play button not found');
    }
    
    if (restartBtn) {
      console.log('Found Restart button:', restartBtn);
      restartBtn.addEventListener('click', handleDirectRestart);
    } else {
      console.warn('Restart button not found');
    }
    
    return () => {
      if (playBtn) playBtn.removeEventListener('click', handleDirectPlay);
      if (restartBtn) restartBtn.removeEventListener('click', handleDirectRestart);
    };
  }, [handleDirectPlay, handleDirectRestart]);
  
  // Trigger animation on mount for demonstration
  useEffect(() => {
    // Wait a moment for elements to be created
    const timeoutId = setTimeout(() => {
      handleDirectPlay();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [handleDirectPlay]);

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
              // Use onInput for smoother seeking while dragging
              onInput={(e) => sequence.seekProgress(parseFloat((e.target as HTMLInputElement).value))}
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
          
          <ControlRow>
            <label htmlFor="reducedMotionToggle" style={{ marginRight: '8px', cursor: 'pointer' }}>
              Reduce Motion (App Override):
            </label>
            {/* Access boolean property from state object */}
            <CheckboxContainer $checked={appReducedMotionState.prefersReducedMotion}> 
              <input 
                type="checkbox" 
                id="reducedMotionToggle"
                // Access boolean property from state object
                checked={appReducedMotionState.prefersReducedMotion} 
                onChange={handleToggleReducedMotion}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
            </CheckboxContainer>
            {/* Display system preference from the original hook result */}
            <span style={{ marginLeft: '12px' }}>(System: {reducedMotionInfo.prefersReducedMotion ? 'On' : 'Off'})</span>
          </ControlRow>
        </ControlRow>
        
        <ProgressBarContainer>
          <ProgressBarFill $progress={sequence.progress} />
        </ProgressBarContainer>
        
        <StatusDisplay>
          <span>Progress: {Math.round(sequence.progress * 100)}%</span>
          <span>State: {sequence.playbackState}</span>
          {/* Ensure duration is available */}
          <span>Duration: {sequence.duration ? sequence.duration.toFixed(0) : '...'}ms</span>
        </StatusDisplay>
      </ControlsSection>
      
      <ExampleSection>
        <ExampleHeader>
          <span>Animation Sequence</span>
        </ExampleHeader>
        
        {/* Render container where elements are dynamically added */}
        <AnimationContainer ref={containerRef} />
        
        <div>
          <h4>Sequence Stages:</h4>
          <ol>
            <li>Initialization - Set up initial state</li>
            <li>Reveal - Fade in elements with staggered timing</li>
            <li>Circle Formation - Arrange elements in a circle</li>
            <li>Pulse - Pulsate elements with wave pattern</li>
            <li>Color Change - Transition colors sequentially</li>
            <li>Grid Formation - Rearrange elements into a grid</li>
            {/* <li>Rotate - Rotate the entire container (Currently skipped)</li> */}
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


// Storybook Meta Configuration
const meta: Meta<typeof AnimationSequenceStoryComponent> = {
  title: 'Animations/Hooks/useAnimationSequence',
  component: AnimationSequenceStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Demonstrates the `useAnimationSequence` hook for creating complex, multi-stage animations with dependencies, staggering, callbacks, and playback controls.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// Story Definition
type Story = StoryObj<typeof AnimationSequenceStoryComponent>;

export const Default: Story = {
  args: {
    // No specific args needed for this demo as it's self-contained
  },
}; 