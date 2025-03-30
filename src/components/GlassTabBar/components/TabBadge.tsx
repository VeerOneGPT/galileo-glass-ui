/**
 * TabBadge Component
 * 
 * Displays badges on tabs with various animation options.
 */
import React, { useState, useEffect } from 'react';
import { TabBadgeBase, AnimatedBadge } from '../styled';
import { TabBadgeProps, BadgeAnimationType, BadgeAnimationOptions } from '../types';

interface CountingBadgeProps {
  value: number;
  color: string;
  duration?: number;
  delay?: number;
  [key: string]: any;
}

/**
 * Badge with counting animation
 */
const CountingBadge: React.FC<CountingBadgeProps> = ({ 
  value, 
  color, 
  duration = 1000, 
  delay = 0,
  ...badgeProps 
}) => {
  const [count, setCount] = useState(0);
  const valueNumber = typeof value === 'number' ? value : (typeof value === 'string' ? parseInt(value) : 0) || 0;
  
  useEffect(() => {
    // Only animate if we already have a count and it's different
    if (count > 0 && valueNumber !== count) {
      // Handle count animation
      const startTime = Date.now() + delay;
      const startValue = count;
      const endValue = valueNumber;
      const difference = endValue - startValue;
      const frameRate = 1000 / 60; // 60fps
      
      let animationFrame: number;
      
      const animateCount = () => {
        const currentTime = Date.now();
        
        // Wait for delay
        if (currentTime < startTime) {
          animationFrame = requestAnimationFrame(animateCount);
          return;
        }
        
        const elapsed = currentTime - startTime;
        
        if (elapsed < duration) {
          // Linear progression
          const progress = elapsed / duration;
          const currentValue = Math.round(startValue + difference * progress);
          setCount(currentValue);
          animationFrame = requestAnimationFrame(animateCount);
        } else {
          // Animation complete
          setCount(endValue);
        }
      };
      
      animationFrame = requestAnimationFrame(animateCount);
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    } else {
      // Initial value
      setCount(valueNumber);
    }
  }, [valueNumber, delay, duration, count]);
  
  return (
    <TabBadgeBase $color={color} {...badgeProps}>
      {count}
    </TabBadgeBase>
  );
};

/**
 * Main TabBadge component with animation support
 */
const TabBadge: React.FC<TabBadgeProps> = ({ 
  value, 
  color, 
  animation,
  hidden,
  ...rest 
}) => {
  // Default values
  const animationType = typeof animation === 'string' ? animation : animation?.type || 'none';
  const duration = typeof animation === 'object' ? animation.duration || 1000 : 1000;
  const delay = typeof animation === 'object' ? animation.delay || 0 : 0;
  const loop = typeof animation === 'object' ? animation.loop || false : false;
  const count = typeof animation === 'object' ? animation.count : undefined;
  
  // Custom style props
  const customStyle = typeof animation === 'object' ? animation.style || {} : {};
  const {
    backgroundColor,
    color: textColor,
    borderColor,
    borderWidth,
    opacity,
    glowColor,
    glowIntensity,
    scale,
    boxShadow
  } = customStyle;
  
  // Generate common props
  const commonProps = {
    $color: color,
    $backgroundColor: backgroundColor,
    $textColor: textColor,
    $borderColor: borderColor,
    $borderWidth: borderWidth,
    $opacity: opacity,
    $scale: scale,
    $boxShadow: boxShadow,
    $hidden: hidden,
    ...rest
  };
  
  // Render based on animation type
  if (animationType === 'count' && typeof value === 'number') {
    return (
      <CountingBadge 
        value={value} 
        color={color} 
        duration={duration} 
        delay={delay}
        {...commonProps} 
      />
    );
  } else if (animationType !== 'none') {
    return (
      <AnimatedBadge
        $animationType={animationType as BadgeAnimationType}
        $duration={duration}
        $delay={delay}
        $loop={loop}
        $count={count}
        $glowColor={glowColor}
        $glowIntensity={glowIntensity}
        {...commonProps}
      >
        {value}
      </AnimatedBadge>
    );
  } else {
    // No animation
    return (
      <TabBadgeBase {...commonProps}>
        {value}
      </TabBadgeBase>
    );
  }
};

export default TabBadge;