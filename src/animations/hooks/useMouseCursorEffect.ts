/**
 * useMouseCursorEffect Hook
 * 
 * React hook for creating global cursor effects that influence multiple elements
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Types of cursor effects
 */
export type CursorEffectType = 
  | 'glow' 
  | 'ripple' 
  | 'trail' 
  | 'magnetic' 
  | 'repel' 
  | 'spotlight';

/**
 * Interface for cursor effect options
 */
export interface MouseCursorEffectOptions {
  /**
   * Type of cursor effect
   */
  type?: CursorEffectType;
  
  /**
   * Strength of the effect (higher = stronger)
   */
  strength?: number;
  
  /**
   * Radius of influence in pixels
   */
  radius?: number;
  
  /**
   * Color of the effect (for glow, trail, etc.)
   */
  color?: string;
  
  /**
   * Duration of the effect in milliseconds (for trail, ripple)
   */
  duration?: number;
  
  /**
   * Number of particles for trail effect
   */
  particleCount?: number;
  
  /**
   * Size of particles/elements for the effect
   */
  size?: number;
  
  /**
   * If true, will optimize for GPU acceleration
   */
  gpuAccelerated?: boolean;
  
  /**
   * CSS selector for elements to influence
   * If not provided, creates a standalone cursor effect
   */
  targetSelector?: string;
  
  /**
   * Z-index for the cursor effect elements
   */
  zIndex?: number;
}

/**
 * Type for cursor position
 */
interface CursorPosition {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  velocity: number;
  direction: number;
}

/**
 * Hook for creating global cursor effects
 * 
 * @param options - Cursor effect options
 * @returns Object with attached elements list, enable/disable functions, and cleanup
 */
export const useMouseCursorEffect = (options: MouseCursorEffectOptions = {}) => {
  const prefersReducedMotion = useReducedMotion();
  
  const {
    type = 'glow',
    strength = 1,
    radius = 150,
    color = 'rgba(255, 255, 255, 0.2)',
    duration = 1000,
    particleCount = 5,
    size = 20,
    gpuAccelerated = true,
    targetSelector,
    zIndex = 1000,
  } = options;
  
  // Adjusted values for reduced motion
  const adjustedStrength = prefersReducedMotion ? Math.min(strength * 0.3, 0.1) : strength;
  const adjustedParticleCount = prefersReducedMotion ? Math.min(particleCount, 2) : particleCount;
  
  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const effectElementsRef = useRef<HTMLElement[]>([]);
  const targetElementsRef = useRef<HTMLElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isActiveRef = useRef<boolean>(true);
  
  // State for cursor position
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    velocity: 0,
    direction: 0,
  });
  
  // Create container element for cursor effects
  const createContainer = useCallback(() => {
    // Don't create if we already have one or if we're targeting existing elements
    if (containerRef.current || targetSelector) return;
    
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = String(zIndex);
    container.style.overflow = 'hidden';
    
    document.body.appendChild(container);
    containerRef.current = container;
  }, [targetSelector, zIndex]);
  
  // Setup effect based on type
  const setupEffect = useCallback(() => {
    if (prefersReducedMotion && (type === 'trail' || type === 'ripple')) {
      // For highly motion-intensive effects, switch to a more subtle effect
      return setupGlowEffect();
    }
    
    switch (type) {
      case 'glow':
        return setupGlowEffect();
      case 'ripple':
        return setupRippleEffect();
      case 'trail':
        return setupTrailEffect();
      case 'magnetic':
        return setupMagneticEffect();
      case 'repel':
        return setupRepelEffect();
      case 'spotlight':
        return setupSpotlightEffect();
      default:
        return setupGlowEffect();
    }
  }, [type, prefersReducedMotion]);
  
  // Setup functions for different effect types
  const setupGlowEffect = useCallback(() => {
    // Clear existing elements
    effectElementsRef.current.forEach(el => el.remove());
    effectElementsRef.current = [];
    
    // If targeting existing elements, find them
    if (targetSelector) {
      targetElementsRef.current = Array.from(document.querySelectorAll(targetSelector)) as HTMLElement[];
      return;
    }
    
    // Otherwise create glow element
    const glow = document.createElement('div');
    glow.style.position = 'absolute';
    glow.style.borderRadius = '50%';
    glow.style.width = `${size * 2}px`;
    glow.style.height = `${size * 2}px`;
    glow.style.background = color;
    glow.style.boxShadow = `0 0 ${radius}px ${radius / 2}px ${color}`;
    glow.style.opacity = '0';
    glow.style.pointerEvents = 'none';
    
    if (gpuAccelerated) {
      glow.style.willChange = 'transform, opacity';
      glow.style.transform = 'translateZ(0)';
    }
    
    if (containerRef.current) {
      containerRef.current.appendChild(glow);
      effectElementsRef.current.push(glow);
    }
  }, [targetSelector, size, color, radius, gpuAccelerated]);
  
  const setupRippleEffect = useCallback(() => {
    // For ripple, we don't pre-create elements - they'll be created on click
    effectElementsRef.current.forEach(el => el.remove());
    effectElementsRef.current = [];
    
    // If targeting existing elements, find them
    if (targetSelector) {
      targetElementsRef.current = Array.from(document.querySelectorAll(targetSelector)) as HTMLElement[];
    }
  }, [targetSelector]);
  
  const setupTrailEffect = useCallback(() => {
    // Clear existing elements
    effectElementsRef.current.forEach(el => el.remove());
    effectElementsRef.current = [];
    
    // Create trail particles
    for (let i = 0; i < adjustedParticleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.borderRadius = '50%';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = color;
      particle.style.opacity = '0';
      particle.style.pointerEvents = 'none';
      
      if (gpuAccelerated) {
        particle.style.willChange = 'transform, opacity';
        particle.style.transform = 'translateZ(0)';
      }
      
      // Add custom data for trail effect
      particle.dataset.delay = String(i * (duration / adjustedParticleCount));
      
      if (containerRef.current) {
        containerRef.current.appendChild(particle);
        effectElementsRef.current.push(particle);
      }
    }
  }, [adjustedParticleCount, size, color, duration, gpuAccelerated]);
  
  const setupMagneticEffect = useCallback(() => {
    // For magnetic, we target existing elements
    if (targetSelector) {
      targetElementsRef.current = Array.from(document.querySelectorAll(targetSelector)) as HTMLElement[];
      
      // Add transition for smooth movement
      targetElementsRef.current.forEach(el => {
        el.style.transition = 'transform 0.2s ease-out';
        
        if (gpuAccelerated) {
          el.style.willChange = 'transform';
          el.style.transform = 'translateZ(0)';
        }
      });
    }
  }, [targetSelector, gpuAccelerated]);
  
  const setupRepelEffect = useCallback(() => {
    // Similar to magnetic but repels instead
    if (targetSelector) {
      targetElementsRef.current = Array.from(document.querySelectorAll(targetSelector)) as HTMLElement[];
      
      // Add transition for smooth movement
      targetElementsRef.current.forEach(el => {
        el.style.transition = 'transform 0.2s ease-out';
        
        if (gpuAccelerated) {
          el.style.willChange = 'transform';
          el.style.transform = 'translateZ(0)';
        }
      });
    }
  }, [targetSelector, gpuAccelerated]);
  
  const setupSpotlightEffect = useCallback(() => {
    // Clear existing elements
    effectElementsRef.current.forEach(el => el.remove());
    effectElementsRef.current = [];
    
    // Create spotlight element
    const spotlight = document.createElement('div');
    spotlight.style.position = 'absolute';
    spotlight.style.borderRadius = '50%';
    spotlight.style.width = `${radius * 2}px`;
    spotlight.style.height = `${radius * 2}px`;
    spotlight.style.background = 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)';
    spotlight.style.pointerEvents = 'none';
    spotlight.style.opacity = '0';
    
    if (gpuAccelerated) {
      spotlight.style.willChange = 'transform, opacity';
      spotlight.style.transform = 'translateZ(0)';
    }
    
    if (containerRef.current) {
      containerRef.current.appendChild(spotlight);
      effectElementsRef.current.push(spotlight);
    }
    
    // If targeting existing elements, find them
    if (targetSelector) {
      targetElementsRef.current = Array.from(document.querySelectorAll(targetSelector)) as HTMLElement[];
    }
  }, [radius, gpuAccelerated, targetSelector]);
  
  // Create ripple element on click
  const createRipple = useCallback((x: number, y: number) => {
    if (!containerRef.current || !isActiveRef.current) return;
    
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.borderRadius = '50%';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.background = color;
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.opacity = '1';
    ripple.style.pointerEvents = 'none';
    ripple.style.transition = `all ${duration}ms cubic-bezier(0.19, 1, 0.22, 1)`;
    
    containerRef.current.appendChild(ripple);
    
    // Trigger animation
    setTimeout(() => {
      ripple.style.transform = `translate(-50%, -50%) scale(${radius / 5})`;
      ripple.style.opacity = '0';
    }, 10);
    
    // Remove after animation completes
    setTimeout(() => {
      ripple.remove();
    }, duration);
  }, [color, radius, duration]);
  
  // Update effect based on mouse position
  const updateEffect = useCallback(() => {
    if (!isActiveRef.current) return;
    
    const { x, y, velocity } = cursorPosition;
    
    switch (type) {
      case 'glow':
        updateGlowEffect(x, y);
        break;
      case 'trail':
        updateTrailEffect(x, y);
        break;
      case 'magnetic':
        updateMagneticEffect(x, y);
        break;
      case 'repel':
        updateRepelEffect(x, y);
        break;
      case 'spotlight':
        updateSpotlightEffect(x, y);
        break;
    }
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(updateEffect);
  }, [cursorPosition, type]);
  
  // Update functions for different effect types
  const updateGlowEffect = useCallback((x: number, y: number) => {
    // If targeting existing elements, apply glow effect
    if (targetSelector && targetElementsRef.current.length > 0) {
      targetElementsRef.current.forEach(el => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distanceX = x - centerX;
        const distanceY = y - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // Apply glow based on distance
        if (distance < radius) {
          const intensity = (1 - distance / radius) * adjustedStrength;
          el.style.boxShadow = `0 0 ${radius / 2}px ${intensity * 20}px ${color}`;
          el.style.transition = 'box-shadow 0.3s ease-out';
        } else {
          el.style.boxShadow = '';
        }
      });
      return;
    }
    
    // Otherwise, move the glow element
    if (effectElementsRef.current.length > 0) {
      const glow = effectElementsRef.current[0];
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
      glow.style.transform = 'translate(-50%, -50%)';
      glow.style.opacity = '1';
    }
  }, [targetSelector, radius, adjustedStrength, color]);
  
  const updateTrailEffect = useCallback((x: number, y: number) => {
    if (effectElementsRef.current.length === 0) return;
    
    // Update each particle in the trail
    effectElementsRef.current.forEach((particle, index) => {
      const delay = parseInt(particle.dataset.delay || '0', 10);
      
      // Calculate position with delay
      setTimeout(() => {
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.opacity = ((adjustedParticleCount - index) / adjustedParticleCount) * 0.7;
        
        // Fade out
        setTimeout(() => {
          particle.style.opacity = '0';
        }, 100);
      }, delay);
    });
  }, [adjustedParticleCount]);
  
  const updateMagneticEffect = useCallback((x: number, y: number) => {
    if (targetElementsRef.current.length === 0) return;
    
    // Apply magnetic effect to targeted elements
    targetElementsRef.current.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = x - centerX;
      const distanceY = y - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Apply attraction based on distance
      if (distance < radius) {
        const pull = (1 - distance / radius) * adjustedStrength;
        const moveX = distanceX * pull;
        const moveY = distanceY * pull;
        
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      } else {
        el.style.transform = 'translate(0, 0)';
      }
    });
  }, [radius, adjustedStrength]);
  
  const updateRepelEffect = useCallback((x: number, y: number) => {
    if (targetElementsRef.current.length === 0) return;
    
    // Apply repel effect to targeted elements
    targetElementsRef.current.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = x - centerX;
      const distanceY = y - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Apply repulsion based on distance
      if (distance < radius) {
        const push = (1 - distance / radius) * adjustedStrength;
        const moveX = -distanceX * push; // Negative for repulsion
        const moveY = -distanceY * push; // Negative for repulsion
        
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      } else {
        el.style.transform = 'translate(0, 0)';
      }
    });
  }, [radius, adjustedStrength]);
  
  const updateSpotlightEffect = useCallback((x: number, y: number) => {
    // If targeting existing elements, apply spotlight effect
    if (targetSelector && targetElementsRef.current.length > 0) {
      targetElementsRef.current.forEach(el => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distanceX = x - centerX;
        const distanceY = y - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // Apply highlight based on distance
        if (distance < radius) {
          const brightness = 100 + ((1 - distance / radius) * adjustedStrength * 40);
          el.style.filter = `brightness(${brightness}%)`;
          el.style.transition = 'filter 0.3s ease-out';
        } else {
          el.style.filter = 'brightness(100%)';
        }
      });
      return;
    }
    
    // Otherwise move the spotlight element
    if (effectElementsRef.current.length > 0) {
      const spotlight = effectElementsRef.current[0];
      spotlight.style.left = `${x}px`;
      spotlight.style.top = `${y}px`;
      spotlight.style.transform = 'translate(-50%, -50%)';
      spotlight.style.opacity = '1';
    }
  }, [targetSelector, radius, adjustedStrength]);
  
  // Mouse event handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Update cursor position
    setCursorPosition(prev => {
      const newX = e.clientX;
      const newY = e.clientY;
      
      // Calculate velocity and direction
      const dx = newX - prev.x;
      const dy = newY - prev.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);
      const direction = Math.atan2(dy, dx);
      
      return {
        x: newX,
        y: newY,
        prevX: prev.x,
        prevY: prev.y,
        velocity,
        direction,
      };
    });
  }, []);
  
  const handleClick = useCallback((e: MouseEvent) => {
    if (type === 'ripple') {
      createRipple(e.clientX, e.clientY);
    }
  }, [type, createRipple]);
  
  // Setup effect
  useEffect(() => {
    createContainer();
    setupEffect();
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    if (type === 'ripple') {
      document.addEventListener('click', handleClick);
    }
    
    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(updateEffect);
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      if (type === 'ripple') {
        document.removeEventListener('click', handleClick);
      }
      
      // Remove cursor effect elements
      effectElementsRef.current.forEach(el => el.remove());
      effectElementsRef.current = [];
      
      // Reset target elements
      targetElementsRef.current.forEach(el => {
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.filter = '';
        el.style.transition = '';
        el.style.willChange = '';
      });
      
      // Remove container
      if (containerRef.current) {
        containerRef.current.remove();
        containerRef.current = null;
      }
    };
  }, [
    createContainer,
    setupEffect,
    handleMouseMove,
    handleClick,
    updateEffect,
    type
  ]);
  
  // Public API
  const enable = useCallback(() => {
    isActiveRef.current = true;
    
    // Restart animation if needed
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateEffect);
    }
  }, [updateEffect]);
  
  const disable = useCallback(() => {
    isActiveRef.current = false;
    
    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Reset target elements
    targetElementsRef.current.forEach(el => {
      el.style.transform = '';
      el.style.boxShadow = '';
      el.style.filter = '';
    });
    
    // Hide effect elements
    effectElementsRef.current.forEach(el => {
      el.style.opacity = '0';
    });
  }, []);
  
  const getAttachedElements = useCallback(() => {
    return targetElementsRef.current;
  }, []);
  
  return {
    enable,
    disable,
    getAttachedElements,
    cursorPosition
  };
};

export default useMouseCursorEffect;