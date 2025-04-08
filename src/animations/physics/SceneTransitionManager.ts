/**
 * SceneTransitionManager.ts
 * 
 * A comprehensive system for managing smooth transitions between application scenes or levels.
 * Provides sophisticated animation controls for maintaining context during significant view changes.
 */

import { AnimationCategory } from '../accessibility/MotionSensitivity';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { SpringConfig } from './springPhysics';
import { Vector2D } from './types';
import { TransitionType, TransitionDirection } from '../types';
import { DistributionPattern } from '../orchestration/StaggeredAnimations';

/**
 * Scene types for different application contexts
 */
export enum SceneType {
  /** Standard UI scene */
  STANDARD = 'standard',
  
  /** Game level */
  GAME_LEVEL = 'game_level',
  
  /** Menu screen */
  MENU = 'menu',
  
  /** Settings screen */
  SETTINGS = 'settings',
  
  /** Achievement/reward screen */
  ACHIEVEMENT = 'achievement',
  
  /** Loading screen */
  LOADING = 'loading',
  
  /** Cutscene/narrative */
  CUTSCENE = 'cutscene',
  
  /** Modal dialog */
  MODAL = 'modal',
  
  /** Custom scene type */
  CUSTOM = 'custom'
}

/**
 * Scene transition effects
 */
export enum TransitionEffect {
  /** Fade between scenes */
  FADE = 'fade',
  
  /** Slide from one scene to another */
  SLIDE = 'slide',
  
  /** Zoom between scenes */
  ZOOM = 'zoom',
  
  /** Rotate between scenes */
  ROTATE = 'rotate',
  
  /** Fold like a page */
  FOLD = 'fold',
  
  /** Dissolve pixel by pixel */
  DISSOLVE = 'dissolve',
  
  /** Wipe from one side to another */
  WIPE = 'wipe',
  
  /** Crossfade between scenes */
  CROSSFADE = 'crossfade',
  
  /** Ripple effect */
  RIPPLE = 'ripple',
  
  /** 3D cube rotation */
  CUBE = 'cube',
  
  /** 3D flip */
  FLIP = 'flip',
  
  /** Blur transition */
  BLUR = 'blur',
  
  /** No transition */
  NONE = 'none',
  
  /** Custom transition */
  CUSTOM = 'custom'
}

/**
 * Scene depth effects for 3D transitions
 */
export enum SceneDepthEffect {
  /** Layer scenes in z-space */
  LAYERED = 'layered',
  
  /** Perspective-based depth */
  PERSPECTIVE = 'perspective',
  
  /** Parallax scrolling effect */
  PARALLAX = 'parallax',
  
  /** Z-space floating effect */
  FLOATING = 'floating',
  
  /** No depth effect */
  NONE = 'none'
}

/**
 * Content preservation strategy during transitions
 */
export enum ContentPreservation {
  /** Recreate all content */
  NONE = 'none',
  
  /** Keep elements but update state */
  UPDATE = 'update',
  
  /** Completely preserve state */
  PRESERVE = 'preserve',
  
  /** Cache and restore */
  CACHE = 'cache',
  
  /** Custom preservation strategy */
  CUSTOM = 'custom'
}

/**
 * Scene configuration options
 */
export interface SceneConfig {
  /** Unique scene ID */
  id: string;
  
  /** Human-readable scene name */
  name: string;
  
  /** Scene type */
  type: SceneType;
  
  /** Query selector for scene container */
  container: string;
  
  /** Query selector for elements to animate on enter */
  enterElements?: string;
  
  /** Query selector for elements to animate on exit */
  exitElements?: string;
  
  /** Query selector for background elements */
  backgroundElements?: string;
  
  /** Query selector for foreground elements */
  foregroundElements?: string;
  
  /** CSS class to add to active scene */
  activeClass?: string;
  
  /** DOM element if already exists */
  element?: HTMLElement;
  
  /** Priority for rendering (higher appears on top) */
  zIndex?: number;
  
  /** Duration for enter animation in ms */
  enterDuration?: number;
  
  /** Duration for exit animation in ms */
  exitDuration?: number;
  
  /** Custom data associated with this scene */
  userData?: any;
  
  /** If true, scene will be preloaded */
  preload?: boolean;
  
  /** If true, disables all animations for this scene */
  disableAnimations?: boolean;
  
  /** Lazy load callback for dynamic scenes */
  lazyLoad?: () => Promise<void>;
  
  /** Callback when scene becomes active */
  onActivate?: () => void;
  
  /** Callback when scene becomes inactive */
  onDeactivate?: () => void;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
}

/**
 * Transition configuration between scenes
 */
export interface SceneTransition {
  /** Source scene ID */
  from: string;
  
  /** Target scene ID */
  to: string;
  
  /** Transition effect */
  effect: TransitionEffect;
  
  /** Transition direction */
  direction?: TransitionDirection;
  
  /** Transition duration in ms */
  duration?: number;
  
  /** CSS easing function */
  easing?: string;
  
  /** If true, transition will be reversed when going back */
  reversible?: boolean;
  
  /** If true, elements will animate with staggered timing */
  stagger?: boolean;
  
  /** Pattern for staggered animations */
  staggerPattern?: DistributionPattern;
  
  /** Delay between staggered elements (ms) */
  staggerDelay?: number;
  
  /** Depth effect to use during transition */
  depthEffect?: SceneDepthEffect;
  
  /** Background color during transition */
  backgroundColor?: string;
  
  /** If true, overlay will be shown during transition */
  showOverlay?: boolean;
  
  /** Context preservation strategy */
  preservation?: ContentPreservation;
  
  /** Function for custom transitions */
  customTransition?: (
    fromElement: HTMLElement,
    toElement: HTMLElement,
    container: HTMLElement,
    complete: () => void
  ) => void;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
  
  /** Alternative transition for reduced motion preferences */
  reducedMotionAlternative?: Omit<SceneTransition, 'from' | 'to' | 'reducedMotionAlternative'>;
}

/**
 * State of a scene transition
 */
export interface TransitionState {
  /** Source scene ID */
  fromScene: string | null;
  
  /** Target scene ID */
  toScene: string | null;
  
  /** Is transition in progress */
  inProgress: boolean;
  
  /** Is transition paused */
  isPaused: boolean;
  
  /** Is transition completed */
  isCompleted: boolean;
  
  /** Time transition started */
  startTime: number | null;
  
  /** Current progress (0-1) */
  progress: number;
  
  /** Current transition configuration */
  transition: SceneTransition | null;
  
  /** Error message if transition failed */
  error: string | null;
}

/**
 * Configuration for SceneTransitionManager
 */
export interface SceneTransitionManagerConfig {
  /** Initial scene ID */
  initialScene?: string;
  
  /** Scene definitions */
  scenes?: SceneConfig[];
  
  /** Transition definitions */
  transitions?: SceneTransition[];
  
  /** Default transition duration in ms */
  defaultDuration?: number;
  
  /** Default transition effect */
  defaultEffect?: TransitionEffect;
  
  /** Default easing function */
  defaultEasing?: string;
  
  /** Default overlay color */
  defaultOverlayColor?: string;
  
  /** Default depth effect */
  defaultDepthEffect?: SceneDepthEffect;
  
  /** Default content preservation strategy */
  defaultPreservation?: ContentPreservation;
  
  /** If true, the manager automatically handles history navigation */
  handleHistory?: boolean;
  
  /** If true, transitions start automatically */
  autoStart?: boolean;
  
  /** Duration to wait for lazyloaded scenes (ms) */
  lazyLoadTimeout?: number;
  
  /** If true, logs details about transitions */
  debug?: boolean;
  
  /** Override reduced motion setting */
  forceReducedMotion?: boolean;
  
  /** Global modifier for transition duration (1.0 = normal) */
  durationModifier?: number;
  
  /** Parent element for the scene container */
  containerElement?: HTMLElement;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
  
  /** Callback when a scene change begins */
  onSceneChangeStart?: (fromId: string | null, toId: string) => void;
  
  /** Callback when a scene change completes */
  onSceneChangeComplete?: (fromId: string | null, toId: string) => void;
  
  /** Callback when a scene change fails */
  onSceneChangeFail?: (fromId: string | null, toId: string, error: Error) => void;
  
  /** Callback when transition progress updates */
  onTransitionProgress?: (progress: number) => void;
}

/**
 * Handler for scene transition events
 */
export type SceneTransitionHandler = (
  fromId: string | null,
  toId: string,
  transition: SceneTransition | null
) => void;

/**
 * Scene transition manager for handling complex transitions between application scenes
 */
export class SceneTransitionManager {
  /** Configuration */
  private config: SceneTransitionManagerConfig;
  
  /** Map of scene configurations */
  private scenes: Map<string, SceneConfig> = new Map();
  
  /** Map of transitions */
  private transitions: Map<string, SceneTransition> = new Map();
  
  /** Current active scene ID */
  private activeSceneId: string | null = null;
  
  /** Previous active scene ID */
  private previousSceneId: string | null = null;
  
  /** Transition state */
  private transitionState: TransitionState = {
    fromScene: null,
    toScene: null,
    inProgress: false,
    isPaused: false,
    isCompleted: false,
    startTime: null,
    progress: 0,
    transition: null,
    error: null
  };
  
  /** DOM container element */
  private container: HTMLElement | null = null;
  
  /** Overlay element for transitions */
  private overlayElement: HTMLElement | null = null;
  
  /** Map of event listeners */
  private eventListeners: Map<string, Set<SceneTransitionHandler>> = new Map([
    ['sceneChangeStart', new Set()],
    ['sceneChangeComplete', new Set()],
    ['sceneChangeFail', new Set()],
    ['transitionProgress', new Set()]
  ]);
  
  /** Animation frame ID */
  private animationFrameId: number | null = null;
  
  /** Is system initialized */
  private initialized = false;
  
  /** Scene elements cache */
  private sceneElements: Map<string, HTMLElement> = new Map();
  
  /** Scene state cache */
  private sceneStateCache: Map<string, any> = new Map();
  
  /** Navigation history */
  private history: string[] = [];
  
  /** Current history index */
  private historyIndex = -1;

  /**
   * Create a new scene transition manager
   */
  constructor(config: SceneTransitionManagerConfig = {}) {
    this.config = {
      defaultDuration: 500,
      defaultEffect: TransitionEffect.FADE,
      defaultEasing: 'ease-in-out',
      defaultOverlayColor: 'rgba(0, 0, 0, 0.5)',
      defaultDepthEffect: SceneDepthEffect.NONE,
      defaultPreservation: ContentPreservation.NONE,
      handleHistory: false,
      autoStart: true,
      lazyLoadTimeout: 5000,
      debug: false,
      forceReducedMotion: false,
      durationModifier: 1.0,
      category: AnimationCategory.ATTENTION,
      ...config
    };
    
    // Register scenes
    if (this.config.scenes) {
      for (const scene of this.config.scenes) {
        this.registerScene(scene);
      }
    }
    
    // Register transitions
    if (this.config.transitions) {
      for (const transition of this.config.transitions) {
        this.registerTransition(transition);
      }
    }
    
    // Initialize container
    if (this.config.containerElement) {
      this.setContainer(this.config.containerElement);
    } else {
      this.createContainer();
    }
    
    // Create overlay
    this.createOverlay();
    
    // Set initial scene
    if (this.config.initialScene && this.config.autoStart) {
      this.initialized = true;
      
      // Use timeout to ensure DOM is ready
      setTimeout(() => {
        this.changeScene(this.config.initialScene as string, null, true);
      }, 0);
    }
    
    this.initialized = true;
  }
  
  /**
   * Register a scene configuration
   */
  registerScene(scene: SceneConfig): void {
    if (this.scenes.has(scene.id)) {
      this.logDebug(`Scene with ID ${scene.id} is already registered. Updating.`);
    }
    
    this.scenes.set(scene.id, scene);
    
    // Pre-cache element if available
    if (scene.element) {
      this.sceneElements.set(scene.id, scene.element);
    }
    
    // Preload scene if needed
    if (scene.preload && scene.lazyLoad) {
      this.preloadScene(scene.id);
    }
  }
  
  /**
   * Register multiple scenes at once
   */
  registerScenes(scenes: SceneConfig[]): void {
    for (const scene of scenes) {
      this.registerScene(scene);
    }
  }
  
  /**
   * Register a transition
   */
  registerTransition(transition: SceneTransition): void {
    const key = `${transition.from}:${transition.to}`;
    
    if (this.transitions.has(key)) {
      this.logDebug(`Transition from ${transition.from} to ${transition.to} is already registered. Updating.`);
    }
    
    this.transitions.set(key, transition);
    
    // If reversible, add reverse transition
    if (transition.reversible) {
      const reverseKey = `${transition.to}:${transition.from}`;
      
      if (!this.transitions.has(reverseKey)) {
        // Create reverse direction for the transition
        let reverseDirection: TransitionDirection | undefined = undefined;
        
        if (transition.direction) {
          switch (transition.direction) {
            case TransitionDirection.LEFT_TO_RIGHT:
              reverseDirection = TransitionDirection.RIGHT_TO_LEFT;
              break;
            case TransitionDirection.RIGHT_TO_LEFT:
              reverseDirection = TransitionDirection.LEFT_TO_RIGHT;
              break;
            case TransitionDirection.TOP_TO_BOTTOM:
              reverseDirection = TransitionDirection.BOTTOM_TO_TOP;
              break;
            case TransitionDirection.BOTTOM_TO_TOP:
              reverseDirection = TransitionDirection.TOP_TO_BOTTOM;
              break;
            case TransitionDirection.FROM_CENTER:
              reverseDirection = TransitionDirection.TO_CENTER;
              break;
            case TransitionDirection.TO_CENTER:
              reverseDirection = TransitionDirection.FROM_CENTER;
              break;
            default:
              reverseDirection = transition.direction;
          }
        }
        
        const reverseTransition: SceneTransition = {
          ...transition,
          from: transition.to,
          to: transition.from,
          direction: reverseDirection
        };
        
        this.transitions.set(reverseKey, reverseTransition);
      }
    }
  }
  
  /**
   * Register multiple transitions at once
   */
  registerTransitions(transitions: SceneTransition[]): void {
    for (const transition of transitions) {
      this.registerTransition(transition);
    }
  }
  
  /**
   * Get a registered scene by ID
   */
  getScene(sceneId: string): SceneConfig | undefined {
    return this.scenes.get(sceneId);
  }
  
  /**
   * Get a registered transition
   */
  getTransition(fromId: string, toId: string): SceneTransition | undefined {
    return this.transitions.get(`${fromId}:${toId}`);
  }
  
  /**
   * Get the currently active scene ID
   */
  getActiveSceneId(): string | null {
    return this.activeSceneId;
  }
  
  /**
   * Get the previously active scene ID
   */
  getPreviousSceneId(): string | null {
    return this.previousSceneId;
  }
  
  /**
   * Get current transition state
   */
  getTransitionState(): TransitionState {
    return { ...this.transitionState };
  }
  
  /**
   * Check if a scene is currently active
   */
  isSceneActive(sceneId: string): boolean {
    return this.activeSceneId === sceneId;
  }
  
  /**
   * Check if a transition is in progress
   */
  isTransitioning(): boolean {
    return this.transitionState.inProgress;
  }
  
  /**
   * Preload a scene if it has lazy loading
   */
  async preloadScene(sceneId: string): Promise<void> {
    const scene = this.scenes.get(sceneId);
    
    if (!scene) {
      this.logDebug(`Cannot preload scene ${sceneId}: scene not found`);
      return;
    }
    
    if (scene.lazyLoad) {
      try {
        this.logDebug(`Preloading scene ${sceneId}`);
        await scene.lazyLoad();
        this.logDebug(`Preloaded scene ${sceneId}`);
      } catch (error) {
        this.logDebug(`Error preloading scene ${sceneId}: ${error}`);
      }
    }
  }
  
  /**
   * Change to a new scene
   */
  async changeScene(
    toId: string,
    transitionOverride?: Partial<SceneTransition> | null,
    immediate = false
  ): Promise<boolean> {
    // Check if scene exists
    const toScene = this.scenes.get(toId);
    
    if (!toScene) {
      this.logDebug(`Cannot change to scene ${toId}: scene not found`);
      return false;
    }
    
    // Check if already transitioning
    if (this.transitionState.inProgress && !immediate) {
      this.logDebug(`Cannot change to scene ${toId}: transition already in progress`);
      return false;
    }
    
    // Check if already on the target scene
    if (this.activeSceneId === toId) {
      this.logDebug(`Already on scene ${toId}`);
      return true;
    }
    
    const fromId = this.activeSceneId;
    
    // Get transition configuration
    let transition: SceneTransition | null = null;
    
    if (fromId) {
      transition = this.transitions.get(`${fromId}:${toId}`) || null;
    }
    
    // Apply transition override
    if (transition && transitionOverride) {
      transition = { ...transition, ...transitionOverride };
    } else if (!transition && transitionOverride) {
      // Create a new transition using defaults and override
      transition = {
        from: fromId || '',
        to: toId,
        effect: this.config.defaultEffect as TransitionEffect,
        duration: this.config.defaultDuration,
        easing: this.config.defaultEasing,
        ...transitionOverride
      };
    } else if (!transition) {
      // Create a default transition
      transition = {
        from: fromId || '',
        to: toId,
        effect: this.config.defaultEffect as TransitionEffect,
        duration: this.config.defaultDuration,
        easing: this.config.defaultEasing
      };
    }
    
    // Apply duration modifier
    if (transition && this.config.durationModifier !== 1.0 && transition.duration) {
      transition.duration = Math.round(transition.duration * this.config.durationModifier);
    }
    
    // Check for reduced motion
    if (this.config.forceReducedMotion && transition && transition.reducedMotionAlternative) {
      const altTransition = transition.reducedMotionAlternative;
      transition = { ...transition, ...altTransition };
    }
    
    // Update transition state
    this.transitionState = {
      fromScene: fromId,
      toScene: toId,
      inProgress: true,
      isPaused: false,
      isCompleted: false,
      startTime: Date.now(),
      progress: 0,
      transition,
      error: null
    };
    
    // Dispatch event
    this.dispatchEvent('sceneChangeStart', fromId, toId, transition);
    
    try {
      // Load scene if needed
      if (toScene.lazyLoad && !this.sceneElements.has(toId)) {
        this.logDebug(`Lazy loading scene ${toId}`);
        
        try {
          // Create a promise with timeout
          const loadPromise = Promise.race([
            toScene.lazyLoad(),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error(`Timeout loading scene ${toId}`));
              }, this.config.lazyLoadTimeout);
            })
          ]);
          
          await loadPromise;
          this.logDebug(`Loaded scene ${toId}`);
        } catch (error) {
          this.logDebug(`Error loading scene ${toId}: ${error}`);
          
          // Update transition state
          this.transitionState.inProgress = false;
          this.transitionState.error = `Error loading scene: ${error}`;
          
          // Dispatch event
          this.dispatchEvent('sceneChangeFail', fromId, toId, transition);
          
          return false;
        }
      }
      
      // Get or create scene elements
      const fromElement = fromId ? await this.getSceneElement(fromId) : null;
      const toElement = await this.getSceneElement(toId);
      
      // If immediate or no transition effect, switch immediately
      if (immediate || !transition || transition.effect === TransitionEffect.NONE) {
        this.completeSceneChange(fromId, toId, fromElement, toElement);
        return true;
      }
      
      // Begin animated transition
      this.startTransitionAnimation(fromId, toId, fromElement, toElement, transition);
      
      return true;
    } catch (error) {
      this.logDebug(`Error during scene change: ${error}`);
      
      // Update transition state
      this.transitionState.inProgress = false;
      this.transitionState.error = `Error during scene change: ${error}`;
      
      // Dispatch event
      this.dispatchEvent('sceneChangeFail', fromId, toId, transition);
      
      return false;
    }
  }
  
  /**
   * Navigate back to the previous scene
   */
  back(): Promise<boolean> {
    if (this.historyIndex <= 0 || this.history.length <= 1) {
      this.logDebug('No previous scene to navigate back to');
      return Promise.resolve(false);
    }
    
    this.historyIndex--;
    const previousScene = this.history[this.historyIndex];
    
    return this.changeScene(previousScene);
  }
  
  /**
   * Navigate forward
   */
  forward(): Promise<boolean> {
    if (this.historyIndex >= this.history.length - 1) {
      this.logDebug('No next scene to navigate forward to');
      return Promise.resolve(false);
    }
    
    this.historyIndex++;
    const nextScene = this.history[this.historyIndex];
    
    return this.changeScene(nextScene);
  }
  
  /**
   * Update the transition progress manually (for custom transitions)
   */
  updateTransitionProgress(progress: number): void {
    if (!this.transitionState.inProgress) return;
    
    this.transitionState.progress = Math.min(1, Math.max(0, progress));
    
    // Dispatch event
    this.dispatchEvent('transitionProgress', 
      this.transitionState.fromScene, 
      this.transitionState.toScene as string, 
      this.transitionState.transition
    );
    
    if (this.config.onTransitionProgress) {
      this.config.onTransitionProgress(this.transitionState.progress);
    }
    
    // Complete if progress reaches 1
    if (this.transitionState.progress >= 1) {
      this.completeCurrentTransition();
    }
  }
  
  /**
   * Pause the current transition
   */
  pauseTransition(): void {
    if (!this.transitionState.inProgress || this.transitionState.isPaused) return;
    
    this.transitionState.isPaused = true;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Resume a paused transition
   */
  resumeTransition(): void {
    if (!this.transitionState.inProgress || !this.transitionState.isPaused) return;
    
    this.transitionState.isPaused = false;
    
    // Resume animation
    this.animateTransition();
  }
  
  /**
   * Cancel the current transition
   */
  cancelTransition(): void {
    if (!this.transitionState.inProgress) return;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Revert to previous state
    if (this.transitionState.fromScene) {
      this.changeScene(this.transitionState.fromScene, null, true);
    }
    
    // Reset transition state
    this.transitionState = {
      fromScene: null,
      toScene: null,
      inProgress: false,
      isPaused: false,
      isCompleted: false,
      startTime: null,
      progress: 0,
      transition: null,
      error: null
    };
  }
  
  /**
   * Force complete the current transition
   */
  completeTransition(): void {
    if (!this.transitionState.inProgress) return;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.completeCurrentTransition();
  }
  
  /**
   * Set the container element
   */
  setContainer(element: HTMLElement): void {
    this.container = element;
    
    // Add necessary styles
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    
    // Create overlay if needed
    if (!this.overlayElement) {
      this.createOverlay();
    }
  }
  
  /**
   * Add event listener
   */
  addEventListener(
    event: 'sceneChangeStart' | 'sceneChangeComplete' | 'sceneChangeFail' | 'transitionProgress',
    handler: SceneTransitionHandler
  ): void {
    const listeners = this.eventListeners.get(event);
    
    if (listeners) {
      listeners.add(handler);
    }
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(
    event: 'sceneChangeStart' | 'sceneChangeComplete' | 'sceneChangeFail' | 'transitionProgress',
    handler: SceneTransitionHandler
  ): void {
    const listeners = this.eventListeners.get(event);
    
    if (listeners) {
      listeners.delete(handler);
    }
  }
  
  /**
   * Dispose resources and remove event listeners
   */
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clear event listeners
    this.eventListeners.forEach(listeners => {
      listeners.clear();
    });
    
    // Remove overlay
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }
    
    // Reset state
    this.activeSceneId = null;
    this.previousSceneId = null;
    this.transitionState = {
      fromScene: null,
      toScene: null,
      inProgress: false,
      isPaused: false,
      isCompleted: false,
      startTime: null,
      progress: 0,
      transition: null,
      error: null
    };
  }
  
  /**
   * Create container element if not exists
   */
  private createContainer(): void {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.className = 'scene-transition-container';
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.overflow = 'hidden';
    
    // Append to body by default
    document.body.appendChild(this.container);
  }
  
  /**
   * Create overlay element for transitions
   */
  private createOverlay(): void {
    if (!this.container) return;
    
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'scene-transition-overlay';
    this.overlayElement.style.position = 'absolute';
    this.overlayElement.style.top = '0';
    this.overlayElement.style.left = '0';
    this.overlayElement.style.width = '100%';
    this.overlayElement.style.height = '100%';
    this.overlayElement.style.pointerEvents = 'none';
    this.overlayElement.style.zIndex = '1000';
    this.overlayElement.style.opacity = '0';
    this.overlayElement.style.transition = 'opacity 0.3s ease-in-out';
    this.overlayElement.style.backgroundColor = this.config.defaultOverlayColor || 'rgba(0, 0, 0, 0.5)';
    
    this.container.appendChild(this.overlayElement);
  }
  
  /**
   * Get or create a scene element
   */
  private async getSceneElement(sceneId: string): Promise<HTMLElement> {
    // Check if element is cached
    if (this.sceneElements.has(sceneId)) {
      return this.sceneElements.get(sceneId) as HTMLElement;
    }
    
    const scene = this.scenes.get(sceneId);
    
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }
    
    // If scene has element property, use it
    if (scene.element) {
      this.sceneElements.set(sceneId, scene.element);
      return scene.element;
    }
    
    // Try to find element using container selector
    if (scene.container && document.querySelector(scene.container)) {
      const element = document.querySelector(scene.container) as HTMLElement;
      this.sceneElements.set(sceneId, element);
      return element;
    }
    
    // Create new element
    const element = document.createElement('div');
    element.id = `scene-${sceneId}`;
    element.className = `scene scene-${sceneId}`;
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.display = 'none';
    
    if (scene.zIndex !== undefined) {
      element.style.zIndex = scene.zIndex.toString();
    }
    
    // Cache element
    this.sceneElements.set(sceneId, element);
    
    // Add to container
    if (this.container) {
      this.container.appendChild(element);
    }
    
    return element;
  }
  
  /**
   * Start transition animation between scenes
   */
  private startTransitionAnimation(
    fromId: string | null,
    toId: string,
    fromElement: HTMLElement | null,
    toElement: HTMLElement,
    transition: SceneTransition
  ): void {
    // Make sure elements are ready
    if (fromElement) {
      fromElement.style.display = 'block';
      fromElement.style.zIndex = '10';
    }
    
    toElement.style.display = 'block';
    toElement.style.zIndex = '20';
    
    // Save current state for preservation if needed
    if (fromId && transition.preservation === ContentPreservation.CACHE) {
      this.cacheSceneState(fromId);
    }
    
    // Show overlay if needed
    if (transition.showOverlay && this.overlayElement) {
      this.overlayElement.style.backgroundColor = this.config.defaultOverlayColor || 'rgba(0, 0, 0, 0.5)';
      this.overlayElement.style.opacity = '1';
    }
    
    // Apply 3D depth effect if needed
    if (transition.depthEffect !== SceneDepthEffect.NONE) {
      this.applyDepthEffect(fromElement, toElement, transition.depthEffect);
    }
    
    // Custom transition
    if (transition.effect === TransitionEffect.CUSTOM && transition.customTransition) {
      transition.customTransition(
        fromElement as HTMLElement,
        toElement,
        this.container as HTMLElement,
        () => this.completeCurrentTransition()
      );
      return;
    }
    
    // Apply initial styles for animation
    this.applyTransitionStyles(fromElement, toElement, transition, 0);
    
    // Start animation loop
    this.animateTransition();
  }
  
  /**
   * Animate transition progress
   */
  private animateTransition = (): void => {
    if (!this.transitionState.inProgress || this.transitionState.isPaused) return;
    
    // Calculate progress
    const { startTime, transition } = this.transitionState;
    const currentTime = Date.now();
    const duration = transition?.duration || this.config.defaultDuration || 500;
    const elapsed = startTime ? currentTime - startTime : 0;
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Apply easing
    const easing = transition?.easing || this.config.defaultEasing || 'ease-in-out';
    const progress = this.applyEasing(rawProgress, easing);
    
    // Update state
    this.transitionState.progress = progress;
    
    // Get current scene elements
    const fromId = this.transitionState.fromScene;
    const toId = this.transitionState.toScene;
    
    if (!toId) return;
    
    const fromElement = fromId ? this.sceneElements.get(fromId) || null : null;
    const toElement = this.sceneElements.get(toId) || null;
    
    if (!toElement) return;
    
    // Apply transition styles
    if (transition) {
      this.applyTransitionStyles(fromElement, toElement, transition, progress);
    }
    
    // Dispatch progress event
    this.dispatchEvent('transitionProgress', fromId, toId, transition);
    
    if (this.config.onTransitionProgress) {
      this.config.onTransitionProgress(progress);
    }
    
    // Check if complete
    if (progress >= 1) {
      this.completeCurrentTransition();
      return;
    }
    
    // Continue animation
    this.animationFrameId = requestAnimationFrame(this.animateTransition);
  };
  
  /**
   * Apply easing function to progress
   */
  private applyEasing(progress: number, easing: string): number {
    switch (easing) {
      case 'linear':
        return progress;
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return progress * (2 - progress);
      case 'ease-in-out':
        return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      case 'easeInQuad':
        return progress * progress;
      case 'easeOutQuad':
        return progress * (2 - progress);
      case 'easeInCubic':
        return progress * progress * progress;
      case 'easeOutCubic':
        return (--progress) * progress * progress + 1;
      case 'easeInOutCubic':
        return progress < 0.5 ?
          4 * progress * progress * progress :
          (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
      case 'easeInExpo':
        return progress === 0 ? 0 : Math.pow(2, 10 * (progress - 1));
      case 'easeOutExpo':
        return progress === 1 ? 1 : -Math.pow(2, -10 * progress) + 1;
      case 'easeInOutExpo':
        if (progress === 0) return 0;
        if (progress === 1) return 1;
        if ((progress *= 2) < 1) return 0.5 * Math.pow(2, 10 * (progress - 1));
        return 0.5 * (-Math.pow(2, -10 * --progress) + 2);
      case 'easeInBack':
        const s = 1.70158;
        return progress * progress * ((s + 1) * progress - s);
      case 'easeOutBack':
        const s2 = 1.70158;
        return (progress = progress - 1) * progress * ((s2 + 1) * progress + s2) + 1;
      default:
        return progress;
    }
  }
  
  /**
   * Apply styles for different transition effects
   */
  private applyTransitionStyles(
    fromElement: HTMLElement | null,
    toElement: HTMLElement,
    transition: SceneTransition,
    progress: number
  ): void {
    const { effect, direction } = transition;
    
    // Reset transform and opacity
    const resetStyles = () => {
      if (fromElement) {
        fromElement.style.transform = '';
        fromElement.style.opacity = '1';
      }
      toElement.style.transform = '';
      toElement.style.opacity = '1';
    };
    
    switch (effect) {
      case TransitionEffect.FADE:
        if (fromElement) {
          fromElement.style.opacity = (1 - progress).toString();
        }
        toElement.style.opacity = progress.toString();
        break;
        
      case TransitionEffect.SLIDE:
        const getSlideOffset = () => {
          switch (direction) {
            case TransitionDirection.LEFT_TO_RIGHT:
              return `-100%`;
            case TransitionDirection.RIGHT_TO_LEFT:
              return `100%`;
            case TransitionDirection.TOP_TO_BOTTOM:
              return `0, -100%`;
            case TransitionDirection.BOTTOM_TO_TOP:
              return `0, 100%`;
            default:
              return `100%`;
          }
        };
        
        const offset = getSlideOffset();
        const isVertical = offset.includes(',');
        
        if (fromElement) {
          fromElement.style.transition = 'none';
          if (isVertical) {
            fromElement.style.transform = `translate(${offset.replace('-', '')})`;
          } else {
            fromElement.style.transform = `translateX(${progress * parseFloat(offset)}px)`;
          }
        }
        
        toElement.style.transition = 'none';
        if (isVertical) {
          toElement.style.transform = `translate(${offset}) translate(0, ${progress * 100}%)`;
        } else {
          toElement.style.transform = `translateX(calc(${offset} * ${1 - progress}))`;
        }
        break;
        
      case TransitionEffect.ZOOM:
        const getZoomDirection = () => {
          switch (direction) {
            case TransitionDirection.FROM_CENTER:
              return { from: 0.5, to: 1 };
            case TransitionDirection.TO_CENTER:
              return { from: 1, to: 0.5 };
            default:
              return { from: 0.8, to: 1 };
          }
        };
        
        const zoom = getZoomDirection();
        
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.opacity = (1 - progress).toString();
          const fromScale = 1 - (1 - zoom.from) * progress;
          fromElement.style.transform = `scale(${fromScale})`;
        }
        
        toElement.style.transition = 'none';
        toElement.style.opacity = progress.toString();
        const toScale = zoom.to + (1 - zoom.to) * progress;
        toElement.style.transform = `scale(${toScale})`;
        break;
        
      case TransitionEffect.ROTATE:
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.opacity = (1 - progress).toString();
          fromElement.style.transform = `rotate(${progress * 90}deg)`;
        }
        
        toElement.style.transition = 'none';
        toElement.style.opacity = progress.toString();
        toElement.style.transform = `rotate(${(1 - progress) * -90}deg)`;
        break;
        
      case TransitionEffect.FOLD:
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.opacity = (1 - progress).toString();
          fromElement.style.transformOrigin = 'left center';
          fromElement.style.transform = `perspective(1200px) rotateY(${progress * 90}deg)`;
        }
        
        toElement.style.transition = 'none';
        toElement.style.opacity = progress.toString();
        toElement.style.transformOrigin = 'right center';
        toElement.style.transform = `perspective(1200px) rotateY(${(1 - progress) * -90}deg)`;
        break;
        
      case TransitionEffect.DISSOLVE:
        // Simple dissolve using css clip-path
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.clipPath = `circle(${100 - progress * 100}% at center)`;
        }
        
        toElement.style.transition = 'none';
        toElement.style.clipPath = `circle(${progress * 100}% at center)`;
        break;
        
      case TransitionEffect.WIPE:
        const getWipeDirection = () => {
          switch (direction) {
            case TransitionDirection.LEFT_TO_RIGHT:
              return { fromVal: `inset(0 ${progress * 100}% 0 0)`, toVal: `inset(0 0 0 ${(1 - progress) * 100}%)` };
            case TransitionDirection.RIGHT_TO_LEFT:
              return { fromVal: `inset(0 0 0 ${progress * 100}%)`, toVal: `inset(0 ${(1 - progress) * 100}% 0 0)` };
            case TransitionDirection.TOP_TO_BOTTOM:
              return { fromVal: `inset(${progress * 100}% 0 0 0)`, toVal: `inset(0 0 ${(1 - progress) * 100}% 0)` };
            case TransitionDirection.BOTTOM_TO_TOP:
              return { fromVal: `inset(0 0 ${progress * 100}% 0)`, toVal: `inset(${(1 - progress) * 100}% 0 0 0)` };
            default:
              return { fromVal: `inset(0 ${progress * 100}% 0 0)`, toVal: `inset(0 0 0 ${(1 - progress) * 100}%)` };
          }
        };
        
        const wipe = getWipeDirection();
        
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.clipPath = wipe.fromVal;
        }
        
        toElement.style.transition = 'none';
        toElement.style.clipPath = wipe.toVal;
        break;
        
      case TransitionEffect.CROSSFADE:
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.opacity = (1 - progress).toString();
        }
        
        toElement.style.transition = 'none';
        toElement.style.opacity = progress.toString();
        break;
        
      case TransitionEffect.BLUR:
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.opacity = (1 - progress).toString();
          fromElement.style.filter = `blur(${progress * 20}px)`;
        }
        
        toElement.style.transition = 'none';
        toElement.style.opacity = progress.toString();
        toElement.style.filter = `blur(${(1 - progress) * 20}px)`;
        break;
        
      case TransitionEffect.CUBE:
        this.container!.style.perspective = '1200px';
        
        const getCubeDirection = () => {
          switch (direction) {
            case TransitionDirection.LEFT_TO_RIGHT:
              return { fromRotate: progress * -90, toRotate: 90 - progress * 90, fromTranslate: 50, toTranslate: -50 };
            case TransitionDirection.RIGHT_TO_LEFT:
              return { fromRotate: progress * 90, toRotate: -90 + progress * 90, fromTranslate: -50, toTranslate: 50 };
            default:
              return { fromRotate: progress * -90, toRotate: 90 - progress * 90, fromTranslate: 50, toTranslate: -50 };
          }
        };
        
        const cube = getCubeDirection();
        
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.backfaceVisibility = 'hidden';
          fromElement.style.transformOrigin = `center center ${cube.fromTranslate}%`;
          fromElement.style.transform = `rotateY(${cube.fromRotate}deg) translateZ(${cube.fromTranslate}%)`;
        }
        
        toElement.style.transition = 'none';
        toElement.style.backfaceVisibility = 'hidden';
        toElement.style.transformOrigin = `center center ${cube.toTranslate}%`;
        toElement.style.transform = `rotateY(${cube.toRotate}deg) translateZ(${cube.toTranslate}%)`;
        break;
        
      case TransitionEffect.FLIP:
        this.container!.style.perspective = '1200px';
        
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.backfaceVisibility = 'hidden';
          fromElement.style.transform = `rotateY(${progress * 180}deg)`;
          fromElement.style.opacity = progress > 0.5 ? '0' : (1 - progress * 2).toString();
        }
        
        toElement.style.transition = 'none';
        toElement.style.backfaceVisibility = 'hidden';
        toElement.style.transform = `rotateY(${180 - progress * 180}deg)`;
        toElement.style.opacity = progress < 0.5 ? '0' : ((progress - 0.5) * 2).toString();
        break;
        
      case TransitionEffect.RIPPLE:
        // Use radial gradient for ripple effect
        if (fromElement) {
          fromElement.style.transition = 'none';
          fromElement.style.opacity = (1 - progress).toString();
        }
        
        const center = 'center center';
        toElement.style.transition = 'none';
        toElement.style.backgroundImage = `radial-gradient(circle at ${center}, transparent ${Math.max(0, 100 - progress * 120)}%, rgba(0,0,0,0.1) 100%)`;
        toElement.style.opacity = progress.toString();
        break;
        
      case TransitionEffect.NONE:
      default:
        resetStyles();
        break;
    }
  }
  
  /**
   * Apply 3D depth effect
   */
  private applyDepthEffect(
    fromElement: HTMLElement | null,
    toElement: HTMLElement,
    effect: SceneDepthEffect
  ): void {
    if (!this.container) return;
    
    switch (effect) {
      case SceneDepthEffect.LAYERED:
        this.container.style.perspective = '1200px';
        
        if (fromElement) {
          fromElement.style.transform = 'translateZ(0)';
        }
        
        toElement.style.transform = 'translateZ(50px)';
        break;
        
      case SceneDepthEffect.PERSPECTIVE:
        this.container.style.perspective = '1200px';
        
        if (fromElement) {
          fromElement.style.transform = 'perspective(1200px) rotateX(0) translateZ(0)';
        }
        
        toElement.style.transform = 'perspective(1200px) rotateX(5deg) translateZ(50px)';
        break;
        
      case SceneDepthEffect.PARALLAX:
        if (fromElement) {
          fromElement.style.transition = 'transform 0.5s ease-out';
          
          // Add parallax effect to background elements
          const fromSceneId = this.transitionState.fromScene;
          const fromScene = fromSceneId ? this.scenes.get(fromSceneId) : null;
          
          if (fromScene && fromScene.backgroundElements) {
            const bgElements = fromElement.querySelectorAll(fromScene.backgroundElements);
            
            bgElements.forEach((el, i) => {
              const depth = (bgElements.length - i) / bgElements.length;
              (el as HTMLElement).style.transform = `translateX(${-50 * depth}px)`;
            });
          }
        }
        
        // Add parallax effect to background elements in target scene
        const toSceneId = this.transitionState.toScene;
        const toScene = toSceneId ? this.scenes.get(toSceneId) : null;
        
        if (toScene && toScene.backgroundElements) {
          const bgElements = toElement.querySelectorAll(toScene.backgroundElements);
          
          bgElements.forEach((el, i) => {
            const depth = (i + 1) / bgElements.length;
            (el as HTMLElement).style.transition = 'transform 0.5s ease-out';
            (el as HTMLElement).style.transform = `translateX(${50 * depth}px)`;
            
            // Reset transform after transition
            setTimeout(() => {
              (el as HTMLElement).style.transform = '';
            }, 500);
          });
        }
        break;
        
      case SceneDepthEffect.FLOATING:
        this.container.style.perspective = '1200px';
        
        toElement.style.animation = 'floating 6s ease-in-out infinite';
        
        // Add floating keyframes if not already present
        if (!document.querySelector('#scene-floating-keyframes')) {
          const keyframes = document.createElement('style');
          keyframes.id = 'scene-floating-keyframes';
          keyframes.textContent = `
            @keyframes floating {
              0% { transform: translateY(0px) translateZ(20px); }
              50% { transform: translateY(-10px) translateZ(30px); }
              100% { transform: translateY(0px) translateZ(20px); }
            }
          `;
          document.head.appendChild(keyframes);
        }
        break;
        
      case SceneDepthEffect.NONE:
      default:
        if (fromElement) {
          fromElement.style.transform = '';
        }
        toElement.style.transform = '';
        break;
    }
  }
  
  /**
   * Complete the current transition
   */
  private completeCurrentTransition(): void {
    const fromId = this.transitionState.fromScene;
    const toId = this.transitionState.toScene;
    
    if (!toId) return;
    
    const fromElement = fromId ? this.sceneElements.get(fromId) || null : null;
    const toElement = this.sceneElements.get(toId) || null;
    
    if (!toElement) return;
    
    // Complete transition
    this.completeSceneChange(fromId, toId, fromElement, toElement);
  }
  
  /**
   * Complete scene change
   */
  private completeSceneChange(
    fromId: string | null,
    toId: string,
    fromElement: HTMLElement | null,
    toElement: HTMLElement
  ): void {
    // Get scene configs
    const fromScene = fromId ? this.scenes.get(fromId) : null;
    const toScene = this.scenes.get(toId);
    
    if (!toScene) return;
    
    // Update active scene
    this.previousSceneId = this.activeSceneId;
    this.activeSceneId = toId;
    
    // Update display and z-index
    if (fromElement) {
      fromElement.style.display = 'none';
      fromElement.style.opacity = '1';
      fromElement.style.transform = '';
      fromElement.style.clipPath = '';
      fromElement.style.filter = '';
      
      // Remove active class if defined
      if (fromScene && fromScene.activeClass) {
        fromElement.classList.remove(fromScene.activeClass);
      }
      
      // Call deactivate callback
      if (fromScene && fromScene.onDeactivate) {
        fromScene.onDeactivate();
      }
    }
    
    toElement.style.display = 'block';
    toElement.style.opacity = '1';
    toElement.style.transform = '';
    toElement.style.clipPath = '';
    toElement.style.filter = '';
    toElement.style.zIndex = '10';
    
    // Add active class if defined
    if (toScene.activeClass) {
      toElement.classList.add(toScene.activeClass);
    }
    
    // Hide overlay
    if (this.overlayElement) {
      this.overlayElement.style.opacity = '0';
    }
    
    // Reset container style
    if (this.container) {
      this.container.style.perspective = '';
    }
    
    // Update history if enabled
    if (this.config.handleHistory) {
      // Remove forward history if we're not at the end
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      
      this.history.push(toId);
      this.historyIndex = this.history.length - 1;
    }
    
    // Call activate callback
    if (toScene.onActivate) {
      toScene.onActivate();
    }
    
    // Update transition state
    this.transitionState = {
      fromScene: null,
      toScene: null,
      inProgress: false,
      isPaused: false,
      isCompleted: true,
      startTime: null,
      progress: 1,
      transition: null,
      error: null
    };
    
    // Dispatch event
    this.dispatchEvent('sceneChangeComplete', fromId, toId, null);
    
    if (this.config.onSceneChangeComplete) {
      this.config.onSceneChangeComplete(fromId, toId);
    }
  }
  
  /**
   * Dispatch an event
   */
  private dispatchEvent(
    event: string,
    fromId: string | null,
    toId: string,
    transition: SceneTransition | null
  ): void {
    const listeners = this.eventListeners.get(event);
    
    if (listeners) {
      listeners.forEach(handler => {
        handler(fromId, toId, transition);
      });
    }
  }
  
  /**
   * Cache scene state for later restoration
   */
  private cacheSceneState(sceneId: string): void {
    const scene = this.scenes.get(sceneId);
    
    if (!scene) return;
    
    // For now, just cache by storing in a map
    // For more complex state management, this could integrate with app state management
    this.sceneStateCache.set(sceneId, {
      timestamp: Date.now()
    });
  }
  
  /**
   * Log debug messages if enabled
   */
  private logDebug(message: string): void {
    if (this.config.debug) {
      console.log(`[SceneTransitionManager] ${message}`);
    }
  }
}

export default SceneTransitionManager;