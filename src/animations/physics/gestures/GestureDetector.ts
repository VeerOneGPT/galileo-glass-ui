import { ThresholdOptions, Vector2D } from '../types';

/**
 * Defines the types of gestures that can be detected
 */
export enum GestureType {
  TAP = 'tap',
  DOUBLE_TAP = 'doubleTap',
  LONG_PRESS = 'longPress',
  PAN = 'pan',
  SWIPE = 'swipe',
  PINCH = 'pinch',
  ROTATE = 'rotate',
  HOVER = 'hover'
}

/**
 * Direction of a gesture (for pan, swipe)
 */
export enum GestureDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  UP_LEFT = 'upLeft',
  UP_RIGHT = 'upRight',
  DOWN_LEFT = 'downLeft',
  DOWN_RIGHT = 'downRight',
  NONE = 'none'
}

/**
 * State of a gesture
 */
export enum GestureState {
  BEGAN = 'began',
  CHANGED = 'changed',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
  RECOGNIZED = 'recognized'
}

/**
 * Gesture event data passed to callbacks
 */
export interface GestureEventData {
  type: GestureType;
  state: GestureState;
  direction?: GestureDirection;
  position: Vector2D;
  initialPosition: Vector2D;
  movement: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  distance: number;
  duration: number;
  scale?: number;
  rotation?: number;
  target: EventTarget | null;
  event: MouseEvent | TouchEvent | PointerEvent;
  timestamp: number;
  isKeyboardGenerated?: boolean;
}

/**
 * Options for gesture detection
 */
export interface GestureOptions {
  tapThreshold?: number;
  doubleTapTimeThreshold?: number;
  longPressTimeThreshold?: number;
  swipeVelocityThreshold?: number;
  swipeDistanceThreshold?: number;
  panThreshold?: number;
  rotationThreshold?: number;
  pinchScaleThreshold?: number;
  preventDefaultEvents?: boolean;
  preventEventPropagation?: boolean;
  enableMouseEvents?: boolean;
  enableTouchEvents?: boolean;
  enablePointerEvents?: boolean;
  directionalThresholds?: ThresholdOptions;
}

/**
 * Gesture handler function type
 */
export type GestureHandler = (data: GestureEventData) => void;

/**
 * Event tracking for multi-touch processing
 */
interface TrackedTouch {
  identifier: number;
  startPosition: Vector2D;
  startTime: number;
  lastPosition: Vector2D;
  lastTime: number;
  velocity: Vector2D;
  distance: number;
}

interface TouchTracker {
  [identifier: number]: TrackedTouch;
}

/**
 * Default gesture detection options
 */
const DEFAULT_GESTURE_OPTIONS: GestureOptions = {
  tapThreshold: 10,
  doubleTapTimeThreshold: 300,
  longPressTimeThreshold: 500,
  swipeVelocityThreshold: 0.5,
  swipeDistanceThreshold: 50,
  panThreshold: 5,
  rotationThreshold: 15,
  pinchScaleThreshold: 0.1,
  preventDefaultEvents: true,
  preventEventPropagation: false,
  enableMouseEvents: true,
  enableTouchEvents: true,
  enablePointerEvents: false,
  directionalThresholds: {
    horizontal: 30,
    vertical: 30,
    diagonal: 45
  }
};

/**
 * Gesture detector class for handling gesture recognition
 */
export class GestureDetector {
  private element: HTMLElement;
  private options: GestureOptions;
  private handlers: { [type in GestureType]?: GestureHandler[] };
  
  private isActive = false;
  private touchTracker: TouchTracker = {};
  private initialTouchDistance = 0;
  private initialTouchAngle = 0;
  private lastTapTime = 0;
  private longPressTimer: number | null = null;
  private pointers: PointerEvent[] = [];
  
  // Added state for single interaction start
  private interactionStartPosition: Vector2D | null = null;
  private interactionStartTime: number | null = null;
  private multiTouchActive = false; // Flag for active multi-touch

  constructor(element: HTMLElement, options: GestureOptions = {}) {
    this.element = element;
    this.options = { ...DEFAULT_GESTURE_OPTIONS, ...options };
    this.handlers = {};
    
    this.attachEventListeners();
  }
  
  /**
   * Attach event listeners based on options
   */
  private attachEventListeners(): void {
    if (this.options.enableMouseEvents) {
      this.element.addEventListener('mousedown', this.handleMouseDown);
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
      this.element.addEventListener('mouseover', this.handleMouseOver);
      this.element.addEventListener('mouseout', this.handleMouseOut);
    }
    
    if (this.options.enableTouchEvents) {
      this.element.addEventListener('touchstart', this.handleTouchStart);
      document.addEventListener('touchmove', this.handleTouchMove);
      document.addEventListener('touchend', this.handleTouchEnd);
      document.addEventListener('touchcancel', this.handleTouchCancel);
    }
    
    if (this.options.enablePointerEvents) {
      this.element.addEventListener('pointerdown', this.handlePointerDown);
      document.addEventListener('pointermove', this.handlePointerMove);
      document.addEventListener('pointerup', this.handlePointerUp);
      document.addEventListener('pointercancel', this.handlePointerCancel);
      this.element.addEventListener('pointerover', this.handlePointerOver);
      this.element.addEventListener('pointerout', this.handlePointerOut);
    }
  }
  
  /**
   * Detach all event listeners
   */
  public destroy(): void {
    if (this.options.enableMouseEvents) {
      this.element.removeEventListener('mousedown', this.handleMouseDown);
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      this.element.removeEventListener('mouseover', this.handleMouseOver);
      this.element.removeEventListener('mouseout', this.handleMouseOut);
    }
    
    if (this.options.enableTouchEvents) {
      this.element.removeEventListener('touchstart', this.handleTouchStart);
      document.removeEventListener('touchmove', this.handleTouchMove);
      document.removeEventListener('touchend', this.handleTouchEnd);
      document.removeEventListener('touchcancel', this.handleTouchCancel);
    }
    
    if (this.options.enablePointerEvents) {
      this.element.removeEventListener('pointerdown', this.handlePointerDown);
      document.removeEventListener('pointermove', this.handlePointerMove);
      document.removeEventListener('pointerup', this.handlePointerUp);
      document.removeEventListener('pointercancel', this.handlePointerCancel);
      this.element.removeEventListener('pointerover', this.handlePointerOver);
      this.element.removeEventListener('pointerout', this.handlePointerOut);
    }
    
    this.clearLongPressTimer();
  }
  
  /**
   * Add a gesture handler for a specific gesture type
   */
  public on(type: GestureType, handler: GestureHandler): void {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    
    this.handlers[type]?.push(handler);
  }
  
  /**
   * Remove a gesture handler
   */
  public off(type: GestureType, handler?: GestureHandler): void {
    if (!handler) {
      delete this.handlers[type];
      return;
    }
    
    const handlers = this.handlers[type];
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
      
      if (handlers.length === 0) {
        delete this.handlers[type];
      }
    }
  }
  
  /**
   * Trigger handlers for a gesture event
   */
  private triggerGestureEvent(data: GestureEventData): void {
    const handlers = this.handlers[data.type];
    
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
  
  /**
   * Clear long press timer if active
   */
  private clearLongPressTimer(): void {
    if (this.longPressTimer !== null) {
      window.clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
  
  /**
   * Calculate gesture direction based on movement
   */
  private getDirection(movement: Vector2D): GestureDirection {
    const { x, y } = movement;
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    // Use optional chaining for safety
    const horizontalThreshold = this.options.directionalThresholds?.horizontal ?? 5;
    const verticalThreshold = this.options.directionalThresholds?.vertical ?? 5;
    
    // No significant movement
    // Use the thresholds retrieved with optional chaining
    if (absX < horizontalThreshold && absY < verticalThreshold) {
      return GestureDirection.NONE;
    }
    
    // Check if movement is primarily horizontal or vertical
    if (absX > absY * 2) {
      return x > 0 ? GestureDirection.RIGHT : GestureDirection.LEFT;
    } else if (absY > absX * 2) {
      return y > 0 ? GestureDirection.DOWN : GestureDirection.UP;
    }
    
    // Diagonal movement
    if (x > 0 && y > 0) {
      return GestureDirection.DOWN_RIGHT;
    } else if (x > 0 && y < 0) {
      return GestureDirection.UP_RIGHT;
    } else if (x < 0 && y > 0) {
      return GestureDirection.DOWN_LEFT;
    } else {
      return GestureDirection.UP_LEFT;
    }
  }
  
  /**
   * Convert touch or mouse event to position vector
   */
  private getEventPosition(event: MouseEvent | TouchEvent | PointerEvent): Vector2D {
    if ('touches' in event) {
      // Prioritize active touches, then changed touches
      const touch = event.touches?.[0] ?? event.changedTouches?.[0];
      if (touch) {
        return { x: touch.clientX, y: touch.clientY };
      }
      // Fallback if no touches found (should be rare)
      return { x: 0, y: 0 }; 
    } 
    // For MouseEvent and PointerEvent
    return { x: event.clientX, y: event.clientY };
  }
  
  /**
   * Calculate distance between two positions
   */
  private getDistance(posA: Vector2D, posB: Vector2D): number {
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Calculate angle between two positions (in degrees)
   */
  private getAngle(posA: Vector2D, posB: Vector2D): number {
    return Math.atan2(posB.y - posA.y, posB.x - posA.x) * 180 / Math.PI;
  }
  
  /**
   * Calculate velocity based on movement and time
   */
  private calculateVelocity(movement: Vector2D, duration: number): Vector2D {
    if (duration === 0) return { x: 0, y: 0 };
    const seconds = duration / 1000;
    return {
      x: movement.x / seconds,
      y: movement.y / seconds
    };
  }
  
  /**
   * Create gesture event data
   */
  private createGestureData(
    type: GestureType,
    state: GestureState,
    event: MouseEvent | TouchEvent | PointerEvent,
    initialPosition: Vector2D,
    currentPosition: Vector2D,
    startTime: number,
    additionalData: Partial<GestureEventData> = {}
  ): GestureEventData {
    const currentTime = Date.now();
    const duration = currentTime - startTime;
    const movement = {
      x: currentPosition.x - initialPosition.x,
      y: currentPosition.y - initialPosition.y
    };
    const distance = this.getDistance(initialPosition, currentPosition);
    const velocity = this.calculateVelocity(movement, duration);
    
    // Calculate acceleration safely
    const durationSeconds = duration / 1000;
    const acceleration = durationSeconds > 0 
      ? { x: velocity.x / durationSeconds, y: velocity.y / durationSeconds }
      : { x: 0, y: 0 };
    
    const direction = this.getDirection(movement);
    
    return {
      type,
      state,
      direction,
      position: currentPosition,
      initialPosition,
      movement,
      velocity,
      acceleration,
      distance,
      duration,
      target: event?.target ?? null, // Add null check for target
      event,
      timestamp: currentTime,
      ...additionalData
    };
  }
  
  /**
   * Mouse event handlers
   */
  private handleMouseDown = (event: MouseEvent): void => {
    if (event.button !== 0) return; // Only handle left clicks
    
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    if (this.options.preventEventPropagation) {
      event.stopPropagation();
    }
    
    const position = this.getEventPosition(event);
    this.isActive = true;
    this.interactionStartPosition = position; // Store start position
    this.interactionStartTime = Date.now(); // Store start time
    this.multiTouchActive = false; // Reset multi-touch flag
    
    // Check for double tap
    const timeSinceLastTap = this.interactionStartTime - this.lastTapTime;
    if (timeSinceLastTap < (this.options.doubleTapTimeThreshold ?? 300)) {
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.DOUBLE_TAP,
          GestureState.RECOGNIZED,
          event,
          position,
          position,
          this.interactionStartTime
        )
      );
      this.lastTapTime = 0; // Reset
      this.interactionStartTime = null; // Consumed by double tap
    } else {
      // Start long press timer
      this.clearLongPressTimer();
      const longPressDelay = this.options.longPressTimeThreshold ?? 500;
      this.longPressTimer = window.setTimeout(() => {
        if (this.isActive && !this.multiTouchActive && this.interactionStartPosition) {
           const currentPos = this.interactionStartPosition; // Use start pos for check
           const movedDist = this.getDistance(this.interactionStartPosition, currentPos);
          // Trigger long press only if not moved significantly
          if (movedDist <= (this.options.tapThreshold ?? 10)) {
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.LONG_PRESS,
                GestureState.RECOGNIZED,
                event,
                this.interactionStartPosition,
                currentPos, // Use current position at time of trigger
                this.interactionStartTime ?? Date.now() // Use stored start time
              )
            );
            this.interactionStartTime = null; // Consumed by long press
          } else {
          }
        } else {
        }
        this.longPressTimer = null;
      }, longPressDelay);
      
      // Record potential tap time
      this.lastTapTime = this.interactionStartTime;
    }
    
    // Initialize pan gesture (use stored start position/time)
    if (this.interactionStartPosition && this.interactionStartTime) {
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.PAN,
          GestureState.BEGAN,
          event,
          this.interactionStartPosition,
          this.interactionStartPosition, // Start and current are same initially
          this.interactionStartTime
        )
      );
    }
  };
  
  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isActive || !this.interactionStartPosition || !this.interactionStartTime) return;
    
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const currentPosition = this.getEventPosition(event);
    
    // Update pan gesture using stored start position/time
    this.triggerGestureEvent(
      this.createGestureData(
        GestureType.PAN,
        GestureState.CHANGED,
        event,
        this.interactionStartPosition,
        currentPosition,
        this.interactionStartTime
      )
    );
    
    // Check distance moved to cancel tap/long press
    const distance = this.getDistance(this.interactionStartPosition, currentPosition);
    if (distance > (this.options.tapThreshold ?? 10)) {
      this.clearLongPressTimer();
      // Only reset lastTapTime if it was potentially going to be a tap
      if (this.interactionStartTime === this.lastTapTime) {
         this.lastTapTime = 0;
      }
      // Mark interaction as definitely not a tap/longpress originating from this start time
      // but keep interactionStartTime for PAN/SWIPE end calculations
    }
  };
  
  private handleMouseUp = (event: MouseEvent): void => {
    if (!this.isActive || !this.interactionStartPosition || !this.interactionStartTime) return;
    
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const currentPosition = this.getEventPosition(event);
    const startTime = this.interactionStartTime; // Use stored start time
    
    // Create final PAN data
    const panData = this.createGestureData(
      GestureType.PAN,
      GestureState.ENDED,
      event,
      this.interactionStartPosition,
      currentPosition,
      startTime
    );
    this.triggerGestureEvent(panData);
    
    // Check for tap (using stored start time)
    if (this.lastTapTime === startTime && panData.distance <= (this.options.tapThreshold ?? 10)) {
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.TAP,
          GestureState.RECOGNIZED,
          event,
          this.interactionStartPosition,
          currentPosition,
          startTime
        )
      );
      // Prevent double tap detection immediately after a tap
      // Keep lastTapTime as startTime so next mousedown can check against it
    } else {
       // If it wasn't a tap, ensure lastTapTime is cleared
       this.lastTapTime = 0; 
    }
    
    // Check for swipe
    if (
      panData.distance >= (this.options.swipeDistanceThreshold ?? 50) &&
      (Math.abs(panData.velocity.x) >= (this.options.swipeVelocityThreshold ?? 0.5) ||
        Math.abs(panData.velocity.y) >= (this.options.swipeVelocityThreshold ?? 0.5))
    ) {
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.SWIPE,
          GestureState.RECOGNIZED,
          event,
          this.interactionStartPosition,
          currentPosition,
          startTime,
          { direction: this.getDirection(panData.movement) } // Pass direction explicitly
        )
      );
    }
    
    // Reset state
    this.isActive = false;
    this.clearLongPressTimer();
    this.interactionStartPosition = null;
    this.interactionStartTime = null;
    // Don't reset lastTapTime here if it was just set by a tap
  };
  
  private handleMouseOver = (event: MouseEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const position = this.getEventPosition(event);
    
    this.triggerGestureEvent(
      this.createGestureData(
        GestureType.HOVER,
        GestureState.BEGAN,
        event,
        position,
        position,
        Date.now()
      )
    );
  };
  
  private handleMouseOut = (event: MouseEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const position = this.getEventPosition(event);
    
    this.triggerGestureEvent(
      this.createGestureData(
        GestureType.HOVER,
        GestureState.ENDED,
        event,
        position,
        position,
        Date.now()
      )
    );
  };
  
  /**
   * Touch event handlers
   */
  private handleTouchStart = (event: TouchEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const touches = event.changedTouches;
    const now = Date.now();
    this.multiTouchActive = Object.keys(this.touchTracker).length + touches.length > 1;

    // Track all new touches
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const position: Vector2D = {
        x: touch.clientX,
        y: touch.clientY
      };
      
      this.touchTracker[touch.identifier] = {
        identifier: touch.identifier,
        startPosition: position,
        startTime: now,
        lastPosition: position,
        lastTime: now,
        velocity: { x: 0, y: 0 },
        distance: 0
      };
    }
    
    // Get all active touches
    const activeTouches = Object.values(this.touchTracker);
    
    // Single touch gestures
    if (activeTouches.length === 1) {
      const touch = activeTouches[0];
      
      // Check for double tap
      const timeSinceLastTap = now - this.lastTapTime;
      // Use optional chaining for thresholds
      if (timeSinceLastTap < (this.options.doubleTapTimeThreshold ?? 300)) {
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.DOUBLE_TAP,
            GestureState.RECOGNIZED,
            event,
            touch.startPosition,
            touch.lastPosition,
            touch.startTime
          )
        );
        this.lastTapTime = 0; // Reset
      } else {
        // Start long press timer
        this.clearLongPressTimer();
        this.longPressTimer = window.setTimeout(() => {
          if (Object.keys(this.touchTracker).length > 0) {
            const currentTouch = Object.values(this.touchTracker)[0];
            if (currentTouch.distance <= (this.options.tapThreshold ?? 10)) {
              this.triggerGestureEvent(
                this.createGestureData(
                  GestureType.LONG_PRESS,
                  GestureState.RECOGNIZED,
                  event,
                  currentTouch.startPosition,
                  currentTouch.lastPosition,
                  currentTouch.startTime
                )
              );
            }
          }
          this.longPressTimer = null;
        }, this.options.longPressTimeThreshold ?? 500);
        
        this.lastTapTime = now;
      }
      
      // Store interaction start for single touch
      this.interactionStartTime = touch.startTime;
      this.interactionStartPosition = touch.startPosition;

      // Start pan gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.PAN,
          GestureState.BEGAN,
          event,
          touch.startPosition,
          touch.lastPosition,
          touch.startTime
        )
      );
    }
    
    // Multi-touch gestures - pinch and rotation
    else if (activeTouches.length >= 2) {
      // Cancel any pending single touch gestures
      this.clearLongPressTimer();
      this.lastTapTime = 0;
      this.interactionStartTime = null; // Clear single touch start time
      this.interactionStartPosition = null;
      this.multiTouchActive = true; // Set multi-touch flag
      
      // Get the first two touches for pinch/rotate calculations
      const touchA = activeTouches[0];
      const touchB = activeTouches[1];
      
      // Calculate initial distance and angle for pinch/rotate detection
      this.initialTouchDistance = this.getDistance(
        touchA.lastPosition,
        touchB.lastPosition
      );
      this.initialTouchAngle = this.getAngle(
        touchA.lastPosition,
        touchB.lastPosition
      );
      
      // Start pinch gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.PINCH,
          GestureState.BEGAN,
          event,
          touchA.startPosition, // Using first touch's position as reference
          touchA.lastPosition,
          touchA.startTime,
          { scale: 1 }
        )
      );
      
      // Start rotate gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.ROTATE,
          GestureState.BEGAN,
          event,
          touchA.startPosition, // Using first touch's position as reference
          touchA.lastPosition,
          touchA.startTime,
          { rotation: 0 }
        )
      );
    }
  };
  
  private handleTouchMove = (event: TouchEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const touches = event.changedTouches;
    const now = Date.now();
    
    // Update all tracked touches
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      if (this.touchTracker[touch.identifier]) {
        const tracker = this.touchTracker[touch.identifier];
        const newPosition: Vector2D = { x: touch.clientX, y: touch.clientY };
        
        // Calculate movement since last update
        const deltaX = newPosition.x - tracker.lastPosition.x;
        const deltaY = newPosition.y - tracker.lastPosition.y;
        
        // Calculate time since last update
        const deltaTime = now - tracker.lastTime;
        
        // Calculate instantaneous velocity (pixels per second)
        if (deltaTime > 0) {
          tracker.velocity = {
            x: deltaX / (deltaTime / 1000),
            y: deltaY / (deltaTime / 1000)
          };
        }
        
        // Update total distance from start
        tracker.distance = this.getDistance(tracker.startPosition, newPosition);
        
        // Update last position and time
        tracker.lastPosition = newPosition;
        tracker.lastTime = now;
        
        // If moved more than tap threshold, cancel potential tap/long press
        if (tracker.distance > (this.options.tapThreshold ?? 10)) {
          this.clearLongPressTimer();
          this.lastTapTime = 0;
        }
      }
    }
    
    // Get all active touches
    const activeTouches = Object.values(this.touchTracker);
    
    // Single touch gestures
    if (activeTouches.length === 1) {
      const touch = activeTouches[0];
      
      // Update pan gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.PAN,
          GestureState.CHANGED,
          event,
          touch.startPosition,
          touch.lastPosition,
          touch.startTime
        )
      );
    }
    
    // Multi-touch gestures - pinch and rotation
    else if (activeTouches.length >= 2) {
      // Get the first two touches for pinch/rotate calculations
      const touchA = activeTouches[0];
      const touchB = activeTouches[1];
      
      // Calculate current distance between touches for pinch
      const currentDistance = this.getDistance(
        touchA.lastPosition,
        touchB.lastPosition
      );
      const scale = currentDistance / this.initialTouchDistance;
      
      // Update pinch gesture if scale change exceeds threshold
      if (Math.abs(scale - 1) > this.options.pinchScaleThreshold) {
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.PINCH,
            GestureState.CHANGED,
            event,
            touchA.startPosition, // Using first touch as reference
            touchA.lastPosition,
            touchA.startTime,
            { scale }
          )
        );
      }
      
      // Calculate current angle between touches for rotation
      const currentAngle = this.getAngle(
        touchA.lastPosition,
        touchB.lastPosition
      );
      let rotation = currentAngle - this.initialTouchAngle;
      
      // Normalize rotation to -180 to 180 degrees
      if (rotation > 180) rotation -= 360;
      if (rotation < -180) rotation += 360;
      
      // Update rotate gesture if rotation exceeds threshold
      if (Math.abs(rotation) > this.options.rotationThreshold) {
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.ROTATE,
            GestureState.CHANGED,
            event,
            touchA.startPosition, // Using first touch as reference
            touchA.lastPosition,
            touchA.startTime,
            { rotation }
          )
        );
      }
    }
  };
  
  private handleTouchEnd = (event: TouchEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const touches = event.changedTouches;
    const now = Date.now();
    let wasMultiTouchActive = this.multiTouchActive; // Remember if we started in multi-touch mode
    let lastProcessedTrackerData: TrackedTouch | null = null; // To store data before deletion
    
    // Process ended touches
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const tracker = this.touchTracker[touch.identifier];
      
      if (tracker) {
        // Final update for the ending touch
        tracker.lastPosition = { x: touch.clientX, y: touch.clientY };
        tracker.lastTime = now;
        tracker.distance = this.getDistance(tracker.startPosition, tracker.lastPosition);
        tracker.velocity = this.calculateVelocity(
           { x: tracker.lastPosition.x - tracker.startPosition.x, y: tracker.lastPosition.y - tracker.startPosition.y },
           tracker.lastTime - tracker.startTime
        );

        // Store a copy of the tracker data *before* deleting it
        // This ensures we have reference data even if this is the last touch being removed
        lastProcessedTrackerData = { ...tracker }; 

        // Single touch end checks (Tap, Swipe, Pan End)
        // Check if ONLY this touch was active before deleting it
        if (Object.keys(this.touchTracker).length === 1 && !wasMultiTouchActive) { 
          const panData = this.createGestureData(
            GestureType.PAN,
            GestureState.ENDED,
            event,
            tracker.startPosition,
            tracker.lastPosition,
            tracker.startTime
          );
          this.triggerGestureEvent(panData);
          
          // Check for tap
          if (this.lastTapTime === tracker.startTime && tracker.distance <= (this.options.tapThreshold ?? 10)) {
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.TAP,
                GestureState.RECOGNIZED,
                event,
                tracker.startPosition,
                tracker.lastPosition,
                tracker.startTime
              )
            );
            // Keep lastTapTime for double tap check
          } else {
            // Ensure tap time is cleared if it wasn't a tap
            this.lastTapTime = 0;
          }
          
          // Check for swipe
          if (
            tracker.distance >= (this.options.swipeDistanceThreshold ?? 50) &&
            (Math.abs(tracker.velocity.x) >= (this.options.swipeVelocityThreshold ?? 0.5) ||
             Math.abs(tracker.velocity.y) >= (this.options.swipeVelocityThreshold ?? 0.5))
          ) {
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.SWIPE,
                GestureState.RECOGNIZED,
                event,
                tracker.startPosition,
                tracker.lastPosition,
                tracker.startTime,
                { direction: this.getDirection(panData.movement) } // Use direction from panData
              )
            );
          }
        }
        
        // Remove the touch from tracking AFTER potentially using its data and storing a copy
        delete this.touchTracker[touch.identifier];
      }
    }
    
    // Check if multi-touch sequence ended (went from >=2 touches to <2)
    const activeTouchesCount = Object.keys(this.touchTracker).length;
    if (wasMultiTouchActive && activeTouchesCount < 2) {
      this.multiTouchActive = false;

      // Trigger ENDED state for Pinch/Rotate using the data from the *last processed* ending touch
      if (lastProcessedTrackerData) { 
           this.triggerGestureEvent(
             this.createGestureData(
               GestureType.PINCH,
               GestureState.ENDED,
               event,
               lastProcessedTrackerData.startPosition, // Use stored data
               lastProcessedTrackerData.lastPosition,  // Use stored data
               lastProcessedTrackerData.startTime      // Use stored data
             )
           );
           this.triggerGestureEvent(
             this.createGestureData(
               GestureType.ROTATE,
               GestureState.ENDED,
               event,
               lastProcessedTrackerData.startPosition, // Use stored data
               lastProcessedTrackerData.lastPosition,  // Use stored data
               lastProcessedTrackerData.startTime      // Use stored data
             )
           );
      } else {
          // This case should ideally not happen if wasMultiTouchActive was true
          // and we processed at least one touch in changedTouches, but log just in case.
          console.warn("GestureDetector: Multi-touch ended but couldn't retrieve last tracker data.");
      }

      // Reset multi-touch specific state
      this.initialTouchDistance = 0;
      this.initialTouchAngle = 0;
    }
    
    // If no touches remain active after all processing, reset general interaction state
    if (activeTouchesCount === 0) {
      this.isActive = false;
      this.clearLongPressTimer();
      this.interactionStartPosition = null;
      this.interactionStartTime = null;
      // Don't reset lastTapTime here if a tap was just recognized
    }
  };
  
  private handleTouchCancel = (event: TouchEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    // Treat cancel like touch end but trigger CANCELLED state
    const activeTouches = Object.values(this.touchTracker);
    const refTouch = activeTouches[0];

    if (refTouch) {
        if (activeTouches.length >= 2) {
           this.triggerGestureEvent(this.createGestureData(GestureType.PINCH, GestureState.CANCELLED, event, refTouch.startPosition, refTouch.lastPosition, refTouch.startTime));
           this.triggerGestureEvent(this.createGestureData(GestureType.ROTATE, GestureState.CANCELLED, event, refTouch.startPosition, refTouch.lastPosition, refTouch.startTime));
        } else {
            this.triggerGestureEvent(this.createGestureData(GestureType.PAN, GestureState.CANCELLED, event, refTouch.startPosition, refTouch.lastPosition, refTouch.startTime));
        }
    }

    // Reset all state on cancel
    this.touchTracker = {};
    this.isActive = false;
    this.clearLongPressTimer();
    this.lastTapTime = 0;
    this.initialTouchDistance = 0;
    this.initialTouchAngle = 0;
    this.interactionStartPosition = null;
    this.interactionStartTime = null;
    this.multiTouchActive = false;
  };
  
  /**
   * Pointer event handlers (Basic Implementation)
   */
  private handlePointerDown = (event: PointerEvent): void => {
    if (!this.options.enablePointerEvents) return;
    if (this.options.preventDefaultEvents) event.preventDefault();
    if (this.options.preventEventPropagation) event.stopPropagation();

    this.pointers.push(event);
    this.element.setPointerCapture(event.pointerId);

    // Delegate to touch/mouse logic based on pointer count / type?
    // For simplicity, let's mostly mirror mouse down for the first pointer
    if (this.pointers.length === 1) {
        this.handleMouseDown(event as unknown as MouseEvent); // Cast for now
    }
     // Handle multi-touch start (similar to touch) - Requires more complex state management
     else if (this.pointers.length >= 2) {
        this.multiTouchActive = true;
        this.clearLongPressTimer();
        this.lastTapTime = 0;
        this.interactionStartTime = null; 
        this.interactionStartPosition = null;

        const pointerA = this.pointers[0];
        const pointerB = this.pointers[1];
        const posA = { x: pointerA.clientX, y: pointerA.clientY };
        const posB = { x: pointerB.clientX, y: pointerB.clientY };
        this.initialTouchDistance = this.getDistance(posA, posB);
        this.initialTouchAngle = this.getAngle(posA, posB);

        this.triggerGestureEvent(this.createGestureData(GestureType.PINCH, GestureState.BEGAN, event, posA, posA, Date.now(), { scale: 1 }));
        this.triggerGestureEvent(this.createGestureData(GestureType.ROTATE, GestureState.BEGAN, event, posA, posA, Date.now(), { rotation: 0 }));
     }
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.options.enablePointerEvents) return;
    if (this.options.preventDefaultEvents) event.preventDefault();

    const index = this.pointers.findIndex(p => p.pointerId === event.pointerId);
    if (index === -1) return; // Not tracking this pointer

    this.pointers[index] = event; // Update pointer state

    // Delegate based on pointer count
    if (this.pointers.length === 1) {
        this.handleMouseMove(event as unknown as MouseEvent);
    } 
    else if (this.pointers.length >= 2) {
        // Handle Pinch/Rotate update (similar to touch)
        const pointerA = this.pointers[0];
        const pointerB = this.pointers[1];
        const posA = { x: pointerA.clientX, y: pointerA.clientY };
        const posB = { x: pointerB.clientX, y: pointerB.clientY };

        const currentDistance = this.getDistance(posA, posB);
        const currentAngle = this.getAngle(posA, posB);
        const scale = this.initialTouchDistance === 0 ? 1 : currentDistance / this.initialTouchDistance;
        let rotation = currentAngle - this.initialTouchAngle;
        rotation = (rotation + 360) % 360;
        if (rotation > 180) rotation -= 360;

        this.triggerGestureEvent(this.createGestureData(GestureType.PINCH, GestureState.CHANGED, event, posA, posA, Date.now(), { scale }));
        this.triggerGestureEvent(this.createGestureData(GestureType.ROTATE, GestureState.CHANGED, event, posA, posA, Date.now(), { rotation }));
    }
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (!this.options.enablePointerEvents) return;
    if (this.options.preventDefaultEvents) event.preventDefault();

    const index = this.pointers.findIndex(p => p.pointerId === event.pointerId);
    if (index !== -1) {
      this.pointers.splice(index, 1); // Remove pointer
      try {
         this.element.releasePointerCapture(event.pointerId);
      } catch (e) { /* Ignore error if capture was already released */ }
    }

    // Delegate based on remaining pointers
    if (this.pointers.length === 0) {
        this.handleMouseUp(event as unknown as MouseEvent);
        this.multiTouchActive = false; // Ensure reset
    } 
    else if (this.pointers.length < 2 && this.multiTouchActive) {
        // Multi-touch ended, end pinch/rotate
        this.multiTouchActive = false;
        const refPointer = this.pointers[0];
        if(refPointer) {
          const pos = {x: refPointer.clientX, y: refPointer.clientY};
          this.triggerGestureEvent(this.createGestureData(GestureType.PINCH, GestureState.ENDED, event, pos, pos, Date.now()));
          this.triggerGestureEvent(this.createGestureData(GestureType.ROTATE, GestureState.ENDED, event, pos, pos, Date.now()));
        }
        this.initialTouchDistance = 0;
        this.initialTouchAngle = 0;

        // Transition back to single pointer pan? Needs careful state handling
        // For now, ending multi-touch also ends the single-touch pan derived from mouse logic
        this.isActive = false;
        this.interactionStartPosition = null;
        this.interactionStartTime = null;
    }
  };

  private handlePointerCancel = (event: PointerEvent): void => {
    if (!this.options.enablePointerEvents) return;
    if (this.options.preventDefaultEvents) event.preventDefault();

    const index = this.pointers.findIndex(p => p.pointerId === event.pointerId);
    if (index !== -1) {
      this.pointers.splice(index, 1); // Remove pointer
       try {
         this.element.releasePointerCapture(event.pointerId);
      } catch (e) { /* Ignore */ }
    }

    // Trigger CANCELLED for relevant gestures
    // Similar logic to touch cancel but using pointer data
    if(this.pointers.length === 0) {
        if(this.interactionStartPosition && this.interactionStartTime) {
             this.triggerGestureEvent(this.createGestureData(GestureType.PAN, GestureState.CANCELLED, event, this.interactionStartPosition, this.interactionStartPosition, this.interactionStartTime));
        }
    } else if (this.multiTouchActive) {
         const refPointer = this.pointers[0];
         if(refPointer) {
            const pos = {x: refPointer.clientX, y: refPointer.clientY};
            this.triggerGestureEvent(this.createGestureData(GestureType.PINCH, GestureState.CANCELLED, event, pos, pos, Date.now()));
            this.triggerGestureEvent(this.createGestureData(GestureType.ROTATE, GestureState.CANCELLED, event, pos, pos, Date.now()));
         }
    }
    

    // Reset all state on cancel
    this.pointers = [];
    this.isActive = false;
    this.clearLongPressTimer();
    this.lastTapTime = 0;
    this.initialTouchDistance = 0;
    this.initialTouchAngle = 0;
    this.interactionStartPosition = null;
    this.interactionStartTime = null;
    this.multiTouchActive = false;
  };

  private handlePointerOver = (event: PointerEvent): void => {
    if (!this.options.enablePointerEvents) return;
    if (this.options.preventDefaultEvents) event.preventDefault();
    // Mirror mouse over
    this.handleMouseOver(event as unknown as MouseEvent);
  };

  private handlePointerOut = (event: PointerEvent): void => {
    if (!this.options.enablePointerEvents) return;
    if (this.options.preventDefaultEvents) event.preventDefault();
    // Mirror mouse out
    this.handleMouseOut(event as unknown as MouseEvent);

     // Optionally handle pointer leaving the element boundary during an interaction
     // Could trigger CANCELLED or ENDED depending on desired behavior
     // For simplicity, current logic relies on pointerup/cancel on document
  };
}

/**
 * Create a gesture detector for an HTML element
 */
export function createGestureDetector(element: HTMLElement, options?: GestureOptions): GestureDetector {
  return new GestureDetector(element, options);
}

/**
 * Helper to get gesture name from type
 */
export function getGestureName(type: GestureType): string {
  const names: Record<GestureType, string> = {
    [GestureType.TAP]: 'Tap',
    [GestureType.DOUBLE_TAP]: 'Double Tap',
    [GestureType.LONG_PRESS]: 'Long Press',
    [GestureType.PAN]: 'Pan',
    [GestureType.SWIPE]: 'Swipe',
    [GestureType.PINCH]: 'Pinch',
    [GestureType.ROTATE]: 'Rotate',
    [GestureType.HOVER]: 'Hover'
  };
  
  return names[type] || 'Unknown';
}

/**
 * Helper to get readable state name
 */
export function getStateName(state: GestureState): string {
  const names: Record<GestureState, string> = {
    [GestureState.BEGAN]: 'Began',
    [GestureState.CHANGED]: 'Changed',
    [GestureState.ENDED]: 'Ended',
    [GestureState.CANCELLED]: 'Cancelled',
    [GestureState.RECOGNIZED]: 'Recognized'
  };
  
  return names[state] || 'Unknown';
}

/**
 * Helper to get readable direction name
 */
export function getDirectionName(direction: GestureDirection): string {
  const names: Record<GestureDirection, string> = {
    [GestureDirection.UP]: 'Up',
    [GestureDirection.DOWN]: 'Down',
    [GestureDirection.LEFT]: 'Left',
    [GestureDirection.RIGHT]: 'Right',
    [GestureDirection.UP_LEFT]: 'Up Left',
    [GestureDirection.UP_RIGHT]: 'Up Right',
    [GestureDirection.DOWN_LEFT]: 'Down Left',
    [GestureDirection.DOWN_RIGHT]: 'Down Right',
    [GestureDirection.NONE]: 'None'
  };
  
  return names[direction] || 'Unknown';
}