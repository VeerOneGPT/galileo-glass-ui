/**
 * AnimationPauseController.ts
 * 
 * Provides utilities to pause, resume, and control continuous animations
 * to improve accessibility for users with vestibular disorders or motion
 * sensitivity. This module allows both global and local control of animations.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode
} from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

/**
 * Global registry of active animations that can be controlled
 */
interface AnimationRegistry {
  /**
   * Map of animation IDs to their control interfaces
   */
  animations: Map<string, AnimationControlInterface>;
  
  /**
   * Global pause state
   */
  globalPaused: boolean;
  
  /**
   * Global animation speed (0-1)
   */
  globalSpeed: number;
  
  /**
   * List of listeners for registry changes
   */
  listeners: Set<() => void>;
  
  /**
   * Subscribe to registry changes
   */
  subscribe: (listener: () => void) => () => void;
  
  /**
   * Notify listeners of changes
   */
  notifyListeners: () => void;
}

/**
 * Control interface for an individual animation
 */
export interface AnimationControlInterface {
  /**
   * Unique ID for the animation
   */
  id: string;
  
  /**
   * Display name for the animation
   */
  name: string;
  
  /**
   * Description of what the animation does
   */
  description?: string;
  
  /**
   * Category of animation for grouping
   */
  category?: string;
  
  /**
   * Current pause state of the animation
   */
  paused: boolean;
  
  /**
   * Current playback speed (0-1)
   */
  speed: number;
  
  /**
   * Whether the animation can be paused
   */
  canPause: boolean;
  
  /**
   * Whether the animation can have its speed adjusted
   */
  canAdjustSpeed: boolean;
  
  /**
   * Whether the animation is essential for functionality
   */
  isEssential: boolean;
  
  /**
   * When the animation started
   */
  startTime: number;
  
  /**
   * When the animation will end, if it has a finite duration
   */
  endTime?: number;
  
  /**
   * Pause the animation
   */
  pause: () => void;
  
  /**
   * Resume the animation
   */
  resume: () => void;
  
  /**
   * Toggle pause state
   */
  togglePause: () => void;
  
  /**
   * Set the animation speed
   */
  setSpeed: (speed: number) => void;
  
  /**
   * Cancel or stop the animation completely
   */
  stop: () => void;
  
  /**
   * Restart the animation from the beginning
   */
  restart: () => void;
  
  /**
   * Jump to a specific point in the animation
   */
  seekTo: (position: number) => void;
  
  /**
   * Clean up and unregister the animation
   */
  destroy: () => void;
}

/**
 * Options for creating an animation controller
 */
export interface AnimationControlOptions {
  /**
   * Unique ID for the animation (auto-generated if not provided)
   */
  id?: string;
  
  /**
   * Display name for the animation
   */
  name?: string;
  
  /**
   * Description of what the animation does
   */
  description?: string;
  
  /**
   * Category of animation for grouping
   */
  category?: string;
  
  /**
   * Whether the animation should start paused
   */
  startPaused?: boolean;
  
  /**
   * Initial playback speed (0-1)
   */
  initialSpeed?: number;
  
  /**
   * Whether the animation can be paused
   */
  canPause?: boolean;
  
  /**
   * Whether the animation can have its speed adjusted
   */
  canAdjustSpeed?: boolean;
  
  /**
   * Whether the animation is essential for functionality
   */
  isEssential?: boolean;
  
  /**
   * Duration of the animation in milliseconds (if finite)
   */
  duration?: number;
  
  /**
   * Target DOM element for the animation
   */
  element?: HTMLElement | null;
  
  /**
   * Callback when animation is paused
   */
  onPause?: () => void;
  
  /**
   * Callback when animation is resumed
   */
  onResume?: () => void;
  
  /**
   * Callback when animation is stopped
   */
  onStop?: () => void;
  
  /**
   * Callback when animation is restarted
   */
  onRestart?: () => void;
  
  /**
   * Callback when animation speed changes
   */
  onSpeedChange?: (speed: number) => void;
}

/**
 * Create the global animation registry
 */
const createRegistry = (): AnimationRegistry => {
  const registry: AnimationRegistry = {
    animations: new Map(),
    globalPaused: false,
    globalSpeed: 1,
    listeners: new Set(),
    
    subscribe: (listener) => {
      registry.listeners.add(listener);
      return () => {
        registry.listeners.delete(listener);
      };
    },
    
    notifyListeners: () => {
      registry.listeners.forEach(listener => listener());
    }
  };
  
  return registry;
};

/**
 * Global animation registry instance
 */
const globalRegistry = createRegistry();

/**
 * Storage key for persistent settings
 */
const STORAGE_KEY = 'galileo-glass-animation-preferences';

/**
 * Pause controller context for React components
 */
export interface AnimationPauseControllerContextType {
  /**
   * Whether all animations are globally paused
   */
  globalPaused: boolean;
  
  /**
   * Global animation speed (0-1)
   */
  globalSpeed: number;
  
  /**
   * Set the global pause state
   */
  setGlobalPaused: (paused: boolean) => void;
  
  /**
   * Set the global animation speed
   */
  setGlobalSpeed: (speed: number) => void;
  
  /**
   * Toggle the global pause state
   */
  toggleGlobalPause: () => void;
  
  /**
   * Pause a specific animation by ID
   */
  pauseAnimation: (id: string) => void;
  
  /**
   * Resume a specific animation by ID
   */
  resumeAnimation: (id: string) => void;
  
  /**
   * Toggle pause state for a specific animation
   */
  toggleAnimationPause: (id: string) => void;
  
  /**
   * Set speed for a specific animation
   */
  setAnimationSpeed: (id: string, speed: number) => void;
  
  /**
   * Stop/cancel a specific animation
   */
  stopAnimation: (id: string) => void;
  
  /**
   * Restart a specific animation
   */
  restartAnimation: (id: string) => void;
  
  /**
   * Get a list of all currently registered animations
   */
  getRegisteredAnimations: () => AnimationControlInterface[];
  
  /**
   * Get a specific animation by ID
   */
  getAnimation: (id: string) => AnimationControlInterface | undefined;
  
  /**
   * Create and register a new animation controller
   */
  createAnimationController: (options: AnimationControlOptions) => AnimationControlInterface;
  
  /**
   * Unregister an animation controller
   */
  unregisterAnimation: (id: string) => void;
  
  /**
   * Save the current animation preferences to local storage
   */
  savePreferences: () => void;
  
  /**
   * Load animation preferences from local storage
   */
  loadPreferences: () => void;
  
  /**
   * Reset animation preferences to defaults
   */
  resetPreferences: () => void;
}

/**
 * Create the pause controller context
 */
export const AnimationPauseControllerContext = createContext<AnimationPauseControllerContextType | null>(null);

/**
 * Provider props
 */
interface AnimationPauseControllerProviderProps {
  children: ReactNode;
  
  /**
   * Initial pause state
   */
  initialPaused?: boolean;
  
  /**
   * Initial global speed
   */
  initialSpeed?: number;
  
  /**
   * Whether to restore saved preferences from localStorage
   */
  restorePreferences?: boolean;
}

/**
 * Saved preferences structure
 */
interface SavedPreferences {
  globalPaused: boolean;
  globalSpeed: number;
  animationStates: Record<string, { paused: boolean; speed: number }>;
}

/**
 * Provider component for the pause controller
 */
export const AnimationPauseControllerProvider: React.FC<AnimationPauseControllerProviderProps> = ({
  children,
  initialPaused = false,
  initialSpeed = 1,
  restorePreferences = true
}) => {
  // Get registered animations
  const getAnimations = useCallback(() => {
    return Array.from(globalRegistry.animations.values());
  }, []);
  
  // Subscribe to registry changes
  const animations = useSyncExternalStore(
    globalRegistry.subscribe,
    getAnimations
  );
  
  // State for global controls
  const [globalPaused, setGlobalPausedState] = useState(initialPaused);
  const [globalSpeed, setGlobalSpeedState] = useState(initialSpeed);
  
  // Keep registry in sync with state
  useEffect(() => {
    globalRegistry.globalPaused = globalPaused;
    globalRegistry.notifyListeners();
    
    // When global pause state changes, apply to all animations
    if (globalPaused) {
      animations.forEach(animation => {
        if (animation.canPause && !animation.isEssential) {
          animation.pause();
        }
      });
    } else {
      animations.forEach(animation => {
        if (animation.canPause && !animation.paused) {
          animation.resume();
        }
      });
    }
  }, [globalPaused, animations]);
  
  useEffect(() => {
    globalRegistry.globalSpeed = globalSpeed;
    globalRegistry.notifyListeners();
    
    // When global speed changes, apply to all animations
    animations.forEach(animation => {
      if (animation.canAdjustSpeed) {
        animation.setSpeed(globalSpeed);
      }
    });
  }, [globalSpeed, animations]);
  
  // Load preferences on initial mount
  useEffect(() => {
    if (restorePreferences) {
      loadPreferences();
    }
  }, [restorePreferences]);
  
  // Set global pause state
  const setGlobalPaused = useCallback((paused: boolean) => {
    setGlobalPausedState(paused);
  }, []);
  
  // Set global speed
  const setGlobalSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(0, Math.min(1, speed));
    setGlobalSpeedState(clampedSpeed);
  }, []);
  
  // Toggle global pause state
  const toggleGlobalPause = useCallback(() => {
    setGlobalPausedState(prev => !prev);
  }, []);
  
  // Individual animation controls
  const pauseAnimation = useCallback((id: string) => {
    const animation = globalRegistry.animations.get(id);
    if (animation && animation.canPause) {
      animation.pause();
      globalRegistry.notifyListeners();
    }
  }, []);
  
  const resumeAnimation = useCallback((id: string) => {
    const animation = globalRegistry.animations.get(id);
    if (animation && animation.canPause) {
      animation.resume();
      globalRegistry.notifyListeners();
    }
  }, []);
  
  const toggleAnimationPause = useCallback((id: string) => {
    const animation = globalRegistry.animations.get(id);
    if (animation && animation.canPause) {
      if (animation.paused) {
        animation.resume();
      } else {
        animation.pause();
      }
      globalRegistry.notifyListeners();
    }
  }, []);
  
  const setAnimationSpeed = useCallback((id: string, speed: number) => {
    const animation = globalRegistry.animations.get(id);
    if (animation && animation.canAdjustSpeed) {
      const clampedSpeed = Math.max(0, Math.min(1, speed));
      animation.setSpeed(clampedSpeed);
      globalRegistry.notifyListeners();
    }
  }, []);
  
  const stopAnimation = useCallback((id: string) => {
    const animation = globalRegistry.animations.get(id);
    if (animation) {
      animation.stop();
      globalRegistry.notifyListeners();
    }
  }, []);
  
  const restartAnimation = useCallback((id: string) => {
    const animation = globalRegistry.animations.get(id);
    if (animation) {
      animation.restart();
      globalRegistry.notifyListeners();
    }
  }, []);
  
  // Animation registration
  const createAnimationController = useCallback((options: AnimationControlOptions): AnimationControlInterface => {
    const {
      id = `animation-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      description = '',
      category = 'general',
      startPaused = false,
      initialSpeed = 1,
      canPause = true,
      canAdjustSpeed = true,
      isEssential = false,
      duration,
      element = null,
      onPause = () => {},
      onResume = () => {},
      onStop = () => {},
      onRestart = () => {},
      onSpeedChange = () => {}
    } = options;
    
    // Check if animation already exists
    if (globalRegistry.animations.has(id)) {
      console.warn(`Animation with ID ${id} already exists. Returning existing controller.`);
      return globalRegistry.animations.get(id)!;
    }
    
    const startTime = Date.now();
    const endTime = duration ? startTime + duration : undefined;
    
    // Initial pause state should respect global pause state for non-essential animations
    const actuallyPaused = (globalRegistry.globalPaused && !isEssential) || startPaused;
    
    // Create animation controller
    const controller: AnimationControlInterface = {
      id,
      name,
      description,
      category,
      paused: actuallyPaused,
      speed: initialSpeed,
      canPause,
      canAdjustSpeed,
      isEssential,
      startTime,
      endTime,
      
      pause: () => {
        if (controller.canPause && !controller.paused) {
          controller.paused = true;
          
          // Pause CSS animations if element is provided
          if (element) {
            const animations = element.getAnimations();
            animations.forEach(anim => anim.pause());
          }
          
          onPause();
          globalRegistry.notifyListeners();
        }
      },
      
      resume: () => {
        if (controller.canPause && controller.paused) {
          controller.paused = false;
          
          // Resume CSS animations if element is provided
          if (element) {
            const animations = element.getAnimations();
            animations.forEach(anim => anim.play());
          }
          
          onResume();
          globalRegistry.notifyListeners();
        }
      },
      
      togglePause: () => {
        if (controller.paused) {
          controller.resume();
        } else {
          controller.pause();
        }
      },
      
      setSpeed: (speed: number) => {
        const clampedSpeed = Math.max(0, Math.min(1, speed));
        controller.speed = clampedSpeed;
        
        // Adjust CSS animation playback rate if element is provided
        if (element) {
          const animations = element.getAnimations();
          animations.forEach(anim => {
            anim.playbackRate = clampedSpeed;
          });
        }
        
        onSpeedChange(clampedSpeed);
        globalRegistry.notifyListeners();
      },
      
      stop: () => {
        controller.paused = true;
        
        // Cancel CSS animations if element is provided
        if (element) {
          const animations = element.getAnimations();
          animations.forEach(anim => anim.cancel());
        }
        
        onStop();
        globalRegistry.notifyListeners();
      },
      
      restart: () => {
        controller.startTime = Date.now();
        controller.endTime = duration ? controller.startTime + duration : undefined;
        controller.paused = false;
        
        // Restart CSS animations if element is provided
        if (element) {
          const animations = element.getAnimations();
          animations.forEach(anim => {
            anim.cancel();
            anim.play();
          });
        }
        
        onRestart();
        globalRegistry.notifyListeners();
      },
      
      seekTo: (position: number) => {
        // Seek CSS animations if element is provided
        if (element && duration) {
          const clampedPosition = Math.max(0, Math.min(1, position));
          const timePosition = clampedPosition * duration;
          
          const animations = element.getAnimations();
          animations.forEach(anim => {
            anim.currentTime = timePosition;
          });
          
          globalRegistry.notifyListeners();
        }
      },
      
      destroy: () => {
        globalRegistry.animations.delete(id);
        globalRegistry.notifyListeners();
      }
    };
    
    // Register the animation
    globalRegistry.animations.set(id, controller);
    globalRegistry.notifyListeners();
    
    // Apply initial state
    if (actuallyPaused) {
      controller.pause();
    }
    
    if (initialSpeed !== 1) {
      controller.setSpeed(initialSpeed);
    }
    
    return controller;
  }, []);
  
  // Unregister an animation
  const unregisterAnimation = useCallback((id: string) => {
    if (globalRegistry.animations.has(id)) {
      globalRegistry.animations.delete(id);
      globalRegistry.notifyListeners();
    }
  }, []);
  
  // Get all registered animations
  const getRegisteredAnimations = useCallback(() => {
    return Array.from(globalRegistry.animations.values());
  }, []);
  
  // Get a specific animation by ID
  const getAnimation = useCallback((id: string) => {
    return globalRegistry.animations.get(id);
  }, []);
  
  // Persistence functions
  const savePreferences = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const animationStates: Record<string, { paused: boolean; speed: number }> = {};
      
      globalRegistry.animations.forEach((animation, id) => {
        // Only save state for non-temporary animations
        if (!id.startsWith('temp-')) {
          animationStates[id] = {
            paused: animation.paused,
            speed: animation.speed
          };
        }
      });
      
      const preferences: SavedPreferences = {
        globalPaused,
        globalSpeed,
        animationStates
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save animation preferences:', error);
    }
  }, [globalPaused, globalSpeed]);
  
  const loadPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedPrefs = localStorage.getItem(STORAGE_KEY);
      if (!savedPrefs) return;
      
      const preferences: SavedPreferences = JSON.parse(savedPrefs);
      
      // Apply global settings
      setGlobalPausedState(preferences.globalPaused);
      setGlobalSpeedState(preferences.globalSpeed);
      
      // Apply individual animation settings
      Object.entries(preferences.animationStates).forEach(([id, state]) => {
        const animation = globalRegistry.animations.get(id);
        if (animation) {
          if (state.paused) {
            animation.pause();
          } else {
            animation.resume();
          }
          animation.setSpeed(state.speed);
        }
      });
      
      globalRegistry.notifyListeners();
    } catch (error) {
      console.error('Failed to load animation preferences:', error);
    }
  }, []);
  
  const resetPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      
      // Reset global settings
      setGlobalPausedState(false);
      setGlobalSpeedState(1);
      
      // Reset all animations
      globalRegistry.animations.forEach(animation => {
        if (!animation.isEssential) {
          animation.resume();
          animation.setSpeed(1);
        }
      });
      
      globalRegistry.notifyListeners();
    } catch (error) {
      console.error('Failed to reset animation preferences:', error);
    }
  }, []);
  
  // Create context value
  const contextValue: AnimationPauseControllerContextType = {
    globalPaused,
    globalSpeed,
    setGlobalPaused,
    setGlobalSpeed,
    toggleGlobalPause,
    pauseAnimation,
    resumeAnimation,
    toggleAnimationPause,
    setAnimationSpeed,
    stopAnimation,
    restartAnimation,
    getRegisteredAnimations,
    getAnimation,
    createAnimationController,
    unregisterAnimation,
    savePreferences,
    loadPreferences,
    resetPreferences
  };
  
  return (
    <AnimationPauseControllerContext.Provider value={contextValue}>
      {children}
    </AnimationPauseControllerContext.Provider>
  );
};

/**
 * Hook to access the pause controller context
 */
export function useAnimationPauseController(): AnimationPauseControllerContextType {
  const context = useContext(AnimationPauseControllerContext);
  if (!context) {
    throw new Error('useAnimationPauseController must be used within an AnimationPauseControllerProvider');
  }
  return context;
}

/**
 * Hook to create and manage a controllable animation
 */
export function useControllableAnimation(options: AnimationControlOptions): AnimationControlInterface {
  const controller = useAnimationPauseController();
  const animationRef = useRef<AnimationControlInterface | null>(null);
  
  // Create or retrieve the animation controller
  useEffect(() => {
    animationRef.current = controller.createAnimationController(options);
    
    // Clean up on unmount
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [controller, options.id]);
  
  // If the controller hasn't been initialized yet, create a temporary one
  if (!animationRef.current) {
    animationRef.current = controller.createAnimationController({
      ...options,
      id: options.id || `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });
  }
  
  return animationRef.current;
}

/**
 * Utility hook for pausing CSS animations on an element
 */
export function usePauseableAnimation(
  elementRef: React.RefObject<HTMLElement>,
  options: Omit<AnimationControlOptions, 'element'> = {}
): AnimationControlInterface {
  const element = elementRef.current;
  
  return useControllableAnimation({
    ...options,
    element,
    name: options.name || 'CSS Animation',
    id: options.id || `css-animation-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  });
}

/**
 * Component to create a global pause control UI
 */
export interface AnimationPauseControlProps {
  /**
   * CSS class name for the control
   */
  className?: string;
  
  /**
   * Style object for the control
   */
  style?: React.CSSProperties;
  
  /**
   * Whether to show speed controls
   */
  showSpeedControls?: boolean;
  
  /**
   * Whether to show animation list
   */
  showAnimationList?: boolean;
  
  /**
   * Label for the pause button
   */
  pauseLabel?: string;
  
  /**
   * Label for the resume button
   */
  resumeLabel?: string;
  
  /**
   * Maximum height for the animation list
   */
  maxHeight?: string;
  
  /**
   * Whether the control is disabled
   */
  disabled?: boolean;
  
  /**
   * Callback when the global pause state changes
   */
  onPauseChange?: (paused: boolean) => void;
  
  /**
   * Callback when the global speed changes
   */
  onSpeedChange?: (speed: number) => void;
}

/**
 * Create a global animation pause control
 * 
 * This utility function creates an HTMLElement that serves as a global
 * pause control for all animations. This is especially useful for users
 * with vestibular disorders or motion sensitivities, allowing them to
 * quickly pause all animations.
 * 
 * @returns An HTMLElement that can be added to the DOM
 */
export function createGlobalPauseControl(): HTMLElement {
  // Check if one already exists
  const existingControl = document.getElementById('galileo-glass-animation-pause-control');
  if (existingControl) {
    return existingControl;
  }
  
  // Create control container
  const container = document.createElement('div');
  container.id = 'galileo-glass-animation-pause-control';
  container.style.position = 'fixed';
  container.style.zIndex = '9999';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.background = 'rgba(0, 0, 0, 0.7)';
  container.style.color = 'white';
  container.style.padding = '10px';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '10px';
  container.style.maxWidth = '300px';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.fontSize = '14px';
  container.setAttribute('aria-label', 'Animation controls');
  container.setAttribute('role', 'region');
  
  // Add header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.innerHTML = '<strong>Animation Controls</strong>';
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '18px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0 5px';
  closeButton.setAttribute('aria-label', 'Close animation controls');
  closeButton.onclick = () => {
    container.style.display = 'none';
  };
  
  header.appendChild(closeButton);
  container.appendChild(header);
  
  // Pause controls
  const controlsRow = document.createElement('div');
  controlsRow.style.display = 'flex';
  controlsRow.style.gap = '10px';
  controlsRow.style.justifyContent = 'center';
  
  // Pause button
  const pauseButton = document.createElement('button');
  pauseButton.innerHTML = '⏸ Pause All';
  pauseButton.style.background = '#3498db';
  pauseButton.style.color = 'white';
  pauseButton.style.border = 'none';
  pauseButton.style.padding = '8px 12px';
  pauseButton.style.borderRadius = '4px';
  pauseButton.style.cursor = 'pointer';
  pauseButton.setAttribute('aria-label', 'Pause all animations');
  
  // Resume button
  const resumeButton = document.createElement('button');
  resumeButton.innerHTML = '▶️ Resume';
  resumeButton.style.background = '#2ecc71';
  resumeButton.style.color = 'white';
  resumeButton.style.border = 'none';
  resumeButton.style.padding = '8px 12px';
  resumeButton.style.borderRadius = '4px';
  resumeButton.style.cursor = 'pointer';
  resumeButton.setAttribute('aria-label', 'Resume all animations');
  resumeButton.style.display = 'none'; // Hide initially
  
  // Speed slider
  const speedControl = document.createElement('div');
  speedControl.style.marginTop = '10px';
  
  const speedLabel = document.createElement('label');
  speedLabel.innerHTML = 'Animation Speed: <span id="speed-value">100%</span>';
  speedLabel.style.display = 'block';
  speedLabel.style.marginBottom = '5px';
  
  const speedSlider = document.createElement('input');
  speedSlider.type = 'range';
  speedSlider.min = '0';
  speedSlider.max = '100';
  speedSlider.value = '100';
  speedSlider.style.width = '100%';
  speedSlider.setAttribute('aria-label', 'Animation speed');
  
  speedControl.appendChild(speedLabel);
  speedControl.appendChild(speedSlider);
  
  controlsRow.appendChild(pauseButton);
  controlsRow.appendChild(resumeButton);
  container.appendChild(controlsRow);
  container.appendChild(speedControl);
  
  // Animation list section (collapsed by default)
  const animationListToggle = document.createElement('button');
  animationListToggle.innerHTML = '▼ Show Animation List';
  animationListToggle.style.background = 'none';
  animationListToggle.style.border = 'none';
  animationListToggle.style.color = 'white';
  animationListToggle.style.cursor = 'pointer';
  animationListToggle.style.padding = '5px 0';
  animationListToggle.style.textAlign = 'left';
  animationListToggle.setAttribute('aria-expanded', 'false');
  animationListToggle.setAttribute('aria-controls', 'animation-list');
  
  const animationList = document.createElement('div');
  animationList.id = 'animation-list';
  animationList.style.maxHeight = '0';
  animationList.style.overflow = 'hidden';
  animationList.style.transition = 'max-height 0.3s ease-out';
  animationList.setAttribute('aria-hidden', 'true');
  
  container.appendChild(animationListToggle);
  container.appendChild(animationList);
  
  // Track pause state
  let isPaused = false;
  
  // Add click handlers
  pauseButton.onclick = () => {
    isPaused = true;
    pauseButton.style.display = 'none';
    resumeButton.style.display = 'block';
    
    // Pause all animations on the page
    const animations = document.getAnimations();
    animations.forEach(animation => {
      try {
        animation.pause();
      } catch (e) {
        // Some animations may not be pauseable
      }
    });
    
    // Save preference
    try {
      localStorage.setItem('galileo-glass-animations-paused', 'true');
    } catch (e) {
      // Ignore storage errors
    }
    
    // Update aria
    container.setAttribute('aria-live', 'polite');
    speedSlider.disabled = true;
  };
  
  resumeButton.onclick = () => {
    isPaused = false;
    resumeButton.style.display = 'none';
    pauseButton.style.display = 'block';
    
    // Resume all animations on the page
    const animations = document.getAnimations();
    animations.forEach(animation => {
      try {
        if (animation.playState === 'paused') {
          animation.play();
        }
      } catch (e) {
        // Some animations may not be pauseable
      }
    });
    
    // Save preference
    try {
      localStorage.setItem('galileo-glass-animations-paused', 'false');
    } catch (e) {
      // Ignore storage errors
    }
    
    // Update aria
    container.setAttribute('aria-live', 'polite');
    speedSlider.disabled = false;
  };
  
  // Speed slider handler
  speedSlider.oninput = () => {
    const speedValue = parseInt(speedSlider.value);
    const speedDisplay = document.getElementById('speed-value');
    if (speedDisplay) {
      speedDisplay.textContent = `${speedValue}%`;
    }
    
    // Adjust all animations on the page
    const animations = document.getAnimations();
    animations.forEach(animation => {
      try {
        animation.playbackRate = speedValue / 100;
      } catch (e) {
        // Some animations may not support rate adjustment
      }
    });
    
    // Save preference
    try {
      localStorage.setItem('galileo-glass-animation-speed', speedSlider.value);
    } catch (e) {
      // Ignore storage errors
    }
  };
  
  // Animation list toggle
  animationListToggle.onclick = () => {
    const isExpanded = animationListToggle.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      animationList.style.maxHeight = '0';
      animationListToggle.innerHTML = '▼ Show Animation List';
      animationListToggle.setAttribute('aria-expanded', 'false');
      animationList.setAttribute('aria-hidden', 'true');
    } else {
      animationList.style.maxHeight = '300px';
      animationListToggle.innerHTML = '▲ Hide Animation List';
      animationListToggle.setAttribute('aria-expanded', 'true');
      animationList.setAttribute('aria-hidden', 'false');
      
      // Refresh animation list
      updateAnimationList();
    }
  };
  
  // Function to update the animation list
  function updateAnimationList() {
    // Clear existing list
    animationList.innerHTML = '';
    
    // Get all animations
    const animations = document.getAnimations();
    
    if (animations.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No active animations found';
      emptyMessage.style.padding = '10px';
      emptyMessage.style.fontStyle = 'italic';
      animationList.appendChild(emptyMessage);
      return;
    }
    
    // Group by target element
    const animationsByTarget = new Map<Element, Animation[]>();
    
    animations.forEach(animation => {
      const target = animation.effect && (animation.effect as any).target;
      if (target) {
        if (!animationsByTarget.has(target)) {
          animationsByTarget.set(target, []);
        }
        animationsByTarget.get(target)?.push(animation);
      }
    });
    
    // Create list
    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    list.style.margin = '0';
    list.style.maxHeight = '250px';
    list.style.overflowY = 'auto';
    
    animationsByTarget.forEach((animations, target) => {
      const listItem = document.createElement('li');
      listItem.style.marginBottom = '8px';
      listItem.style.padding = '8px';
      listItem.style.background = 'rgba(255, 255, 255, 0.1)';
      listItem.style.borderRadius = '4px';
      
      // Element info
      const elementInfo = document.createElement('div');
      let elementName = target.tagName.toLowerCase();
      if (target.id) {
        elementName += `#${target.id}`;
      } else if (target.classList.length > 0) {
        elementName += `.${Array.from(target.classList).join('.')}`;
      }
      
      elementInfo.textContent = `${elementName} (${animations.length} animations)`;
      elementInfo.style.marginBottom = '5px';
      
      // Control buttons
      const controls = document.createElement('div');
      controls.style.display = 'flex';
      controls.style.gap = '5px';
      
      // Toggle button for this element's animations
      const toggleButton = document.createElement('button');
      const isPaused = animations.some(a => a.playState === 'paused');
      toggleButton.textContent = isPaused ? '▶️' : '⏸';
      toggleButton.title = isPaused ? 'Resume' : 'Pause';
      toggleButton.style.background = isPaused ? '#2ecc71' : '#3498db';
      toggleButton.style.color = 'white';
      toggleButton.style.border = 'none';
      toggleButton.style.padding = '2px 5px';
      toggleButton.style.borderRadius = '3px';
      toggleButton.style.cursor = 'pointer';
      toggleButton.style.fontSize = '12px';
      
      toggleButton.onclick = () => {
        const isPaused = animations.some(a => a.playState === 'paused');
        
        animations.forEach(animation => {
          try {
            if (isPaused) {
              animation.play();
            } else {
              animation.pause();
            }
          } catch (e) {
            // Some animations may not be pauseable
          }
        });
        
        // Update button
        toggleButton.textContent = isPaused ? '⏸' : '▶️';
        toggleButton.title = isPaused ? 'Pause' : 'Resume';
        toggleButton.style.background = isPaused ? '#3498db' : '#2ecc71';
      };
      
      controls.appendChild(toggleButton);
      
      listItem.appendChild(elementInfo);
      listItem.appendChild(controls);
      list.appendChild(listItem);
    });
    
    animationList.appendChild(list);
  }
  
  // Load saved preferences
  try {
    const savedPaused = localStorage.getItem('galileo-glass-animations-paused');
    if (savedPaused === 'true') {
      pauseButton.click();
    }
    
    const savedSpeed = localStorage.getItem('galileo-glass-animation-speed');
    if (savedSpeed) {
      speedSlider.value = savedSpeed;
      speedSlider.dispatchEvent(new Event('input'));
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  // Add mutation observer to track new animations
  const observer = new MutationObserver(() => {
    if (animationListToggle.getAttribute('aria-expanded') === 'true') {
      updateAnimationList();
    }
  });
  
  observer.observe(document.body, { 
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  // Method to update animation list
  // container.updateAnimationList = updateAnimationList;
  
  // Return the container
  return container;
}

/**
 * Add the global pause control to the document
 */
export function installGlobalPauseControl(): HTMLElement {
  const control = createGlobalPauseControl();
  
  // Only append if not already in the document
  if (!document.getElementById('galileo-glass-animation-pause-control')) {
    document.body.appendChild(control);
  }
  
  return control;
}

/**
 * Remove the global pause control from the document
 */
export function removeGlobalPauseControl(): void {
  const control = document.getElementById('galileo-glass-animation-pause-control');
  if (control && control.parentNode) {
    control.parentNode.removeChild(control);
  }
}

/**
 * Creates an accessibility button for pausing animations
 * This can be added to any page for users with vestibular disorders
 */
export function createAnimationPauseButton(options: {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLabel?: boolean;
  label?: string;
  showTooltip?: boolean;
  tooltipText?: string;
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark';
  customStyles?: Partial<CSSStyleDeclaration>;
  onToggle?: (paused: boolean) => void;
} = {}): HTMLElement {
  const {
    position = 'bottom-right',
    showLabel = false,
    label = 'Pause Animations',
    showTooltip = true,
    tooltipText = 'Pause all animations on this page',
    size = 'medium',
    theme = 'dark',
    customStyles = {},
    onToggle
  } = options;
  
  // Create button element
  const button = document.createElement('button');
  button.id = 'galileo-glass-animation-pause-button';
  button.setAttribute('aria-label', label);
  button.setAttribute('role', 'button');
  
  if (showTooltip) {
    button.setAttribute('title', tooltipText);
  }
  
  // Set button icon
  button.innerHTML = '⏸';
  
  // Add label if requested
  if (showLabel) {
    button.innerHTML += ` <span>${label}</span>`;
  }
  
  // Set button styles
  let buttonSize = '40px';
  let fontSize = '16px';
  
  if (size === 'small') {
    buttonSize = '32px';
    fontSize = '14px';
  } else if (size === 'large') {
    buttonSize = '48px';
    fontSize = '18px';
  }
  
  // Base styles
  button.style.position = 'fixed';
  button.style.zIndex = '9999';
  button.style.width = showLabel ? 'auto' : buttonSize;
  button.style.height = buttonSize;
  button.style.borderRadius = '50%';
  button.style.fontSize = fontSize;
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.cursor = 'pointer';
  button.style.transition = 'background-color 0.2s, transform 0.2s';
  button.style.border = 'none';
  button.style.padding = showLabel ? '8px 12px' : '0';
  button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
  
  // Set position
  if (position === 'top-left') {
    button.style.top = '20px';
    button.style.left = '20px';
  } else if (position === 'top-right') {
    button.style.top = '20px';
    button.style.right = '20px';
  } else if (position === 'bottom-left') {
    button.style.bottom = '20px';
    button.style.left = '20px';
  } else {
    button.style.bottom = '20px';
    button.style.right = '20px';
  }
  
  // Apply theme
  if (theme === 'dark') {
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    button.style.color = 'white';
  } else {
    button.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    button.style.color = 'black';
  }
  
  // Apply custom styles
  Object.entries(customStyles).forEach(([property, value]) => {
    if (value) {
      button.style[property as any] = value as string;
    }
  });
  
  // Add hover effect
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    
    if (theme === 'dark') {
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    } else {
      button.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    }
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    
    if (theme === 'dark') {
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    } else {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    }
  });
  
  // Track state
  let isPaused = false;
  
  // Toggle animations on click
  button.addEventListener('click', () => {
    // Toggle state
    isPaused = !isPaused;
    
    // Update button
    if (isPaused) {
      button.innerHTML = showLabel ? '▶️ <span>Resume Animations</span>' : '▶️';
      button.setAttribute('aria-label', 'Resume Animations');
      button.setAttribute('title', 'Resume all animations on this page');
      
      // Pause all animations
      const animations = document.getAnimations();
      animations.forEach(animation => {
        try {
          animation.pause();
        } catch (e) {
          // Some animations may not be pauseable
        }
      });
    } else {
      button.innerHTML = showLabel ? '⏸ <span>Pause Animations</span>' : '⏸';
      button.setAttribute('aria-label', 'Pause Animations');
      button.setAttribute('title', 'Pause all animations on this page');
      
      // Resume all animations
      const animations = document.getAnimations();
      animations.forEach(animation => {
        try {
          if (animation.playState === 'paused') {
            animation.play();
          }
        } catch (e) {
          // Some animations may not be pauseable
        }
      });
    }
    
    // Call onToggle callback if provided
    if (onToggle) {
      onToggle(isPaused);
    }
    
    // Save preference
    try {
      localStorage.setItem('galileo-glass-animations-paused', isPaused.toString());
    } catch (e) {
      // Ignore storage errors
    }
  });
  
  // Load saved preference
  try {
    const savedPaused = localStorage.getItem('galileo-glass-animations-paused');
    if (savedPaused === 'true') {
      isPaused = true;
      button.innerHTML = showLabel ? '▶️ <span>Resume Animations</span>' : '▶️';
      button.setAttribute('aria-label', 'Resume Animations');
      button.setAttribute('title', 'Resume all animations on this page');
      
      // Pause all animations on load
      window.addEventListener('load', () => {
        const animations = document.getAnimations();
        animations.forEach(animation => {
          try {
            animation.pause();
          } catch (e) {
            // Some animations may not be pauseable
          }
        });
      });
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  return button;
}

/**
 * Add an animation pause button to the document
 */
export function installAnimationPauseButton(options = {}): HTMLElement {
  const button = createAnimationPauseButton(options);
  
  // Only append if not already in the document
  if (!document.getElementById('galileo-glass-animation-pause-button')) {
    document.body.appendChild(button);
  }
  
  return button;
}

/**
 * Remove the animation pause button from the document
 */
export function removeAnimationPauseButton(): void {
  const button = document.getElementById('galileo-glass-animation-pause-button');
  if (button && button.parentNode) {
    button.parentNode.removeChild(button);
  }
}

/**
 * Auto-install the pause control based on user preferences
 * This should be called at the application entry point
 */
export function autoInstallAnimationControls(options = {
  installType: 'button', // 'button', 'control', or 'none'
  respectReducedMotion: true,
  position: 'bottom-right',
  theme: 'dark',
  showLabel: false
}): void {
  const { 
    installType, 
    respectReducedMotion, 
    position, 
    theme, 
    showLabel 
  } = options;
  
  // Check for reduced motion preference
  if (respectReducedMotion) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Auto-install controls if reduced motion is preferred
    if (prefersReducedMotion) {
      if (installType === 'button' || installType === 'auto') {
        window.addEventListener('DOMContentLoaded', () => {
          installAnimationPauseButton({
            position: position as any,
            theme: theme as any,
            showLabel
          });
        });
      } else if (installType === 'control') {
        window.addEventListener('DOMContentLoaded', () => {
          installGlobalPauseControl();
        });
      }
      
      // Auto-pause animations if reduced motion is preferred
      window.addEventListener('DOMContentLoaded', () => {
        try {
          localStorage.setItem('galileo-glass-animations-paused', 'true');
          
          // Pause all animations after a short delay to ensure they've started
          setTimeout(() => {
            const animations = document.getAnimations();
            animations.forEach(animation => {
              try {
                animation.pause();
              } catch (e) {
                // Some animations may not be pauseable
              }
            });
          }, 500);
        } catch (e) {
          // Ignore storage errors
        }
      });
    }
  }
  
  // Check for saved preferences even if reduced motion is not preferred
  try {
    const savedPaused = localStorage.getItem('galileo-glass-animations-paused');
    if (savedPaused === 'true') {
      // Auto-install controls if animations were previously paused
      if (installType === 'button' || installType === 'auto') {
        window.addEventListener('DOMContentLoaded', () => {
          installAnimationPauseButton({
            position: position as any,
            theme: theme as any,
            showLabel
          });
        });
      } else if (installType === 'control') {
        window.addEventListener('DOMContentLoaded', () => {
          installGlobalPauseControl();
        });
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
}