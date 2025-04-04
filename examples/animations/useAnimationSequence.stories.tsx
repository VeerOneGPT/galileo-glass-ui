import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';
import { 
  useAnimationSequence,
  useReducedMotion,
  StaggerPattern,
  PlaybackState
} from '../../src/hooks';
import type { 
  PlaybackDirection,
  TimingRelationship,
  AnimationSequenceConfig, 
  AnimationStage
} from '../../src/hooks';
import { AnimationCategory } from '../../src/animations/accessibility/MotionSensitivity'; 

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
  border-radius: 8px;
  background: #f9f9f9;
  overflow: hidden;
  margin-bottom: 20px;
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

// The main component logic from the demo, adapted for Storybook
const AnimationSequenceStoryComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [appReducedMotion, setAppReducedMotion] = useState(prefersReducedMotion);
  const [elements, setElements] = useState<string[]>([]);
  const animationElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Update local state if system preference changes
  useEffect(() => {
    setAppReducedMotion(prefersReducedMotion);
  }, [prefersReducedMotion]);

  // Clear existing refs and map before creating new elements
  useEffect(() => {
    animationElementsRef.current.clear();
  }, []);

  // Add elements dynamically (adapted for Storybook/React lifecycle)
  useEffect(() => {
    const numElements = 10;
    const newElementIds: string[] = [];
    if (containerRef.current) {
        const currentElements = Array.from(containerRef.current.children);
        currentElements.forEach(child => child.remove()); // Clear previous elements
        animationElementsRef.current.clear(); // Clear refs

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
            element.style.opacity = '0'; // Start hidden
            element.style.transform = 'scale(0)';

            // Ensure container dimensions are available before positioning
            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight;
            if (containerWidth > 0 && containerHeight > 0) {
              element.style.left = `${Math.random() * (containerWidth - 50)}px`; // Use px
              element.style.top = `${Math.random() * (containerHeight - 50)}px`;  // Use px
            } // Fallback removed

            // Add null check before accessing current
            if (containerRef.current) { 
              containerRef.current.appendChild(element);
              animationElementsRef.current.set(id, element);
            }
        }
        setElements(newElementIds);
    }

    // Cleanup function remains similar
    return () => {
      // Add top-level null check for the ref in cleanup
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
  // Rerun effect if containerRef changes (though unlikely)
  }, [containerRef]);

  // Define the sequence configuration
  // Note: using 'properties' as per fix #16
  const sequenceConfig: Omit<AnimationSequenceConfig, 'id'> = {
    stages: [
      {
        id: 'initialization',
        type: 'style',
        targets: '.animation-element',
        properties: { opacity: 0, transform: 'scale(0)' },
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
    autoplay: false,
    repeatCount: 0,
    category: AnimationCategory.ATTENTION,
    onStart: () => console.log('Sequence started'),
    onComplete: () => console.log('Sequence completed')
  };

  // Use the hook
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
          
          <ToggleContainer>
            <ToggleSwitch 
              $checked={appReducedMotion}
              // Use onClick on the switch itself
              onClick={(e) => {
                e.preventDefault(); // Prevent label default behavior
                setAppReducedMotion(!appReducedMotion);
              }}
            />
            {/* Hidden checkbox for accessibility */}
            <input 
                type="checkbox" 
                checked={appReducedMotion} 
                onChange={() => setAppReducedMotion(!appReducedMotion)} 
                style={{ opacity: 0, position: 'absolute', zIndex: -1 }} 
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