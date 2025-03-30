/**
 * useGameParticles.ts
 * 
 * React hook for using game particle effects in Galileo Glass UI components.
 * Provides a simple interface for adding dynamic particle effects to any component.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { AnimationCategory } from '../accessibility/MotionSensitivity';
import { 
  GameParticleSystem, 
  GameEventType, 
  ParticleEmitterConfig,
  GameParticleSystemConfig,
  EmitterShape,
  ParticleShape,
  ParticleAnimationType,
  Particle
} from './GameParticleSystem';

/**
 * Configuration for useGameParticles hook
 */
export interface GameParticlesHookConfig {
  /** Element to attach particles to */
  containerRef?: React.RefObject<HTMLElement>;
  
  /** Default event type */
  defaultEventType?: GameEventType;
  
  /** Particle system configuration */
  systemConfig?: Partial<GameParticleSystemConfig>;
  
  /** If true, particles will be created immediately on mount */
  autoStart?: boolean;
  
  /** Callback when system is ready */
  onReady?: () => void;
  
  /** Callback when system is complete (all particles finished) */
  onComplete?: () => void;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
  
  /** Prevent particles from leaving container boundaries */
  boundToContainer?: boolean;
}

/**
 * Actions available for controlling game particles
 */
export interface GameParticlesActions {
  /** Trigger a burst of particles at a specific position */
  burst: (
    position: { x: number, y: number } | MouseEvent | React.MouseEvent, 
    config?: Partial<GameParticleSystemConfig>
  ) => void;
  
  /** Create a trail effect following an element */
  createTrail: (
    element: HTMLElement | string, 
    config?: Partial<GameParticleSystemConfig>
  ) => string;
  
  /** Trigger a preset event effect */
  triggerEvent: (
    eventType: GameEventType, 
    position: { x: number, y: number } | MouseEvent | React.MouseEvent
  ) => void;
  
  /** Add a new emitter */
  addEmitter: (config: ParticleEmitterConfig) => string;
  
  /** Remove an emitter */
  removeEmitter: (id: string) => boolean;
  
  /** Update an emitter */
  updateEmitter: (id: string, updates: Partial<ParticleEmitterConfig>) => boolean;
  
  /** Start the particle system */
  start: () => void;
  
  /** Stop the particle system */
  stop: () => void;
  
  /** Pause the particle system */
  pause: () => void;
  
  /** Resume the particle system */
  resume: () => void;
  
  /** Trigger a specific game event at cursor position */
  handleEvent: (
    e: MouseEvent | React.MouseEvent, 
    eventType?: GameEventType
  ) => void;
  
  /** Create event handlers for common events */
  createHandlers: () => {
    onClick: (e: React.MouseEvent) => void;
    onHover: (e: React.MouseEvent) => void;
    onSuccess: () => void;
    onError: () => void;
    onCollect: (e: React.MouseEvent) => void;
  };
}

/**
 * Result of the useGameParticles hook
 */
export interface GameParticlesResult {
  /** Is the system active */
  isActive: boolean;
  
  /** Is the system paused */
  isPaused: boolean;
  
  /** Is reduced motion active */
  reducedMotion: boolean;
  
  /** Reference to the particle system */
  system: GameParticleSystem | null;
  
  /** Actions for controlling particles */
  actions: GameParticlesActions;
}

/**
 * Extract position from a mouse event or position object
 */
function getPositionFromEvent(event: { x: number, y: number } | MouseEvent | React.MouseEvent): { x: number, y: number } {
  if ('clientX' in event && 'clientY' in event) {
    return { x: event.clientX, y: event.clientY };
  }
  return event;
}

/**
 * Hook for using game particle effects in React components
 * 
 * @param config Hook configuration
 * @returns Particle system controls and actions
 */
export function useGameParticles(config: GameParticlesHookConfig = {}): GameParticlesResult {
  // Extract config with defaults
  const {
    containerRef,
    defaultEventType = GameEventType.SPARKLE,
    systemConfig = {},
    autoStart = false,
    onReady,
    onComplete,
    category = AnimationCategory.GAME,
    boundToContainer = true
  } = config;
  
  // Reduced motion support
  const { prefersReducedMotion, isAnimationAllowed } = useReducedMotion();
  
  // Particle system reference
  const systemRef = useRef<GameParticleSystem | null>(null);
  
  // System state
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  
  // Initialize the particle system
  useEffect(() => {
    // Create container element if needed
    let container: HTMLElement | null = null;
    if (containerRef && containerRef.current) {
      container = containerRef.current;
    }
    
    // Calculate boundaries if bounded to container
    let boundaries = systemConfig.boundaries;
    if (boundToContainer && container) {
      const rect = container.getBoundingClientRect();
      boundaries = {
        left: rect.left,
        right: rect.left + rect.width,
        top: rect.top,
        bottom: rect.top + rect.height
      };
    }
    
    // Create system configuration
    const finalConfig: GameParticleSystemConfig = {
      ...systemConfig,
      eventType: defaultEventType,
      container,
      boundaries,
      category,
      reducedMotion: prefersReducedMotion,
      onReady,
      onComplete: () => {
        setIsActive(false);
        if (onComplete) onComplete();
      }
    };
    
    // Create particle system
    systemRef.current = new GameParticleSystem(finalConfig);
    
    // Start if autoStart is true
    if (autoStart) {
      systemRef.current.start();
      setIsActive(true);
    }
    
    // Cleanup on unmount
    return () => {
      if (systemRef.current) {
        systemRef.current.dispose();
        systemRef.current = null;
      }
    };
  }, []);
  
  /**
   * Start the particle system
   */
  const start = useCallback(() => {
    if (!systemRef.current) return;
    
    systemRef.current.start();
    setIsActive(true);
    setIsPaused(false);
  }, []);
  
  /**
   * Stop the particle system
   */
  const stop = useCallback(() => {
    if (!systemRef.current) return;
    
    systemRef.current.stop();
    setIsActive(false);
    setIsPaused(false);
  }, []);
  
  /**
   * Pause the particle system
   */
  const pause = useCallback(() => {
    if (!systemRef.current) return;
    
    systemRef.current.pause();
    setIsPaused(true);
  }, []);
  
  /**
   * Resume the particle system
   */
  const resume = useCallback(() => {
    if (!systemRef.current) return;
    
    systemRef.current.resume();
    setIsPaused(false);
  }, []);
  
  /**
   * Trigger a burst of particles
   */
  const burst = useCallback((
    positionOrEvent: { x: number, y: number } | MouseEvent | React.MouseEvent, 
    burstConfig: Partial<GameParticleSystemConfig> = {}
  ) => {
    if (!systemRef.current) return;
    
    const position = getPositionFromEvent(positionOrEvent);
    
    // If reduced motion is preferred, use minimal particles
    const adjustedConfig = prefersReducedMotion ? {
      ...burstConfig,
      emitters: burstConfig.emitters ? [{
        ...burstConfig.emitters[0],
        burstCount: Math.floor((burstConfig.emitters[0].burstCount || 10) * 0.3),
      }] : undefined
    } : burstConfig;
    
    // Trigger burst
    systemRef.current.burst(position, adjustedConfig);
    setIsActive(true);
  }, [prefersReducedMotion]);
  
  /**
   * Create a trail effect
   */
  const createTrail = useCallback((
    element: HTMLElement | string, 
    trailConfig: Partial<GameParticleSystemConfig> = {}
  ) => {
    if (!systemRef.current) return '';
    
    // If reduced motion is preferred, use minimal particles
    const adjustedConfig = prefersReducedMotion ? {
      ...trailConfig,
      emitters: trailConfig.emitters ? [{
        ...trailConfig.emitters[0],
        rate: Math.floor((trailConfig.emitters[0].rate || 15) * 0.3),
      }] : undefined
    } : trailConfig;
    
    // Create trail
    const emitterId = systemRef.current.createTrail(element, adjustedConfig);
    setIsActive(true);
    return emitterId;
  }, [prefersReducedMotion]);
  
  /**
   * Trigger a preset event
   */
  const triggerEvent = useCallback((
    eventType: GameEventType, 
    positionOrEvent: { x: number, y: number } | MouseEvent | React.MouseEvent
  ) => {
    if (!systemRef.current) return;
    
    const position = getPositionFromEvent(positionOrEvent);
    
    // Trigger event
    systemRef.current.triggerEvent(eventType, position);
    setIsActive(true);
  }, []);
  
  /**
   * Add a new emitter
   */
  const addEmitter = useCallback((config: ParticleEmitterConfig) => {
    if (!systemRef.current) return '';
    
    // If reduced motion is preferred, adjust emitter configuration
    const adjustedConfig = prefersReducedMotion ? {
      ...config,
      rate: config.rate ? Math.floor(config.rate * 0.3) : config.rate,
      burstCount: config.burstCount ? Math.floor(config.burstCount * 0.3) : config.burstCount,
    } : config;
    
    // Add emitter
    const emitterId = systemRef.current.addEmitter(adjustedConfig);
    setIsActive(true);
    return emitterId;
  }, [prefersReducedMotion]);
  
  /**
   * Remove an emitter
   */
  const removeEmitter = useCallback((id: string) => {
    if (!systemRef.current) return false;
    
    return systemRef.current.removeEmitter(id);
  }, []);
  
  /**
   * Update an emitter
   */
  const updateEmitter = useCallback((id: string, updates: Partial<ParticleEmitterConfig>) => {
    if (!systemRef.current) return false;
    
    return systemRef.current.updateEmitter(id, updates);
  }, []);
  
  /**
   * Handle mouse events
   */
  const handleEvent = useCallback((
    e: MouseEvent | React.MouseEvent, 
    eventType: GameEventType = defaultEventType
  ) => {
    if (!isAnimationAllowed(category)) return;
    
    // Trigger event at cursor position
    triggerEvent(eventType, e);
  }, [defaultEventType, category, isAnimationAllowed, triggerEvent]);
  
  /**
   * Create common event handlers
   */
  const createHandlers = useCallback(() => {
    return {
      onClick: (e: React.MouseEvent) => handleEvent(e, GameEventType.SPARKLE),
      onHover: (e: React.MouseEvent) => handleEvent(e, GameEventType.TRAIL),
      onSuccess: () => {
        if (!systemRef.current || !containerRef?.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        triggerEvent(GameEventType.SUCCESS, position);
      },
      onError: () => {
        if (!systemRef.current || !containerRef?.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        triggerEvent(GameEventType.ERROR, position);
      },
      onCollect: (e: React.MouseEvent) => handleEvent(e, GameEventType.COLLECT)
    };
  }, [handleEvent, containerRef, triggerEvent]);
  
  // Assemble result
  return {
    isActive,
    isPaused,
    reducedMotion: prefersReducedMotion,
    system: systemRef.current,
    actions: {
      burst,
      createTrail,
      triggerEvent,
      addEmitter,
      removeEmitter,
      updateEmitter,
      start,
      stop,
      pause,
      resume,
      handleEvent,
      createHandlers
    }
  };
}

// Export event types and shapes for easier consumption
export { 
  GameEventType, 
  EmitterShape, 
  ParticleShape, 
  ParticleAnimationType 
};

export default useGameParticles;