/**
 * Staggered Animation Demo
 * 
 * Demonstrates the staggered animation utilities with various distribution patterns,
 * directions, and grouping strategies.
 */

import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useStaggeredAnimation } from '../hooks/useStaggeredAnimation';
import {
  DistributionPattern,
  StaggerDirection,
  GroupingStrategy,
  DistributionEasing,
  ElementCategory,
  ElementPosition,
  StaggerTarget
} from '../animations/orchestration/StaggeredAnimations';

// Styled components
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
`;

const Description = styled.p`
  margin-bottom: 20px;
  line-height: 1.5;
`;

const DemoSection = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AnimationStage = styled.div`
  flex: 1;
  min-height: 400px;
  border-radius: 12px;
  background-color: #f5f5f5;
  position: relative;
  padding: 20px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
`;

const Controls = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ControlSection = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
`;

const ControlTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
`;

const Button = styled.button<{ $active?: boolean }>`
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: ${props => props.$active ? '#4287f5' : 'white'};
  color: ${props => props.$active ? 'white' : 'black'};
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: ${props => props.$active ? '#3a7add' : '#f0f0f0'};
  }
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  margin-top: 5px;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress * 100}%;
    background-color: #4287f5;
    transition: width 0.05s linear;
  }
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  
  label {
    flex: 1;
    margin-right: 10px;
  }
  
  input, select {
    flex: 2;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
`;

const ElementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const AnimationElement = styled.div<{ 
  $color: string;
  $category: string;
  $size?: string;
  $row?: number;
  $col?: number;
}>`
  width: ${props => props.$size || '60px'};
  height: ${props => props.$size || '60px'};
  background-color: ${props => props.$color};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &:after {
    content: '${props => props.$category}';
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 10px;
    background-color: rgba(0, 0, 0, 0.3);
    color: white;
    padding: 2px 4px;
    border-radius: 4px;
  }
`;

// Animation element props
interface ElementProps {
  id: string;
  row: number;
  col: number;
  color: string;
  category: string;
  delay?: number;
}

/**
 * Staggered Animation Demo Component
 */
const StaggeredAnimationDemo: React.FC = () => {
  // Animation configurations
  const [pattern, setPattern] = useState<DistributionPattern>(DistributionPattern.LINEAR);
  const [direction, setDirection] = useState<StaggerDirection>(StaggerDirection.TOP_DOWN);
  const [grouping, setGrouping] = useState<GroupingStrategy>(GroupingStrategy.NONE);
  const [easing, setEasing] = useState<DistributionEasing>(DistributionEasing.LINEAR);
  const [staggerDelay, setStaggerDelay] = useState<number>(50);
  const [duration, setDuration] = useState<number>(500);
  
  // Element refs
  const elementRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  
  // Generate grid of elements
  const rows = 4;
  const cols = 5;
  const elements: ElementProps[] = [];
  
  // Categories for grouping
  const categories: ElementCategory[] = [
    { id: 'A', name: 'Category A', order: 0 },
    { id: 'B', name: 'Category B', order: 1 },
    { id: 'C', name: 'Category C', order: 2 },
  ];
  
  // Colors for elements
  const colors = [
    '#4287f5', // blue - category A
    '#f542a7', // pink - category B
    '#42f5b3', // teal - category C
  ];
  
  // Generate elements in a grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const categoryIndex = (row + col) % 3;
      const category = categories[categoryIndex].id;
      const color = colors[categoryIndex];
      
      elements.push({
        id: `element-${row}-${col}`,
        row,
        col,
        color,
        category,
      });
    }
  }
  
  // Use the staggered animation hook
  const {
    registerRef,
    setTargets,
    setStaggerDelay: setHookStaggerDelay,
    setDuration: setHookDuration,
    setPattern: setHookPattern,
    setDirection: setHookDirection,
    setGrouping: setHookGrouping,
    setCategories: setHookCategories,
    setEasing: setHookEasing,
    play,
    cancel,
    isPlaying,
    progress,
    createAnimation
  } = useStaggeredAnimation({
    autoCreate: false,
    debug: true,
    respectReducedMotion: true,
    initialConfig: {
      animation: {
        keyframes: keyframes`
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        `,
        duration: 500,
        easing: 'ease-out',
        fillMode: 'forwards'
      }
    }
  });
  
  // Register element refs
  const setRef = (id: string, ref: HTMLDivElement | null) => {
    elementRefs.current.set(id, ref);
    registerRef(id, ref);
  };
  
  // Update animation config when settings change
  useEffect(() => {
    // Create stagger targets from element refs
    const targets: StaggerTarget[] = elements.map(element => {
      const ref = elementRefs.current.get(element.id);
      
      if (!ref) {
        return {
          element: `#${element.id}`,
          position: {
            row: element.row,
            col: element.col,
            x: element.col * 70,
            y: element.row * 70
          },
          category: element.category,
          include: true
        };
      }
      
      return {
        element: ref,
        position: {
          row: element.row,
          col: element.col,
          x: element.col * 70,
          y: element.row * 70
        },
        category: element.category,
        include: true
      };
    });
    
    // Update animation configuration
    setTargets(targets);
    setHookStaggerDelay(staggerDelay);
    setHookDuration(duration);
    setHookPattern(pattern);
    setHookDirection(direction);
    setHookGrouping(grouping);
    setHookCategories(categories);
    setHookEasing(easing);
    
    // Create animation with new settings
    createAnimation();
  }, [
    setTargets,
    setHookStaggerDelay,
    setHookDuration,
    setHookPattern,
    setHookDirection,
    setHookGrouping,
    setHookCategories,
    setHookEasing,
    createAnimation,
    staggerDelay,
    duration,
    pattern,
    direction,
    grouping,
    easing
  ]);
  
  // Reset elements when animation completes
  const resetElements = () => {
    elements.forEach(element => {
      const ref = elementRefs.current.get(element.id);
      
      if (ref) {
        ref.style.opacity = '0';
        ref.style.transform = 'scale(0.5)';
      }
    });
  };
  
  // Play animation
  const handlePlay = () => {
    // Reset elements first
    resetElements();
    
    // Play animation
    play();
  };
  
  return (
    <DemoContainer>
      <Title>Staggered Animation System</Title>
      <Description>
        This demo showcases the staggered animation system, which provides utilities for creating
        staggered animations across multiple elements, with fine-grained control over timing, 
        order, and distribution patterns.
      </Description>
      
      <DemoSection>
        <AnimationStage>
          <ElementGrid>
            {elements.map(element => (
              <AnimationElement
                key={element.id}
                id={element.id}
                ref={ref => setRef(element.id, ref)}
                $color={element.color}
                $category={element.category}
                $row={element.row}
                $col={element.col}
                style={{ opacity: 0, transform: 'scale(0.5)' }}
              >
                {element.row},{element.col}
              </AnimationElement>
            ))}
          </ElementGrid>
        </AnimationStage>
        
        <Controls>
          <ControlSection>
            <ControlTitle>Animation Controls</ControlTitle>
            <ButtonGrid>
              <Button onClick={handlePlay} disabled={isPlaying}>
                Play
              </Button>
              <Button onClick={cancel} disabled={!isPlaying}>
                Stop
              </Button>
            </ButtonGrid>
            <div>
              <div>Progress: {Math.round(progress * 100)}%</div>
              <ProgressBar $progress={progress} />
            </div>
          </ControlSection>
          
          <ControlSection>
            <ControlTitle>Timing Controls</ControlTitle>
            <ControlRow>
              <label htmlFor="staggerDelay">Stagger Delay (ms):</label>
              <input
                id="staggerDelay"
                type="number"
                min="0"
                max="500"
                step="10"
                value={staggerDelay}
                onChange={e => setStaggerDelay(Number(e.target.value))}
              />
            </ControlRow>
            <ControlRow>
              <label htmlFor="duration">Duration (ms):</label>
              <input
                id="duration"
                type="number"
                min="100"
                max="2000"
                step="100"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
              />
            </ControlRow>
          </ControlSection>
          
          <ControlSection>
            <ControlTitle>Distribution Pattern</ControlTitle>
            <ButtonGrid>
              {Object.values(DistributionPattern).map(p => (
                <Button
                  key={p}
                  $active={pattern === p}
                  onClick={() => setPattern(p)}
                >
                  {p.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </Button>
              ))}
            </ButtonGrid>
          </ControlSection>
          
          <ControlSection>
            <ControlTitle>Direction</ControlTitle>
            <ButtonGrid>
              {Object.values(StaggerDirection).filter(d => 
                d !== StaggerDirection.CUSTOM
              ).map(d => (
                <Button
                  key={d}
                  $active={direction === d}
                  onClick={() => setDirection(d)}
                >
                  {d.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </Button>
              ))}
            </ButtonGrid>
          </ControlSection>
          
          <ControlSection>
            <ControlTitle>Grouping Strategy</ControlTitle>
            <ButtonGrid>
              {Object.values(GroupingStrategy).filter(g => 
                g !== GroupingStrategy.CUSTOM
              ).map(g => (
                <Button
                  key={g}
                  $active={grouping === g}
                  onClick={() => setGrouping(g)}
                >
                  {g.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </Button>
              ))}
            </ButtonGrid>
          </ControlSection>
          
          <ControlSection>
            <ControlTitle>Easing</ControlTitle>
            <ButtonGrid>
              {Object.values(DistributionEasing).filter(e => 
                e !== DistributionEasing.CUSTOM
              ).map(e => (
                <Button
                  key={e}
                  $active={easing === e}
                  onClick={() => setEasing(e)}
                >
                  {e.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </Button>
              ))}
            </ButtonGrid>
          </ControlSection>
        </Controls>
      </DemoSection>
    </DemoContainer>
  );
};

export default StaggeredAnimationDemo;