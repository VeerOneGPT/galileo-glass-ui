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
    const thresholds = this.options.directionalThresholds!;
    
    // No significant movement
    if (absX < thresholds.horizontal! && absY < thresholds.vertical!) {
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
      if (event.touches.length > 0) {
        return {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      } else if (event.changedTouches && event.changedTouches.length > 0) {
        return {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY
        };
      }
      
      // Fallback
      return { x: 0, y: 0 };
    }
    
    return {
      x: event.clientX,
      y: event.clientY
    };
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
    
    // Simple acceleration calculation (derivative of velocity)
    const acceleration = {
      x: velocity.x / (duration / 1000),
      y: velocity.y / (duration / 1000)
    };
    
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
      target: event.target,
      event,
      timestamp: currentTime,
      ...additionalData
    };
  }
  
  /**
   * Mouse event handlers
   */
  private handleMouseDown = (event: MouseEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    if (this.options.preventEventPropagation) {
      event.stopPropagation();
    }
    
    const position = this.getEventPosition(event);
    this.isActive = true;
    
    const startTime = Date.now();
    
    // Check for double tap
    const timeSinceLastTap = startTime - this.lastTapTime;
    if (timeSinceLastTap < this.options.doubleTapTimeThreshold!) {
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.DOUBLE_TAP,
          GestureState.RECOGNIZED,
          event,
          position,
          position,
          startTime
        )
      );
      this.lastTapTime = 0; // Reset to prevent triple tap being detected as double
    } else {
      // Start long press timer
      this.clearLongPressTimer();
      this.longPressTimer = window.setTimeout(() => {
        if (this.isActive) {
          this.triggerGestureEvent(
            this.createGestureData(
              GestureType.LONG_PRESS,
              GestureState.RECOGNIZED,
              event,
              position,
              position,
              startTime
            )
          );
        }
        this.longPressTimer = null;
      }, this.options.longPressTimeThreshold!);
      
      // Maybe this will be a tap, record the time
      this.lastTapTime = startTime;
    }
    
    // Initialize pan gesture
    this.triggerGestureEvent(
      this.createGestureData(
        GestureType.PAN,
        GestureState.BEGAN,
        event,
        position,
        position,
        startTime
      )
    );
  };
  
  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isActive) return;
    
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const currentPosition = this.getEventPosition(event);
    const initialPosition = this.getEventPosition(event); // For mouse we don't store initial, so use current as proxy
    const startTime = Date.now() - 10; // Slight offset for velocity calculation
    
    // Update pan gesture
    this.triggerGestureEvent(
      this.createGestureData(
        GestureType.PAN,
        GestureState.CHANGED,
        event,
        initialPosition,
        currentPosition,
        startTime
      )
    );
    
    // If moved more than tap threshold, cancel potential tap/long press
    const distance = this.getDistance(initialPosition, currentPosition);
    if (distance > this.options.tapThreshold!) {
      this.clearLongPressTimer();
      this.lastTapTime = 0;
    }
  };
  
  private handleMouseUp = (event: MouseEvent): void => {
    if (!this.isActive) return;
    
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const currentPosition = this.getEventPosition(event);
    const initialPosition = this.getEventPosition(event); // For mouse we approximate
    const startTime = this.lastTapTime; // Use tap time as start reference
    
    // End pan gesture
    const panData = this.createGestureData(
      GestureType.PAN,
      GestureState.ENDED,
      event,
      initialPosition,
      currentPosition,
      startTime
    );
    this.triggerGestureEvent(panData);
    
    // Check for tap
    const distance = panData.distance;
    if (distance <= this.options.tapThreshold! && this.lastTapTime > 0) {
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.TAP,
          GestureState.RECOGNIZED,
          event,
          initialPosition,
          currentPosition,
          startTime
        )
      );
    }
    
    // Check for swipe
    if (
      distance >= this.options.swipeDistanceThreshold! &&
      (Math.abs(panData.velocity.x) >= this.options.swipeVelocityThreshold! ||
        Math.abs(panData.velocity.y) >= this.options.swipeVelocityThreshold!)
    ) {
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.SWIPE,
          GestureState.RECOGNIZED,
          event,
          initialPosition,
          currentPosition,
          startTime
        )
      );
    }
    
    // Reset state
    this.isActive = false;
    this.clearLongPressTimer();
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
      if (timeSinceLastTap < this.options.doubleTapTimeThreshold!) {
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
            if (currentTouch.distance <= this.options.tapThreshold!) {
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
        }, this.options.longPressTimeThreshold!);
        
        this.lastTapTime = now;
      }
      
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
        if (tracker.distance > this.options.tapThreshold!) {
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
      if (Math.abs(scale - 1) > this.options.pinchScaleThreshold!) {
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
      if (Math.abs(rotation) > this.options.rotationThreshold!) {
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
    
    // Process ended touches
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const identifier = touch.identifier;
      
      if (this.touchTracker[identifier]) {
        const tracker = this.touchTracker[identifier];
        const newPosition: Vector2D = { x: touch.clientX, y: touch.clientY };
        
        // Get the number of active touches before removing this one
        const activeTouchCount = Object.keys(this.touchTracker).length;
        
        // Process single-touch gestures
        if (activeTouchCount === 1) {
          // End pan gesture
          const panData = this.createGestureData(
            GestureType.PAN,
            GestureState.ENDED,
            event,
            tracker.startPosition,
            newPosition,
            tracker.startTime
          );
          this.triggerGestureEvent(panData);
          
          // Check for tap
          if (tracker.distance <= this.options.tapThreshold! && this.lastTapTime > 0) {
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.TAP,
                GestureState.RECOGNIZED,
                event,
                tracker.startPosition,
                newPosition,
                tracker.startTime
              )
            );
          }
          
          // Check for swipe
          const duration = now - tracker.startTime;
          const velocity = this.calculateVelocity(
            {
              x: newPosition.x - tracker.startPosition.x,
              y: newPosition.y - tracker.startPosition.y
            },
            duration
          );
          
          if (
            tracker.distance >= this.options.swipeDistanceThreshold! &&
            (Math.abs(velocity.x) >= this.options.swipeVelocityThreshold! ||
              Math.abs(velocity.y) >= this.options.swipeVelocityThreshold!)
          ) {
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.SWIPE,
                GestureState.RECOGNIZED,
                event,
                tracker.startPosition,
                newPosition,
                tracker.startTime,
                { velocity }
              )
            );
          }
        }
        // Process multi-touch gestures
        else if (activeTouchCount >= 2) {
          // Get another active touch to use as reference
          const otherTouch = Object.values(this.touchTracker).find(
            t => t.identifier !== identifier
          );
          
          if (otherTouch) {
            // End pinch gesture
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.PINCH,
                GestureState.ENDED,
                event,
                otherTouch.startPosition, // Using other touch as reference
                otherTouch.lastPosition,
                otherTouch.startTime,
                { scale: this.getDistance(newPosition, otherTouch.lastPosition) / this.initialTouchDistance }
              )
            );
            
            // End rotate gesture
            const finalAngle = this.getAngle(newPosition, otherTouch.lastPosition);
            let rotation = finalAngle - this.initialTouchAngle;
            
            // Normalize rotation to -180 to 180 degrees
            if (rotation > 180) rotation -= 360;
            if (rotation < -180) rotation += 360;
            
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.ROTATE,
                GestureState.ENDED,
                event,
                otherTouch.startPosition, // Using other touch as reference
                otherTouch.lastPosition,
                otherTouch.startTime,
                { rotation }
              )
            );
          }
        }
        
        // Remove the touch from tracking
        delete this.touchTracker[identifier];
      }
    }
    
    // If all touches have ended, reset
    if (Object.keys(this.touchTracker).length === 0) {
      this.clearLongPressTimer();
    }
  };
  
  private handleTouchCancel = (event: TouchEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const touches = event.changedTouches;
    
    // Process cancelled touches
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const identifier = touch.identifier;
      
      if (this.touchTracker[identifier]) {
        const tracker = this.touchTracker[identifier];
        const newPosition: Vector2D = { x: touch.clientX, y: touch.clientY };
        
        // Get the number of active touches before removing this one
        const activeTouchCount = Object.keys(this.touchTracker).length;
        
        // Cancel single-touch gestures
        if (activeTouchCount === 1) {
          // Cancel pan gesture
          this.triggerGestureEvent(
            this.createGestureData(
              GestureType.PAN,
              GestureState.CANCELLED,
              event,
              tracker.startPosition,
              newPosition,
              tracker.startTime
            )
          );
        }
        // Cancel multi-touch gestures
        else if (activeTouchCount >= 2) {
          // Get another active touch to use as reference
          const otherTouch = Object.values(this.touchTracker).find(
            t => t.identifier !== identifier
          );
          
          if (otherTouch) {
            // Cancel pinch gesture
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.PINCH,
                GestureState.CANCELLED,
                event,
                otherTouch.startPosition, // Using other touch as reference
                otherTouch.lastPosition,
                otherTouch.startTime,
                { scale: 1 }
              )
            );
            
            // Cancel rotate gesture
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.ROTATE,
                GestureState.CANCELLED,
                event,
                otherTouch.startPosition, // Using other touch as reference
                otherTouch.lastPosition,
                otherTouch.startTime,
                { rotation: 0 }
              )
            );
          }
        }
        
        // Remove the touch from tracking
        delete this.touchTracker[identifier];
      }
    }
    
    // If all touches have been cancelled, reset
    if (Object.keys(this.touchTracker).length === 0) {
      this.clearLongPressTimer();
      this.lastTapTime = 0;
    }
  };
  
  /**
   * Pointer event handlers
   */
  private handlePointerDown = (event: PointerEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    // Track pointer for multi-pointer gestures
    this.pointers = [...this.pointers.filter(p => p.pointerId !== event.pointerId), event];
    
    const position = this.getEventPosition(event);
    const now = Date.now();
    
    // Single pointer gestures
    if (this.pointers.length === 1) {
      // Check for double tap
      const timeSinceLastTap = now - this.lastTapTime;
      if (timeSinceLastTap < this.options.doubleTapTimeThreshold!) {
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.DOUBLE_TAP,
            GestureState.RECOGNIZED,
            event,
            position,
            position,
            now
          )
        );
        this.lastTapTime = 0; // Reset
      } else {
        // Start long press timer
        this.clearLongPressTimer();
        this.longPressTimer = window.setTimeout(() => {
          if (this.pointers.length === 1) {
            this.triggerGestureEvent(
              this.createGestureData(
                GestureType.LONG_PRESS,
                GestureState.RECOGNIZED,
                event,
                position,
                position,
                now
              )
            );
          }
          this.longPressTimer = null;
        }, this.options.longPressTimeThreshold!);
        
        this.lastTapTime = now;
      }
      
      // Start pan gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.PAN,
          GestureState.BEGAN,
          event,
          position,
          position,
          now
        )
      );
    }
    // Multi-pointer gestures
    else if (this.pointers.length >= 2) {
      // Cancel any pending single pointer gestures
      this.clearLongPressTimer();
      this.lastTapTime = 0;
      
      // Get the first two pointers for pinch/rotate
      const pointerA = this.pointers[0];
      const pointerB = this.pointers[1];
      
      const posA = { x: pointerA.clientX, y: pointerA.clientY };
      const posB = { x: pointerB.clientX, y: pointerB.clientY };
      
      // Calculate initial distance and angle for pinch/rotate
      this.initialTouchDistance = this.getDistance(posA, posB);
      this.initialTouchAngle = this.getAngle(posA, posB);
      
      // Start pinch gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.PINCH,
          GestureState.BEGAN,
          event,
          position, // Using event position as reference
          position,
          now,
          { scale: 1 }
        )
      );
      
      // Start rotate gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.ROTATE,
          GestureState.BEGAN,
          event,
          position, // Using event position as reference
          position,
          now,
          { rotation: 0 }
        )
      );
    }
  };
  
  private handlePointerMove = (event: PointerEvent): void => {
    // Update pointer data
    this.pointers = this.pointers.map(p => 
      p.pointerId === event.pointerId ? event : p
    );
    
    if (this.pointers.length === 0) return;
    
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const position = this.getEventPosition(event);
    const initialPos = this.getEventPosition(this.pointers[0]); // Get initial position from first pointer
    const now = Date.now();
    
    // Single pointer gestures
    if (this.pointers.length === 1) {
      // Update pan gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.PAN,
          GestureState.CHANGED,
          event,
          initialPos,
          position,
          this.lastTapTime || now - 10
        )
      );
      
      // Check if movement exceeds tap threshold
      const distance = this.getDistance(initialPos, position);
      if (distance > this.options.tapThreshold!) {
        this.clearLongPressTimer();
        this.lastTapTime = 0;
      }
    }
    // Multi-pointer gestures
    else if (this.pointers.length >= 2) {
      // Get the first two pointers for pinch/rotate
      const pointerA = this.pointers[0];
      const pointerB = this.pointers[1];
      
      const posA = { x: pointerA.clientX, y: pointerA.clientY };
      const posB = { x: pointerB.clientX, y: pointerB.clientY };
      
      // Calculate current distance between pointers for pinch
      const currentDistance = this.getDistance(posA, posB);
      const scale = currentDistance / this.initialTouchDistance;
      
      // Update pinch gesture if scale change exceeds threshold
      if (Math.abs(scale - 1) > this.options.pinchScaleThreshold!) {
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.PINCH,
            GestureState.CHANGED,
            event,
            initialPos, // Using first pointer's position as reference
            position,
            now,
            { scale }
          )
        );
      }
      
      // Calculate current angle between pointers for rotation
      const currentAngle = this.getAngle(posA, posB);
      let rotation = currentAngle - this.initialTouchAngle;
      
      // Normalize rotation to -180 to 180 degrees
      if (rotation > 180) rotation -= 360;
      if (rotation < -180) rotation += 360;
      
      // Update rotate gesture if rotation exceeds threshold
      if (Math.abs(rotation) > this.options.rotationThreshold!) {
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.ROTATE,
            GestureState.CHANGED,
            event,
            initialPos, // Using first pointer's position as reference
            position,
            now,
            { rotation }
          )
        );
      }
    }
  };
  
  private handlePointerUp = (event: PointerEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const position = this.getEventPosition(event);
    const initialPointer = this.pointers.find(p => p.pointerId === event.pointerId);
    
    if (!initialPointer) return;
    
    const initialPos = { x: initialPointer.clientX, y: initialPointer.clientY };
    const startTime = this.lastTapTime || Date.now() - 100; // Approximate if no tap time
    
    // Process based on pointer count before removal
    const pointerCount = this.pointers.length;
    
    // Single pointer gestures
    if (pointerCount === 1) {
      // End pan gesture
      const panData = this.createGestureData(
        GestureType.PAN,
        GestureState.ENDED,
        event,
        initialPos,
        position,
        startTime
      );
      this.triggerGestureEvent(panData);
      
      // Check for tap
      const distance = this.getDistance(initialPos, position);
      if (distance <= this.options.tapThreshold! && this.lastTapTime > 0) {
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.TAP,
            GestureState.RECOGNIZED,
            event,
            initialPos,
            position,
            startTime
          )
        );
      }
      
      // Check for swipe
      if (
        distance >= this.options.swipeDistanceThreshold! &&
        (Math.abs(panData.velocity.x) >= this.options.swipeVelocityThreshold! ||
          Math.abs(panData.velocity.y) >= this.options.swipeVelocityThreshold!)
      ) {
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.SWIPE,
            GestureState.RECOGNIZED,
            event,
            initialPos,
            position,
            startTime
          )
        );
      }
    }
    // Multi-pointer gestures
    else if (pointerCount >= 2) {
      // Find another active pointer to use as reference
      const otherPointer = this.pointers.find(p => p.pointerId !== event.pointerId);
      
      if (otherPointer) {
        const otherPos = { x: otherPointer.clientX, y: otherPointer.clientY };
        
        // End pinch gesture
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.PINCH,
            GestureState.ENDED,
            event,
            initialPos,
            position,
            startTime,
            { scale: this.getDistance(position, otherPos) / this.initialTouchDistance }
          )
        );
        
        // End rotate gesture
        const finalAngle = this.getAngle(position, otherPos);
        let rotation = finalAngle - this.initialTouchAngle;
        
        // Normalize rotation to -180 to 180 degrees
        if (rotation > 180) rotation -= 360;
        if (rotation < -180) rotation += 360;
        
        this.triggerGestureEvent(
          this.createGestureData(
            GestureType.ROTATE,
            GestureState.ENDED,
            event,
            initialPos,
            position,
            startTime,
            { rotation }
          )
        );
      }
    }
    
    // Remove the pointer from tracking
    this.pointers = this.pointers.filter(p => p.pointerId !== event.pointerId);
    
    // If all pointers have been removed, reset
    if (this.pointers.length === 0) {
      this.clearLongPressTimer();
    }
  };
  
  private handlePointerCancel = (event: PointerEvent): void => {
    if (this.options.preventDefaultEvents) {
      event.preventDefault();
    }
    
    const position = this.getEventPosition(event);
    const initialPointer = this.pointers.find(p => p.pointerId === event.pointerId);
    
    if (!initialPointer) return;
    
    const initialPos = { x: initialPointer.clientX, y: initialPointer.clientY };
    const now = Date.now();
    
    // Process based on pointer count before removal
    const pointerCount = this.pointers.length;
    
    // Single pointer gestures
    if (pointerCount === 1) {
      // Cancel pan gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.PAN,
          GestureState.CANCELLED,
          event,
          initialPos,
          position,
          now
        )
      );
    }
    // Multi-pointer gestures
    else if (pointerCount >= 2) {
      // Cancel pinch gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.PINCH,
          GestureState.CANCELLED,
          event,
          initialPos,
          position,
          now,
          { scale: 1 }
        )
      );
      
      // Cancel rotate gesture
      this.triggerGestureEvent(
        this.createGestureData(
          GestureType.ROTATE,
          GestureState.CANCELLED,
          event,
          initialPos,
          position,
          now,
          { rotation: 0 }
        )
      );
    }
    
    // Remove the pointer from tracking
    this.pointers = this.pointers.filter(p => p.pointerId !== event.pointerId);
    
    // If all pointers have been cancelled, reset
    if (this.pointers.length === 0) {
      this.clearLongPressTimer();
      this.lastTapTime = 0;
    }
  };
  
  private handlePointerOver = (event: PointerEvent): void => {
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
  
  private handlePointerOut = (event: PointerEvent): void => {
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