import { Vector2D } from '../types';
import { 
  GestureType as GestureTypeImported, 
  GestureState, 
  GestureEventData, 
  createGestureDetector 
} from './GestureDetector';

// Export the type for type references
export type GestureType = GestureTypeImported;
// Export the value for runtime usage
export { GestureTypeImported };
import { SpringPhysics, createSpring } from '../springPhysics';

/**
 * Presets for common gesture animation configurations
 */
export enum GestureAnimationPreset {
  SPRING_BOUNCE = 'springBounce',
  INERTIAL_SLIDE = 'inertialSlide',
  MAGNETIC_SNAP = 'magneticSnap',
  ELASTIC_DRAG = 'elasticDrag',
  MOMENTUM_FLICK = 'momentumFlick',
  GRAVITY_PULL = 'gravityPull',
  ROTATION_SPIN = 'rotationSpin',
  PINCH_ZOOM = 'pinchZoom'
}

/**
 * Configuration for gesture animations
 */
export interface GestureAnimationConfig {
  element: HTMLElement;
  gestures: GestureType[];
  
  // Spring physics options
  tension?: number;
  friction?: number;
  mass?: number;
  
  // Inertial movement options
  velocityScale?: number;
  deceleration?: number;
  minVelocity?: number;
  
  // Boundary options
  boundaries?: {
    x?: { min?: number; max?: number };
    y?: { min?: number; max?: number };
    scale?: { min?: number; max?: number };
    rotation?: { min?: number; max?: number };
  };
  
  // Snap points configuration
  snapPoints?: Vector2D[];
  snapThreshold?: number;
  
  // Transform options
  allowTranslateX?: boolean;
  allowTranslateY?: boolean;
  allowScale?: boolean;
  allowRotate?: boolean;
  
  // Multipliers for gesture impact
  translateMultiplier?: number;
  scaleMultiplier?: number;
  rotateMultiplier?: number;
  
  // Control options
  shouldCaptureGesture?: (data: GestureEventData) => boolean;
  onGestureStart?: (data: GestureEventData) => void;
  onGestureUpdate?: (data: GestureEventData, transform: GestureTransform) => void;
  onGestureEnd?: (data: GestureEventData, transform: GestureTransform) => void;
  onTransformChange?: (transform: GestureTransform) => void;
  
  // Presets for quick configuration
  preset?: GestureAnimationPreset;
}

/**
 * Current transform state for animated element
 */
export interface GestureTransform {
  translateX: number;
  translateY: number;
  scale: number;
  rotation: number;
  velocity: Vector2D;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<GestureAnimationConfig> = {
  gestures: [
    GestureTypeImported.PAN,
    GestureTypeImported.PINCH,
    GestureTypeImported.ROTATE,
    GestureTypeImported.SWIPE
  ],
  tension: 180,
  friction: 12,
  mass: 1,
  velocityScale: 1,
  deceleration: 0.95,
  minVelocity: 0.01,
  boundaries: {
    scale: { min: 0.5, max: 3 }
  },
  snapThreshold: 20,
  allowTranslateX: true,
  allowTranslateY: true,
  allowScale: true,
  allowRotate: true,
  translateMultiplier: 1,
  scaleMultiplier: 0.01,
  rotateMultiplier: 1,
  shouldCaptureGesture: () => true
};

/**
 * Preset configurations for quick setup
 */
const PRESETS: Record<GestureAnimationPreset, Partial<GestureAnimationConfig>> = {
  [GestureAnimationPreset.SPRING_BOUNCE]: {
    tension: 200,
    friction: 10,
    mass: 1,
    velocityScale: 1.2
  },
  [GestureAnimationPreset.INERTIAL_SLIDE]: {
    tension: 120,
    friction: 14,
    velocityScale: 1.5,
    deceleration: 0.9
  },
  [GestureAnimationPreset.MAGNETIC_SNAP]: {
    tension: 300,
    friction: 15,
    snapThreshold: 50
  },
  [GestureAnimationPreset.ELASTIC_DRAG]: {
    tension: 100,
    friction: 10,
    mass: 1.5,
    translateMultiplier: 0.5
  },
  [GestureAnimationPreset.MOMENTUM_FLICK]: {
    tension: 80,
    friction: 8,
    velocityScale: 2,
    deceleration: 0.85
  },
  [GestureAnimationPreset.GRAVITY_PULL]: {
    tension: 400,
    friction: 20,
    mass: 2,
    velocityScale: 0.8
  },
  [GestureAnimationPreset.ROTATION_SPIN]: {
    allowRotate: true,
    rotateMultiplier: 1.5,
    tension: 50,
    friction: 10
  },
  [GestureAnimationPreset.PINCH_ZOOM]: {
    allowScale: true,
    scaleMultiplier: 0.02,
    tension: 150,
    friction: 15,
    boundaries: {
      scale: { min: 0.1, max: 5 }
    }
  }
};

/**
 * Main class for handling gesture-driven animations
 */
export class GestureAnimation {
  private config: GestureAnimationConfig;
  private detector: ReturnType<typeof createGestureDetector>;
  private transform: GestureTransform;
  private initialTransform: GestureTransform;
  private gestureStartTransform: GestureTransform;
  private isAnimating = false;
  private animationFrame: number | null = null;
  private initialGestureData: GestureEventData | null = null;
  private lastPinchScale = 1;
  private lastRotation = 0;
  
  constructor(config: GestureAnimationConfig) {
    // Merge config with defaults and any preset if specified
    this.config = {
      ...DEFAULT_CONFIG,
      ...(config.preset ? PRESETS[config.preset] : {}),
      ...config
    };
    
    // Initialize transform state
    this.transform = {
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotation: 0,
      velocity: { x: 0, y: 0 }
    };
    
    // Store initial state for resets
    this.initialTransform = { ...this.transform };
    this.gestureStartTransform = { ...this.transform };
    
    // Initialize gesture detector
    this.detector = createGestureDetector(this.config.element, {
      enableMouseEvents: true,
      enableTouchEvents: true
    });
    
    // Attach gesture handlers
    this.attachGestureHandlers();
    
    // Apply initial transform to element
    this.applyTransform();
  }
  
  /**
   * Attach handlers for requested gesture types
   */
  private attachGestureHandlers(): void {
    // Add handlers for each gesture type
    this.config.gestures.forEach(gestureType => {
      this.detector.on(gestureType, this.handleGesture);
    });
  }
  
  /**
   * Main gesture handler
   */
  private handleGesture = (data: GestureEventData): void => {
    // Skip if the custom filter function returns false
    if (!this.config.shouldCaptureGesture?.(data)) {
      return;
    }
    
    switch (data.state) {
      case GestureState.BEGAN:
        this.handleGestureStart(data);
        break;
      case GestureState.CHANGED:
        this.handleGestureChange(data);
        break;
      case GestureState.ENDED:
      case GestureState.RECOGNIZED:
        this.handleGestureEnd(data);
        break;
      case GestureState.CANCELLED:
        this.handleGestureCancel(data);
        break;
    }
  };
  
  /**
   * Handle gesture start
   */
  private handleGestureStart(data: GestureEventData): void {
    // Store initial gesture data for calculations
    this.initialGestureData = data;
    
    // Store the transform at the start of the gesture
    this.gestureStartTransform = { ...this.transform };
    
    // Reset tracking values
    this.lastPinchScale = 1;
    this.lastRotation = 0;
    
    // Stop any ongoing animations
    this.stopAnimation();
    
    // Call the onGestureStart callback if provided
    this.config.onGestureStart?.(data);
  }
  
  /**
   * Handle gesture change
   */
  private handleGestureChange(data: GestureEventData): void {
    if (!this.initialGestureData) {
      // If no initial data, treat this as a start
      this.handleGestureStart(data);
      return;
    }
    
    const { type } = data;
    
    // Process different gesture types
    switch (type) {
      case GestureTypeImported.PAN:
        this.handlePanGesture(data);
        break;
      case GestureTypeImported.PINCH:
        this.handlePinchGesture(data);
        break;
      case GestureTypeImported.ROTATE:
        this.handleRotateGesture(data);
        break;
      case GestureTypeImported.SWIPE:
        // Swipe is typically handled on end, not during change
        break;
    }
    
    // Apply the new transform to the element
    this.applyTransform();
    
    // Call the onGestureUpdate callback if provided
    this.config.onGestureUpdate?.(data, this.transform);
  }
  
  /**
   * Handle gesture end
   */
  private handleGestureEnd(data: GestureEventData): void {
    if (!this.initialGestureData) return;
    
    const { type } = data;
    
    // Process different gesture types
    switch (type) {
      case GestureTypeImported.SWIPE:
        this.handleSwipeGesture(data);
        break;
      default:
        // For other gestures, check if inertia should be applied
        if (this.shouldApplyInertia(data)) {
          this.startInertialAnimation(data);
        } else {
          this.checkSnapPoints();
        }
        break;
    }
    
    // Reset initial gesture data
    this.initialGestureData = null;
    
    // Call the onGestureEnd callback if provided
    this.config.onGestureEnd?.(data, this.transform);
  }
  
  /**
   * Handle gesture cancellation
   */
  private handleGestureCancel(data: GestureEventData): void {
    // Reset to state before gesture started
    this.transform = { ...this.gestureStartTransform };
    this.applyTransform();
    
    // Reset initial gesture data
    this.initialGestureData = null;
    
    // Call the onGestureEnd callback if provided
    this.config.onGestureEnd?.(data, this.transform);
  }
  
  /**
   * Handle pan gesture
   */
  private handlePanGesture(data: GestureEventData): void {
    if (!this.config.allowTranslateX && !this.config.allowTranslateY) {
      return;
    }
    
    const movement = data.movement;
    const multiplier = this.config.translateMultiplier || 1;
    
    // Apply movement based on allowed directions
    if (this.config.allowTranslateX) {
      this.transform.translateX = 
        this.gestureStartTransform.translateX + movement.x * multiplier;
    }
    
    if (this.config.allowTranslateY) {
      this.transform.translateY = 
        this.gestureStartTransform.translateY + movement.y * multiplier;
    }
    
    // Update velocity
    this.transform.velocity = {
      x: data.velocity.x * multiplier,
      y: data.velocity.y * multiplier
    };
    
    // Apply boundaries if configured
    this.applyBoundaries();
  }
  
  /**
   * Handle pinch gesture
   */
  private handlePinchGesture(data: GestureEventData): void {
    if (!this.config.allowScale || !data.scale) {
      return;
    }
    
    // Calculate relative scale since last update
    const scaleDelta = data.scale / this.lastPinchScale;
    this.lastPinchScale = data.scale;
    
    // Apply scale with multiplier
    const multiplier = this.config.scaleMultiplier || 0.01;
    this.transform.scale = this.transform.scale * 
      (1 + (scaleDelta - 1) * multiplier);
    
    // Apply boundaries if configured
    this.applyBoundaries();
  }
  
  /**
   * Handle rotate gesture
   */
  private handleRotateGesture(data: GestureEventData): void {
    if (!this.config.allowRotate || data.rotation === undefined) {
      return;
    }
    
    // Calculate rotation delta since last update
    const rotationDelta = data.rotation - this.lastRotation;
    this.lastRotation = data.rotation;
    
    // Apply rotation with multiplier
    const multiplier = this.config.rotateMultiplier || 1;
    this.transform.rotation += rotationDelta * multiplier;
    
    // Normalize rotation to -180 to 180 degrees
    if (this.transform.rotation > 180) this.transform.rotation -= 360;
    if (this.transform.rotation < -180) this.transform.rotation += 360;
    
    // Apply boundaries if configured
    this.applyBoundaries();
  }
  
  /**
   * Handle swipe gesture
   */
  private handleSwipeGesture(data: GestureEventData): void {
    // Apply swipe velocity for inertial animation
    const velocityScale = this.config.velocityScale || 1;
    
    this.transform.velocity = {
      x: data.velocity.x * velocityScale,
      y: data.velocity.y * velocityScale
    };
    
    // Start inertial animation
    this.startInertialAnimation(data);
  }
  
  /**
   * Check if inertia should be applied based on velocity
   */
  private shouldApplyInertia(data: GestureEventData): boolean {
    const velocity = data.velocity;
    const minVelocity = this.config.minVelocity || 0.01;
    
    return Math.abs(velocity.x) > minVelocity || Math.abs(velocity.y) > minVelocity;
  }
  
  /**
   * Start inertial animation after gesture ends
   */
  private startInertialAnimation(data: GestureEventData): void {
    // Skip if already animating
    if (this.isAnimating) {
      return;
    }
    
    this.isAnimating = true;
    
    // Set up initial state for inertial movement
    let state = {
      position: {
        x: this.transform.translateX,
        y: this.transform.translateY
      },
      velocity: this.transform.velocity,
      timestamp: data.timestamp
    };
    
    // Create inertial movement calculations
    const inertial = {
      createInertialMovement: (config?: any) => {
        return {
          update: (state: any) => {
            // Apply deceleration to velocity
            const deceleration = this.config.deceleration || 0.95;
            const velocity = {
              x: state.velocity.x * deceleration,
              y: state.velocity.y * deceleration
            };
            
            // Check if velocity is below threshold
            const minVelocity = this.config.minVelocity || 0.01;
            const isAtRest = 
              Math.abs(velocity.x) < minVelocity && 
              Math.abs(velocity.y) < minVelocity;
            
            // Update position based on velocity
            const position = {
              x: state.position.x + velocity.x,
              y: state.position.y + velocity.y
            };
            
            return {
              position,
              velocity,
              isAtRest
            };
          }
        };
      }
    };

    // Animation loop
    const animate = () => {
      const now = Date.now();
      const dt = Math.min(now - state.timestamp, 64) / 1000; // Cap at 64ms to avoid big jumps
      
      // Calculate new state using inertial physics
      const updatedState = inertial.createInertialMovement().update(state);
      
      // Update state with new values
      state = {
        ...state,
        position: updatedState.position,
        velocity: updatedState.velocity
      };
      
      // Update transform with new position
      this.transform.translateX = state.position.x;
      this.transform.translateY = state.position.y;
      this.transform.velocity = state.velocity;
      
      // Apply transform
      this.applyTransform();
      
      // Continue animation if velocity is still significant
      if (
        Math.abs(state.velocity.x) > (this.config.minVelocity || 0.01) ||
        Math.abs(state.velocity.y) > (this.config.minVelocity || 0.01)
      ) {
        this.animationFrame = requestAnimationFrame(animate);
        state.timestamp = now;
      } else {
        // Animation completed, check for snap points
        this.checkSnapPoints();
        this.isAnimating = false;
      }
    };
    
    // Start animation loop
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  /**
   * Check if transform should snap to configured snap points
   */
  private checkSnapPoints(): void {
    const snapPoints = this.config.snapPoints;
    if (!snapPoints || snapPoints.length === 0) {
      return;
    }
    
    const threshold = this.config.snapThreshold || 20;
    const currentPosition = {
      x: this.transform.translateX,
      y: this.transform.translateY
    };
    
    // Find the closest snap point
    let closestSnapPoint: Vector2D | null = null;
    let closestDistance = Infinity;
    
    for (const snapPoint of snapPoints) {
      const dx = snapPoint.x - currentPosition.x;
      const dy = snapPoint.y - currentPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnapPoint = snapPoint;
      }
    }
    
    // If within threshold, animate to the snap point
    if (closestSnapPoint && closestDistance <= threshold) {
      this.animateToPosition(closestSnapPoint);
    }
  }
  
  /**
   * Animate to a specific position using spring physics
   */
  private animateToPosition(targetPosition: Vector2D): void {
    if (this.isAnimating) {
      this.stopAnimation();
    }
    
    this.isAnimating = true;
    
    // Set up spring state
    let springState = {
      position: {
        x: this.transform.translateX,
        y: this.transform.translateY
      },
      velocity: this.transform.velocity,
      targetPosition: targetPosition,
      timestamp: Date.now()
    };
    
    // Animation loop
    const animate = () => {
      const now = Date.now();
      const dt = Math.min(now - springState.timestamp, 64) / 1000; // Cap at 64ms
      
      // Calculate displacement and direction
      const dx = springState.targetPosition.x - springState.position.x;
      const dy = springState.targetPosition.y - springState.position.y;
      const displacement = Math.sqrt(dx * dx + dy * dy);
      
      // Create spring physics calculator
      const springCalculator = createSpring({
        tension: this.config.tension || 180,
        friction: this.config.friction || 12,
        mass: this.config.mass || 1
      });
      
      // Set target and calculate new state
      springCalculator.setTarget(0, { 
        from: -displacement, 
        velocity: -springState.velocity.x 
      });
      const updatedState = springCalculator.update();
      
      // Update spring state
      springState = {
        ...springState,
        position: {
          x: springState.targetPosition.x + updatedState.position,
          y: springState.targetPosition.y + updatedState.position * (dy/dx || 0)
        },
        velocity: {
          x: updatedState.velocity,
          y: updatedState.velocity * (dy/dx || 0)
        }
      };
      
      // Update transform with new position
      this.transform.translateX = springState.position.x;
      this.transform.translateY = springState.position.y;
      this.transform.velocity = springState.velocity;
      
      // Apply transform
      this.applyTransform();
      
      // Check if close enough to target to stop
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const isSlowEnough = 
        Math.abs(springState.velocity.x) < 0.01 && 
        Math.abs(springState.velocity.y) < 0.01;
      
      // Continue animation if not close enough or still moving significantly
      if (distance > 0.1 || !isSlowEnough) {
        this.animationFrame = requestAnimationFrame(animate);
        springState.timestamp = now;
      } else {
        // Snap exactly to target position
        this.transform.translateX = targetPosition.x;
        this.transform.translateY = targetPosition.y;
        this.transform.velocity = { x: 0, y: 0 };
        this.applyTransform();
        this.isAnimating = false;
      }
    };
    
    // Start animation loop
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  /**
   * Apply boundaries to the transform values
   */
  private applyBoundaries(): void {
    const { boundaries } = this.config;
    if (!boundaries) return;
    
    // Apply x boundaries
    if (boundaries.x) {
      if (boundaries.x.min !== undefined && this.transform.translateX < boundaries.x.min) {
        this.transform.translateX = boundaries.x.min;
      }
      if (boundaries.x.max !== undefined && this.transform.translateX > boundaries.x.max) {
        this.transform.translateX = boundaries.x.max;
      }
    }
    
    // Apply y boundaries
    if (boundaries.y) {
      if (boundaries.y.min !== undefined && this.transform.translateY < boundaries.y.min) {
        this.transform.translateY = boundaries.y.min;
      }
      if (boundaries.y.max !== undefined && this.transform.translateY > boundaries.y.max) {
        this.transform.translateY = boundaries.y.max;
      }
    }
    
    // Apply scale boundaries
    if (boundaries.scale) {
      if (boundaries.scale.min !== undefined && this.transform.scale < boundaries.scale.min) {
        this.transform.scale = boundaries.scale.min;
      }
      if (boundaries.scale.max !== undefined && this.transform.scale > boundaries.scale.max) {
        this.transform.scale = boundaries.scale.max;
      }
    }
    
    // Apply rotation boundaries
    if (boundaries.rotation) {
      if (boundaries.rotation.min !== undefined && this.transform.rotation < boundaries.rotation.min) {
        this.transform.rotation = boundaries.rotation.min;
      }
      if (boundaries.rotation.max !== undefined && this.transform.rotation > boundaries.rotation.max) {
        this.transform.rotation = boundaries.rotation.max;
      }
    }
  }
  
  /**
   * Apply the current transform to the element
   */
  private applyTransform(): void {
    const { translateX, translateY, scale, rotation } = this.transform;
    
    // Construct transform string
    const transform = `
      translate(${translateX}px, ${translateY}px)
      scale(${scale})
      rotate(${rotation}deg)
    `;
    
    // Apply to element
    this.config.element.style.transform = transform;
    
    // Call the onTransformChange callback if provided
    this.config.onTransformChange?.(this.transform);
  }
  
  /**
   * Stop any ongoing animation
   */
  private stopAnimation(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.isAnimating = false;
  }
  
  /**
   * Reset transform to initial values
   */
  public reset(animate = true): void {
    if (animate) {
      this.animateToPosition({
        x: this.initialTransform.translateX,
        y: this.initialTransform.translateY
      });
      
      // Animate scale and rotation separately
      this.animateProperty('scale', this.initialTransform.scale);
      this.animateProperty('rotation', this.initialTransform.rotation);
    } else {
      this.transform = { ...this.initialTransform };
      this.applyTransform();
    }
  }
  
  /**
   * Animate a single property to a target value
   */
  private animateProperty(property: 'scale' | 'rotation', targetValue: number): void {
    const startValue = this.transform[property];
    const startTime = Date.now();
    let lastTime = startTime;
    
    // Skip if already at target
    if (Math.abs(startValue - targetValue) < 0.001) {
      return;
    }
    
    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      
      // Calculate new value using spring physics
      const tension = this.config.tension || 180;
      const friction = this.config.friction || 12;
      const mass = this.config.mass || 1;
      
      // Current velocity (approximated)
      let velocity = (this.transform[property] - startValue) / ((now - startTime) / 1000);
      
      // Spring force
      const displacement = targetValue - this.transform[property];
      const springForce = tension * displacement;
      
      // Damping force
      const dampingForce = -friction * velocity;
      
      // Acceleration
      const acceleration = (springForce + dampingForce) / mass;
      
      // Update velocity
      velocity += acceleration * dt;
      
      // Update position
      this.transform[property] += velocity * dt;
      
      // Apply transform
      this.applyTransform();
      
      // Check if close enough to target to stop
      if (
        Math.abs(targetValue - this.transform[property]) > 0.001 ||
        Math.abs(velocity) > 0.01
      ) {
        requestAnimationFrame(animate);
      } else {
        // Snap exactly to target
        this.transform[property] = targetValue;
        this.applyTransform();
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }
  
  /**
   * Set a new transform immediately (without animation)
   */
  public setTransform(transform: Partial<GestureTransform>): void {
    this.transform = { ...this.transform, ...transform };
    this.applyTransform();
  }
  
  /**
   * Animate to a new transform
   */
  public animateTo(transform: Partial<GestureTransform>): void {
    // Handle position if provided
    if (transform.translateX !== undefined || transform.translateY !== undefined) {
      this.animateToPosition({
        x: transform.translateX !== undefined ? transform.translateX : this.transform.translateX,
        y: transform.translateY !== undefined ? transform.translateY : this.transform.translateY
      });
    }
    
    // Handle scale if provided
    if (transform.scale !== undefined) {
      this.animateProperty('scale', transform.scale);
    }
    
    // Handle rotation if provided
    if (transform.rotation !== undefined) {
      this.animateProperty('rotation', transform.rotation);
    }
  }
  
  /**
   * Clean up when no longer needed
   */
  public destroy(): void {
    this.stopAnimation();
    this.detector.destroy();
  }
  
  /**
   * Get current transform values
   */
  public getTransform(): GestureTransform {
    return { ...this.transform };
  }
}

/**
 * Factory function to create a gesture animation
 */
export function createGestureAnimation(config: GestureAnimationConfig): GestureAnimation {
  return new GestureAnimation(config);
}