import { useRef, useState, useEffect, useCallback } from 'react';
import { 
  MomentumInteraction, 
  MomentumConfig, 
  MomentumInteractionType,
  MomentumDirection,
} from './momentum';

// Export the MomentumResult type
export interface MomentumResult {
  velocityX: number;
  velocityY: number;
  primaryDirection: string | null;
  distance: number;
  shouldAnimate: boolean;
}

export interface MomentumOptions extends Partial<MomentumConfig> {
  /**
   * Initial position
   */
  initialX?: number;
  initialY?: number;
  
  /**
   * Whether to automatically track mouse/touch events
   */
  autoBindEvents?: boolean;
  
  /**
   * Element to attach events to (if autoBind is true)
   * Default is window
   */
  targetElement?: HTMLElement | null;
  
  /**
   * Called when the momentum animation completes
   */
  onRest?: () => void;
}

// Renamed from UseMomentumResult to match export name
export interface MomentumHookResult {
  /**
   * Current X position
   */
  x: number;
  
  /**
   * Current Y position
   */
  y: number;
  
  /**
   * Whether momentum is currently active
   */
  isMoving: boolean;
  
  /**
   * Whether a gesture is currently in progress
   */
  isDragging: boolean;
  
  /**
   * Calculated momentum from last gesture
   */
  lastMomentum: MomentumResult | null;
  
  /**
   * Bind to an element's onMouseDown/onTouchStart
   */
  handleStart: (e: React.MouseEvent | React.TouchEvent) => void;
  
  /**
   * Bind to an element's onMouseMove/onTouchMove
   */
  handleMove: (e: React.MouseEvent | React.TouchEvent) => void;
  
  /**
   * Bind to an element's onMouseUp/onTouchEnd
   */
  handleEnd: () => void;
  
  /**
   * Manually start tracking at a specific point
   */
  start: (x: number, y: number) => void;
  
  /**
   * Manually update tracking to a specific point
   */
  update: (x: number, y: number) => void;
  
  /**
   * Manually end tracking and apply momentum
   */
  end: () => MomentumResult;
  
  /**
   * Immediately stop momentum
   */
  stop: () => void;
}

/**
 * Hook to use momentum-based interactions in components
 * 
 * @example
 * ```tsx
 * const { x, y, isMoving, handleStart, handleMove, handleEnd } = useMomentum({
 *   direction: MomentumDirection.HORIZONTAL,
 *   friction: 0.92,
 *   maxVelocity: 50
 * });
 * 
 * return (
 *   <div 
 *     onMouseDown={handleStart}
 *     onMouseMove={handleMove}
 *     onMouseUp={handleEnd}
 *     onMouseLeave={handleEnd}
 *     onTouchStart={handleStart}
 *     onTouchMove={handleMove}
 *     onTouchEnd={handleEnd}
 *     style={{ transform: `translate(${x}px, ${y}px)` }}
 *   >
 *     Drag me
 *   </div>
 * );
 * ```
 */
export function useMomentum(options: MomentumOptions = {}): MomentumHookResult {
  const {
    initialX = 0,
    initialY = 0,
    autoBindEvents = false,
    targetElement = null,
    onRest,
    ...momentumOptions
  } = options;
  
  // Create state
  const [x, setX] = useState<number>(initialX);
  const [y, setY] = useState<number>(initialY);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMomentum, setLastMomentum] = useState<MomentumResult | null>(null);
  
  // Refs
  const momentumRef = useRef<MomentumInteraction | null>(null);
  const rafRef = useRef<number | null>(null);
  const positionRef = useRef({ x: initialX, y: initialY });
  
  // Create momentum controller
  useEffect(() => {
    if (!momentumRef.current) {
      momentumRef.current = new MomentumInteraction({
        type: MomentumInteractionType.DRAG,
        direction: MomentumDirection.BOTH,
        ...momentumOptions
      });
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Update config when options change
  useEffect(() => {
    if (momentumRef.current) {
      momentumRef.current.updateConfig(momentumOptions);
    }
  }, [momentumOptions]);
  
  // Animation loop
  const animate = useCallback(() => {
    if (momentumRef.current) {
      const { x: newX, y: newY, moving } = momentumRef.current.update2D();
      
      positionRef.current = { x: newX, y: newY };
      setX(newX);
      setY(newY);
      
      if (moving) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsMoving(false);
        rafRef.current = null;
        onRest?.();
      }
    }
  }, [onRest]);
  
  // Manually start tracking
  const start = useCallback((startX: number, startY: number) => {
    if (momentumRef.current) {
      // Stop any ongoing momentum animation
      momentumRef.current.stop();
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      // Start new gesture tracking
      momentumRef.current.start(startX, startY);
      setIsDragging(true);
    }
  }, []);
  
  // Update tracking
  const update = useCallback((currentX: number, currentY: number) => {
    if (momentumRef.current && isDragging) {
      momentumRef.current.update(currentX, currentY);
      
      // Update position directly during dragging
      positionRef.current = { x: currentX, y: currentY };
      setX(currentX);
      setY(currentY);
    }
  }, [isDragging]);
  
  // End tracking and apply momentum
  const end = useCallback(() => {
    if (momentumRef.current && isDragging) {
      // End gesture and get momentum result
      const result = momentumRef.current.end();
      setLastMomentum(result);
      setIsDragging(false);
      
      // Apply momentum if above threshold
      if (result.shouldAnimate) {
        momentumRef.current.applyMomentum(
          result, 
          positionRef.current.x, 
          positionRef.current.y
        );
        
        setIsMoving(true);
        rafRef.current = requestAnimationFrame(animate);
      }
      
      return result;
    }
    
    return {
      velocityX: 0,
      velocityY: 0,
      primaryDirection: null,
      distance: 0,
      shouldAnimate: false
    };
  }, [isDragging, animate]);
  
  // Stop all momentum
  const stop = useCallback(() => {
    if (momentumRef.current) {
      momentumRef.current.stop();
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      setIsMoving(false);
      setIsDragging(false);
    }
  }, []);
  
  // Auto-bind events
  useEffect(() => {
    if (autoBindEvents) {
      const target = targetElement || window;
      
      // Create DOM event handlers that convert DOM events to the right type
      const domHandleStart = (e: MouseEvent | TouchEvent) => {
        let clientX: number, clientY: number;
        
        if ('touches' in e) {
          // Touch event
          if (e.touches.length !== 1) return;
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          // Mouse event
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        start(clientX, clientY);
      };
      
      const domHandleMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        
        let clientX: number, clientY: number;
        
        if ('touches' in e) {
          // Touch event
          if (e.touches.length !== 1) return;
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          // Mouse event
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        update(clientX, clientY);
      };
      
      const domHandleEnd = () => {
        end();
      };
      
      // Add event listeners
      target.addEventListener('mousedown', domHandleStart);
      target.addEventListener('mousemove', domHandleMove);
      target.addEventListener('mouseup', domHandleEnd);
      target.addEventListener('mouseleave', domHandleEnd);
      target.addEventListener('touchstart', domHandleStart);
      target.addEventListener('touchmove', domHandleMove);
      target.addEventListener('touchend', domHandleEnd);
      
      return () => {
        // Remove event listeners
        target.removeEventListener('mousedown', domHandleStart);
        target.removeEventListener('mousemove', domHandleMove);
        target.removeEventListener('mouseup', domHandleEnd);
        target.removeEventListener('mouseleave', domHandleEnd);
        target.removeEventListener('touchstart', domHandleStart);
        target.removeEventListener('touchmove', domHandleMove);
        target.removeEventListener('touchend', domHandleEnd);
      };
    }
  }, [autoBindEvents, targetElement, isDragging, start, update, end]);
  
  // Event handlers for React components
  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      if (e.touches.length !== 1) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    start(clientX, clientY);
  }, [start]);
  
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      if (e.touches.length !== 1) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    update(clientX, clientY);
  }, [isDragging, update]);
  
  const handleEnd = useCallback(() => {
    end();
  }, [end]);
  
  return {
    x,
    y,
    isMoving,
    isDragging,
    lastMomentum,
    handleStart,
    handleMove,
    handleEnd,
    start,
    update,
    end,
    stop
  };
} 