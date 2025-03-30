import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { usePointerFollow, FollowBehavior, FollowTransform } from '../usePointerFollow';
import { usePointerFollowGroup } from '../usePointerFollowGroup';
import { InertialPresets, InertialConfig } from '../inertialMovement';
import { accessibleAnimation } from '../../accessibility/accessibleAnimation';

// Styled components for the example
const ExampleContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  background-color: #f0f5ff;
  overflow: hidden;
  border-radius: 8px;
  touch-action: none;
  user-select: none;
`;

const ControlPanel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 8px;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FollowElement = styled.div<{ $transform: any, $color: string }>`
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition: transform 0.2s ease-out;
  transform: ${props => `
    translate(${props.$transform.x}px, ${props.$transform.y}px)
    rotate(${props.$transform.rotation}deg)
    scale(${props.$transform.scale})
  `};
`;

const GroupContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Button = styled.button`
  margin: 5px;
  padding: 8px 12px;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3451d1;
  }
  
  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  margin: 5px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

// Color palette for follower elements
const colors = [
  '#4a6cf7', '#f74a6c', '#4af7a6', '#f7d74a', 
  '#a64af7', '#f7a64a', '#4af7f7', '#f74af7'
];

// Component to demonstrate a single element following the pointer
const SingleFollowerDemo = () => {
  const [behavior, setBehavior] = useState<FollowBehavior>('momentum');
  const [physics, setPhysics] = useState<keyof typeof InertialPresets>('SMOOTH');
  
  const { ref, transform, isFollowing, startFollowing, stopFollowing } = usePointerFollow<HTMLDivElement>({
    behavior,
    physics,
    enableRotation: true,
    maxRotation: 25,
    enableScaling: true,
    minScale: 0.8,
    maxScale: 1.2,
  });
  
  return (
    <ExampleContainer>
      <ControlPanel>
        <h3>Single Element Following</h3>
        <div>
          <label>Behavior: </label>
          <Select value={behavior} onChange={e => setBehavior(e.target.value as FollowBehavior)}>
            <option value="direct">Direct</option>
            <option value="delayed">Delayed</option>
            <option value="springy">Springy</option>
            <option value="magnetic">Magnetic</option>
            <option value="orbit">Orbit</option>
            <option value="momentum">Momentum</option>
            <option value="elastic">Elastic</option>
          </Select>
        </div>
        <div>
          <label>Physics: </label>
          <Select value={physics} onChange={e => setPhysics(e.target.value as keyof typeof InertialPresets)}>
            <option value="SMOOTH">Smooth</option>
            <option value="BOUNCY">Bouncy</option>
            <option value="SLOW">Slow</option>
            <option value="INSTANT">Instant</option>
            <option value="RESPONSIVE">Responsive</option>
            <option value="MOMENTUM">Momentum</option>
          </Select>
        </div>
        <div>
          <Button onClick={startFollowing} disabled={isFollowing}>
            Start Following
          </Button>
          <Button onClick={stopFollowing} disabled={!isFollowing}>
            Stop Following
          </Button>
        </div>
      </ControlPanel>
      
      <FollowElement 
        ref={ref} 
        $transform={transform}
        $color="#4a6cf7"
      >
        1
      </FollowElement>
    </ExampleContainer>
  );
};

// Component to demonstrate a group of elements following the pointer
const GroupFollowerDemo = () => {
  const [count, setCount] = useState(5);
  const [delay, setDelay] = useState(80);
  const [behavior, setBehavior] = useState<FollowBehavior>('momentum');
  const [physics, setPhysics] = useState<keyof typeof InertialPresets>('SMOOTH');
  
  const { refs, transforms, isFollowing, startFollowing, stopFollowing } = usePointerFollowGroup({
    count,
    behavior,
    physics,
    staggerDelay: delay,
  });
  
  return (
    <ExampleContainer>
      <ControlPanel>
        <h3>Group Following</h3>
        <div>
          <label>Count: </label>
          <Select value={count} onChange={e => setCount(Number(e.target.value))}>
            {[3, 5, 8, 12].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </Select>
        </div>
        <div>
          <label>Delay (ms): </label>
          <Select value={delay} onChange={e => setDelay(Number(e.target.value))}>
            {[50, 80, 120, 200].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </Select>
        </div>
        <div>
          <label>Behavior: </label>
          <Select value={behavior} onChange={e => setBehavior(e.target.value as FollowBehavior)}>
            <option value="direct">Direct</option>
            <option value="delayed">Delayed</option>
            <option value="springy">Springy</option>
            <option value="momentum">Momentum</option>
            <option value="elastic">Elastic</option>
          </Select>
        </div>
        <div>
          <label>Physics: </label>
          <Select value={physics} onChange={e => setPhysics(e.target.value as keyof typeof InertialPresets)}>
            <option value="SMOOTH">Smooth</option>
            <option value="BOUNCY">Bouncy</option>
            <option value="SLOW">Slow</option>
            <option value="RESPONSIVE">Responsive</option>
            <option value="MOMENTUM">Momentum</option>
          </Select>
        </div>
        <div>
          <Button onClick={startFollowing} disabled={isFollowing}>
            Start Following
          </Button>
          <Button onClick={stopFollowing} disabled={!isFollowing}>
            Stop Following
          </Button>
        </div>
      </ControlPanel>
      
      {transforms.map((transform, index) => (
        <FollowElement 
          key={index}
          ref={refs[index]}
          $transform={transform}
          $color={colors[index % colors.length]}
        >
          {index + 1}
        </FollowElement>
      ))}
    </ExampleContainer>
  );
};

// Main example component that lets users switch between demos
export const PointerFollowExample: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'single' | 'group'>('single');
  
  return (
    <div>
      <h2>Pointer Follow Examples</h2>
      <p>
        These examples demonstrate physics-based pointer following animations.
        Elements follow your cursor with natural motion using various physics behaviors.
      </p>
      
      <GroupContainer>
        <div>
          <Button
            onClick={() => setActiveDemo('single')}
            disabled={activeDemo === 'single'}
          >
            Single Element Demo
          </Button>
          <Button
            onClick={() => setActiveDemo('group')}
            disabled={activeDemo === 'group'}
          >
            Group Elements Demo
          </Button>
        </div>
      </GroupContainer>
      
      {activeDemo === 'single' ? <SingleFollowerDemo /> : <GroupFollowerDemo />}
    </div>
  );
};