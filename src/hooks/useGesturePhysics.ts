import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useGesture, UserGestureConfig, DragConfig, PinchConfig } from '@use-gesture/react';
import { useGalileoStateSpring, GalileoSpringResult } from './useGalileoStateSpring';
import type { 
    GesturePhysicsOptions, 
    GestureTransform, 
    GestureEventData, // Keep for potential future manual implementation
    GestureType,
    PanGestureConfig,
    PinchGestureConfig,
    RotateGestureConfig,
    TapGestureConfig,
    BaseGestureConfig // Import BaseGestureConfig
} from '../types/gestures';
import { useReducedMotion } from './useReducedMotion';
import { useAnimationContext } from '../contexts/AnimationContext';
import { SpringConfig, SpringPresets } from '../animations/physics/springPhysics';

// Export the options type so it can be imported elsewhere
export type { GesturePhysicsOptions };

// Default options
const DEFAULT_GESTURE_OPTIONS = {
    inertia: true,
    inertiaDecay: 0.97, // Slightly faster decay than 0.99
    bounce: 0.3,
    preventDefault: true,
    disabled: false,
};

const MIN_INERTIA_VELOCITY = 0.01; // Threshold to stop inertia

// Helper to safely merge gesture configs - return undefined if false
const mergeGestureConfig = <T extends BaseGestureConfig>(propConfig: boolean | T | undefined, defaults: Partial<T> = {}): T | undefined => {
    if (propConfig === false) return undefined;
    if (propConfig === true || propConfig === undefined) return { enabled: true, ...defaults } as T;
    return { enabled: true, ...defaults, ...propConfig };
}

export const useGesturePhysics = (
    options: GesturePhysicsOptions
): {
    style: React.CSSProperties;
    transform: GestureTransform;
    isGestureActive: boolean;
    setTransform: (newTransform: Partial<GestureTransform>) => void;
    animateTo: (targetTransform: Partial<GestureTransform>, options?: { duration?: number }) => void; // Duration might be complex with physics
    reset: (animate?: boolean) => void;
} => {
    const { 
        elementRef,
        pan: panProp, 
        pinch: pinchProp,
        rotate: rotateProp,
        tap: tapProp,
        longPress: longPressProp,
        doubleTap: doubleTapProp,
        animationConfig,
        inertia = DEFAULT_GESTURE_OPTIONS.inertia,
        inertiaDecay = DEFAULT_GESTURE_OPTIONS.inertiaDecay,
        bounds,
        bounce = DEFAULT_GESTURE_OPTIONS.bounce,
        preventDefault = DEFAULT_GESTURE_OPTIONS.preventDefault,
        disabled = DEFAULT_GESTURE_OPTIONS.disabled,
        onGestureStart,
        onGestureChange,
        onGestureEnd,
        onTransformChange,
    } = options;

    const prefersReducedMotion = useReducedMotion();
    const { defaultSpring } = useAnimationContext();
    const isDisabled = disabled || prefersReducedMotion;

    const [isGestureActive, setIsGestureActive] = useState(false);
    const [currentTransform, setCurrentTransform] = useState<GestureTransform>({ x: 0, y: 0, scale: 1, rotation: 0 });
    
    const isAnimatingInertia = useRef(false);
    const animationFrameRef = useRef<number | null>(null);
    const velocityRef = useRef({ vx: 0, vy: 0, vs: 0, vr: 0 }); // Track velocity for inertia
    const boundsRef = useRef(bounds); // Store bounds
    useEffect(() => { boundsRef.current = bounds; }, [bounds]); // Update if bounds change

    // --- Long Press Timer --- 
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [isLongPressActive, setIsLongPressActive] = useState(false);
    const longPressDelay = useMemo(() => 
        (typeof longPressProp === 'object' && typeof longPressProp.threshold === 'number') ? longPressProp.threshold : 500
    , [longPressProp]);

    // --- Setup Springs --- 
    const springHookOptions = useMemo(() => ({
        immediate: isDisabled,
        animationConfig: animationConfig,
    }), [isDisabled, animationConfig]);

    const { value: springX, start: startX, stop: stopX, reset: resetX } = useGalileoStateSpring(0, springHookOptions);
    const { value: springY, start: startY, stop: stopY, reset: resetY } = useGalileoStateSpring(0, springHookOptions);
    // Use separate spring for scale/rotation as they have different units/defaults
    const { value: springScale, start: startScale, stop: stopScale, reset: resetScale } = useGalileoStateSpring(1, { ...springHookOptions, tension: 200, friction: 20 }); // Slightly different defaults maybe
    const { value: springRotate, start: startRotate, stop: stopRotate, reset: resetRotate } = useGalileoStateSpring(0, { ...springHookOptions, tension: 200, friction: 20 });

    // Update internal state when springs change
    useEffect(() => {
        const newTransform = { x: springX, y: springY, scale: springScale, rotation: springRotate };
        setCurrentTransform(newTransform);
        if (onTransformChange) {
            onTransformChange(newTransform);
        }
    }, [springX, springY, springScale, springRotate, onTransformChange]);

    // --- Inertia Animation Loop --- 
    const runInertiaLoop = useCallback(() => {
        if (!isAnimatingInertia.current || isDisabled) {
            animationFrameRef.current = null;
            return;
        }

        const { vx, vy, vs, vr } = velocityRef.current;
        // Use state values as spring refs aren't directly accessible
        const tempCurrentX = currentTransform.x;
        const tempCurrentY = currentTransform.y;
        const tempCurrentScale = currentTransform.scale;
        const tempCurrentRotation = currentTransform.rotation;

        let nextX = tempCurrentX + vx * 16; 
        let nextY = tempCurrentY + vy * 16;
        let nextScale = tempCurrentScale + vs * 16;
        let nextRotation = tempCurrentRotation + vr * 16;

        // Decay
        velocityRef.current.vx *= inertiaDecay ?? DEFAULT_GESTURE_OPTIONS.inertiaDecay;
        velocityRef.current.vy *= inertiaDecay ?? DEFAULT_GESTURE_OPTIONS.inertiaDecay;
        velocityRef.current.vs *= inertiaDecay ?? DEFAULT_GESTURE_OPTIONS.inertiaDecay;
        velocityRef.current.vr *= inertiaDecay ?? DEFAULT_GESTURE_OPTIONS.inertiaDecay;

        // TODO: Bounds checking and bounce for inertia

        // Update spring targets
        startX({ to: nextX }); // Removed velocity - let spring handle it
        startY({ to: nextY });
        startScale({ to: nextScale });
        startRotate({ to: nextRotation });
        
        // Check stop condition
        const speed = Math.sqrt(velocityRef.current.vx**2 + velocityRef.current.vy**2 + velocityRef.current.vs**2 + velocityRef.current.vr**2);
        if (speed < MIN_INERTIA_VELOCITY) {
            isAnimatingInertia.current = false;
            // setIsGestureActive(false); // Don't set this here, gesture ended before inertia
            animationFrameRef.current = null;
        } else {
            animationFrameRef.current = requestAnimationFrame(runInertiaLoop);
        }

    }, [isDisabled, inertiaDecay, startX, startY, startScale, startRotate, currentTransform]);

    // Stop inertia animation
    const stopInertia = useCallback(() => {
        isAnimatingInertia.current = false;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        stopX(); stopY(); stopScale(); stopRotate();
    }, [stopX, stopY, stopScale, stopRotate]);


    // --- Gesture Handling using @use-gesture/react --- 
    const gestureConfig = useMemo(() => {
        const config: UserGestureConfig = {
            target: elementRef,
            eventOptions: { passive: !preventDefault },
            // Use global window for tracking events outside the element during drag
            window: window 
        };

        const panConfig = mergeGestureConfig(panProp);
        if (panConfig) config.drag = panConfig as DragConfig;

        const pinchConfig = mergeGestureConfig(pinchProp);
        if (pinchConfig) config.pinch = pinchConfig as PinchConfig;

        // Map Rotate options to Wheel Config - Remove specific type assertion
        const wheelConfig = mergeGestureConfig(rotateProp); // Use rotateProp for wheel
        if (wheelConfig) {
             // Assign properties directly if needed, or assume onWheel handler covers it
             config.wheel = wheelConfig; // Assigning the object, assuming compatible structure
        }

        // Tap/DoubleTap/LongPress are handled via pointer/click events, not direct config flags in v10

        return config;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elementRef, panProp, pinchProp, rotateProp, preventDefault]);

    // Click counter for double tap
    const lastClickTimeRef = useRef(0);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Define handlers separately for clarity
    const handlers = useMemo(() => ({
        // --- Drag Handlers (Pan) --- 
        onDragStart: (state: any) => {
            if (isDisabled || !gestureConfig.drag) return;
            stopInertia(); 
            setIsGestureActive(true);
            if (onGestureStart) onGestureStart('pan', state);
        },
        onDrag: (state: any) => {
             if (isDisabled || !gestureConfig.drag) return;
            const [ox, oy] = state.offset;
            startX({ to: ox }); 
            startY({ to: oy });
            if (onGestureChange) onGestureChange('pan', state, { ...currentTransform, x: ox, y: oy });
        },
        onDragEnd: (state: any) => {
            if (isDisabled || !gestureConfig.drag) return;
            setIsGestureActive(false); 
            if (inertia && state.velocity) { 
                // Use adjusted velocity calculation from before
                 const [vxRaw, vyRaw] = state.velocity;
                 // Experiment with scaling: Higher sensitivity might need smaller multiplier?
                 const velocityScale = 16; // Or maybe adjust based on sensitivity? 10?
                 const vx = vxRaw * velocityScale; 
                 const vy = vyRaw * velocityScale;

                if (Math.sqrt(vx**2 + vy**2) > MIN_INERTIA_VELOCITY) {
                     velocityRef.current = { vx, vy, vs: 0, vr: 0 };
                     isAnimatingInertia.current = true;
                     if (!animationFrameRef.current) {
                         animationFrameRef.current = requestAnimationFrame(runInertiaLoop);
                     }
                }
            }
             if (onGestureEnd) onGestureEnd('pan', state); // Callback with original state
        },
        // --- Pinch Handlers --- 
        onPinchStart: (state: any) => {
             if (isDisabled || !gestureConfig.pinch) return;
            stopInertia();
            setIsGestureActive(true);
            if (onGestureStart) onGestureStart('pinch', state);
        },
        onPinch: (state: any) => {
             if (isDisabled || !gestureConfig.pinch) return;
            const [distance, angle] = state.offset; // Pinch offset is [distance, angle]
            startScale({ to: distance }); 
            // Optional: Apply rotation from pinch if rotateProp is not explicitly false
            if (rotateProp !== false) { 
                startRotate({ to: angle }); 
            }
            if (onGestureChange) onGestureChange('pinch', state, { ...currentTransform, scale: distance, rotation: rotateProp !== false ? angle : currentTransform.rotation });
        },
        onPinchEnd: (state: any) => {
             if (isDisabled || !gestureConfig.pinch) return;
            setIsGestureActive(false);
             if (onGestureEnd) onGestureEnd('pinch', state);
        },
        // --- Wheel Handler (Rotate/Zoom) --- 
         onWheel: (state: any) => { 
             // Check if wheel handling is configured (using rotateProp as the flag)
             if (isDisabled || !rotateProp) return;
             // Wheel delta is typically in state.delta [dx, dy]
             // Use deltaY for rotation or scale adjustment
             const [, dy] = state.delta;
             // Example: Adjust rotation based on wheel scroll
             const newRotation = currentTransform.rotation + dy * 0.5; // Adjust multiplier as needed
             startRotate({ to: newRotation });
             // Or adjust scale: const newScale = currentTransform.scale + dy * -0.01;
             // startScale({ to: newScale });

             if (onGestureStart) onGestureStart('rotate', state); // Report as 'rotate' type
             if (onGestureChange) onGestureChange('rotate', state, { ...currentTransform, rotation: newRotation });
             if (onGestureEnd) onGestureEnd('rotate', state); // Wheel events are discrete
         },
        // --- Pointer Down/Up for Tap/LongPress --- 
        onPointerDown: (state: any) => {
            if (isDisabled) return;
            // Long press logic
            if (longPressProp) {
                longPressTimerRef.current = setTimeout(() => {
                    if (state.down) { // Check if pointer is still down
                        setIsLongPressActive(true);
                        const mockData: GestureEventData = { /* ... simplified mock ... */ event: state.event, xy:[0,0], initial:[0,0], delta:[0,0], offset:[0,0], movement:[0,0], velocity:[0,0], direction:[0,0], distance:0, angle:0, active:true, first:true };
                        if (onGestureStart) onGestureStart('longPress', mockData); 
                        // Maybe call onGestureChange if needed during long press? 
                    }
                    longPressTimerRef.current = null;
                }, longPressDelay);
            }
        },
        onPointerUp: (state: any) => {
            if (isDisabled) return;
            // Clear long press timer
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
            if (isLongPressActive) {
                 const mockData: GestureEventData = { /* ... simplified mock ... */ event: state.event, xy:[0,0], initial:[0,0], delta:[0,0], offset:[0,0], movement:[0,0], velocity:[0,0], direction:[0,0], distance:0, angle:0, active:false, last:true };
                if (onGestureEnd) onGestureEnd('longPress', mockData); 
                setIsLongPressActive(false);
                return; // Don't process as tap if it was a long press
            }

            // Tap / Double Tap Logic
            if (tapProp || doubleTapProp) {
                const now = Date.now();
                const doubleTapThreshold = 300; // ms

                if (doubleTapProp && (now - lastClickTimeRef.current < doubleTapThreshold)) {
                    // Double tap detected
                    if(clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
                    clickTimeoutRef.current = null;
                    lastClickTimeRef.current = 0; // Reset timer
                    if (onGestureStart) onGestureStart('doubleTap', state);
                    if (onGestureEnd) onGestureEnd('doubleTap', state); // Double tap is discrete
                } else {
                    // Potential single tap
                    lastClickTimeRef.current = now;
                    clickTimeoutRef.current = setTimeout(() => {
                        // Single tap confirmed
                        if (tapProp) {
                            if (onGestureStart) onGestureStart('tap', state);
                            if (onGestureEnd) onGestureEnd('tap', state); // Tap is discrete
                        }
                         clickTimeoutRef.current = null;
                    }, doubleTapThreshold);
                }
            }
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [isDisabled, inertia, onGestureStart, onGestureChange, onGestureEnd, startX, startY, startScale, startRotate, stopInertia, runInertiaLoop, currentTransform, gestureConfig, longPressProp, longPressDelay, tapProp, doubleTapProp, rotateProp]);

    // Attach handlers using useGesture
    useGesture(handlers, gestureConfig);

    // --- Control Functions --- 
    const setTransform = useCallback((newTransform: Partial<GestureTransform>) => {
        if (isDisabled) return;
        stopInertia();
        // Remove immediate: true
        if(newTransform.x !== undefined) startX({ to: newTransform.x }); 
        if(newTransform.y !== undefined) startY({ to: newTransform.y });
        if(newTransform.scale !== undefined) startScale({ to: newTransform.scale });
        if(newTransform.rotation !== undefined) startRotate({ to: newTransform.rotation });
    }, [isDisabled, startX, startY, startScale, startRotate, stopInertia]);

    const animateTo = useCallback((targetTransform: Partial<GestureTransform>, animOptions?: { duration?: number }) => {
         if (isDisabled) return;
         stopInertia();
         if(targetTransform.x !== undefined) startX({ to: targetTransform.x });
         if(targetTransform.y !== undefined) startY({ to: targetTransform.y });
         if(targetTransform.scale !== undefined) startScale({ to: targetTransform.scale });
         if(targetTransform.rotation !== undefined) startRotate({ to: targetTransform.rotation });
    }, [isDisabled, startX, startY, startScale, startRotate, stopInertia]);

    const reset = useCallback((animate = false) => {
        stopInertia();
        if (animate && !isDisabled) {
            animateTo({ x: 0, y: 0, scale: 1, rotation: 0 });
        } else {
            resetX(0); resetY(0); resetScale(1); resetRotate(0);
            // State will update via spring useEffect
        }
    }, [stopInertia, animateTo, isDisabled, resetX, resetY, resetScale, resetRotate]);

    // --- Style Generation --- 
    const style = useMemo((): React.CSSProperties => {
        if (isDisabled) return {};
        const { x, y, scale, rotation } = currentTransform;
        return {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotateZ(${rotation}deg)`,
            touchAction: panProp ? ( (typeof panProp === 'object' && panProp.axis === 'x') ? 'pan-y' : (typeof panProp === 'object' && panProp.axis === 'y') ? 'pan-x' : 'none' ) : 'auto',
            userSelect: isGestureActive ? 'none' : 'auto',
            willChange: 'transform',
        };
    }, [currentTransform, isDisabled, isGestureActive, panProp]);

    return {
        style,
        transform: currentTransform,
        isGestureActive,
        setTransform,
        animateTo,
        reset,
    };
}; 