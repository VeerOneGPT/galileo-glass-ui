import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { 
    InertialMovementOptions as InertialMovementOptionsType, 
    InertialMovementState as InertialMovementStateType, 
    InertialMovementResult as InertialMovementResultType 
} from '../types/hooks';
import type { Vector2D } from '../types/particles'; // Reusing Vector2D
import { useReducedMotion } from './useReducedMotion';
import { triggerHapticFeedback } from '../utils/haptics'; // Import haptic utility

// Re-export the types
export type InertialMovementOptions = InertialMovementOptionsType;
export type InertialMovementState = InertialMovementStateType;
export type InertialMovementResult = InertialMovementResultType;

const DEFAULT_OPTIONS: Required<Omit<InertialMovementOptions, 'containerRef' | 'bounds' | 'contentRef'>> = {
    friction: 0.05,
    bounceFactor: 0.3,
    velocityThreshold: 0.1,
    velocityFactor: 1,
    maxVelocity: 3000,
    disabled: false,
    axis: 'both',
};

const MIN_VELOCITY = 0.01; // Velocity below which movement stops

export const useInertialMovement = (
    options: InertialMovementOptions
): InertialMovementResult => {
    const { 
        contentRef, 
        containerRef, 
        friction = DEFAULT_OPTIONS.friction, 
        bounceFactor = DEFAULT_OPTIONS.bounceFactor,
        bounds: explicitBounds,
        velocityThreshold = DEFAULT_OPTIONS.velocityThreshold,
        velocityFactor = DEFAULT_OPTIONS.velocityFactor,
        maxVelocity = DEFAULT_OPTIONS.maxVelocity,
        disabled = DEFAULT_OPTIONS.disabled,
        axis = DEFAULT_OPTIONS.axis,
    } = options;

    const [state, setState] = useState<InertialMovementState>({
        isDragging: false,
        isMoving: false,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
    });

    const prefersReducedMotion = useReducedMotion();
    const isDisabled = disabled || prefersReducedMotion;

    const positionRef = useRef<Vector2D>({ x: 0, y: 0 });
    const velocityRef = useRef<Vector2D>({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const isMovingRef = useRef(false);
    const pointerStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
    const lastPointerMoveRef = useRef<{ x: number, y: number, time: number } | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const boundsRef = useRef<{ top: number, bottom: number, left: number, right: number }>({ top: 0, bottom: 0, left: 0, right: 0 });

    // Update derived bounds when refs or explicit bounds change
    useEffect(() => {
        const container = containerRef?.current;
        const content = contentRef.current;
        if (!content) return; // Content ref is required

        let top = explicitBounds?.top ?? 0;
        let bottom = explicitBounds?.bottom ?? 0;
        let left = explicitBounds?.left ?? 0;
        let right = explicitBounds?.right ?? 0;

        if (container) {
            // Calculate bounds based on container/content size difference
            const containerRect = container.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();
            // Negative bounds represent how much the content can move *up* or *left*
            top = explicitBounds?.top ?? Math.min(0, containerRect.height - contentRect.height);
            bottom = explicitBounds?.bottom ?? 0; // Usually 0 for bottom bound
            left = explicitBounds?.left ?? Math.min(0, containerRect.width - contentRect.width);
            right = explicitBounds?.right ?? 0; // Usually 0 for right bound
        }
        boundsRef.current = { top, bottom, left, right };

    }, [containerRef, contentRef, explicitBounds]);

    // Animation loop for inertial movement
    const runInertia = useCallback(() => {
        if (!isMovingRef.current || isDisabled) return;

        const now = performance.now();
        // Simple fixed time step for stability in this basic version
        const dt = 1 / 60; 
        const pos = { ...positionRef.current };
        const vel = { ...velocityRef.current };
        const bounds = boundsRef.current;
        const effectiveBounce = 1 - bounceFactor; // Energy retained

        // Apply friction
        vel.x *= (1 - friction);
        vel.y *= (1 - friction);

        // Update position
        if (axis === 'both' || axis === 'x') pos.x += vel.x * dt * 100; // Scale velocity for perceptible speed
        if (axis === 'both' || axis === 'y') pos.y += vel.y * dt * 100;

        let bounced = false;
        // Check bounds and apply bounce
        if (axis === 'both' || axis === 'x') {
            if (pos.x < bounds.left) { 
                pos.x = bounds.left; 
                vel.x *= -effectiveBounce; 
                bounced = true; 
                triggerHapticFeedback('light'); // Haptic on bounce
            }
            if (pos.x > bounds.right) { 
                pos.x = bounds.right; 
                vel.x *= -effectiveBounce; 
                bounced = true; 
                triggerHapticFeedback('light'); // Haptic on bounce
            }
        }
         if (axis === 'both' || axis === 'y') {
            if (pos.y < bounds.top) { 
                pos.y = bounds.top; 
                vel.y *= -effectiveBounce; 
                bounced = true; 
                triggerHapticFeedback('light'); // Haptic on bounce
            }
            if (pos.y > bounds.bottom) { 
                pos.y = bounds.bottom; 
                vel.y *= -effectiveBounce; 
                bounced = true; 
                triggerHapticFeedback('light'); // Haptic on bounce
            }
        }

        positionRef.current = pos;
        velocityRef.current = vel;

        // Update state for rendering
        setState(prev => ({ ...prev, position: pos, velocity: vel, isMoving: true }));

        // Stop condition
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        if (speed < MIN_VELOCITY && !bounced) {
            isMovingRef.current = false;
            setState(prev => ({ ...prev, isMoving: false }));
            animationFrameRef.current = null;
        } else {
            animationFrameRef.current = requestAnimationFrame(runInertia);
        }
    }, [friction, bounceFactor, axis, isDisabled]);

    // Pointer event handlers
    useEffect(() => {
        const contentElement = contentRef.current;
        if (!contentElement || isDisabled) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!contentElement.contains(event.target as Node)) return; // Only trigger on content
            
            isDraggingRef.current = true;
            isMovingRef.current = false; // Stop inertia on new drag
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
            
            pointerStartRef.current = { x: event.clientX, y: event.clientY, time: performance.now() };
            lastPointerMoveRef.current = { ...pointerStartRef.current };
            velocityRef.current = { x: 0, y: 0 }; // Reset velocity

            setState(prev => ({ ...prev, isDragging: true, isMoving: false, velocity: {x:0, y:0} }));
            contentElement.style.cursor = 'grabbing';
            contentElement.setPointerCapture(event.pointerId);
            triggerHapticFeedback('selection'); // Haptic on grab
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (!isDraggingRef.current || !pointerStartRef.current || !lastPointerMoveRef.current) return;

            const now = performance.now();
            const currentX = event.clientX;
            const currentY = event.clientY;

            const deltaX = currentX - lastPointerMoveRef.current.x;
            const deltaY = currentY - lastPointerMoveRef.current.y;
            const timeDelta = (now - lastPointerMoveRef.current.time) / 1000; // seconds

            // Update position based on drag delta
            const newPosX = positionRef.current.x + (axis === 'both' || axis === 'x' ? deltaX : 0);
            const newPosY = positionRef.current.y + (axis === 'both' || axis === 'y' ? deltaY : 0);
            
            // Clamp position within bounds during drag
            const clampedX = Math.max(boundsRef.current.left, Math.min(boundsRef.current.right, newPosX));
            const clampedY = Math.max(boundsRef.current.top, Math.min(boundsRef.current.bottom, newPosY));

            positionRef.current = { x: clampedX, y: clampedY };

            // Calculate velocity (units per second)
            if (timeDelta > 0) {
                velocityRef.current = {
                    x: deltaX / timeDelta,
                    y: deltaY / timeDelta,
                };
            }

            lastPointerMoveRef.current = { x: currentX, y: currentY, time: now };
            setState(prev => ({ ...prev, position: positionRef.current, velocity: velocityRef.current }));
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (!isDraggingRef.current || !pointerStartRef.current) return;

            isDraggingRef.current = false;
            contentElement.style.cursor = 'grab';
            contentElement.releasePointerCapture(event.pointerId);

            // Calculate final velocity
            const finalVel = { ...velocityRef.current };
            const speed = Math.sqrt(finalVel.x * finalVel.x + finalVel.y * finalVel.y);

            if (speed > velocityThreshold) {
                // Apply factor and clamp velocity
                let vX = finalVel.x * velocityFactor;
                let vY = finalVel.y * velocityFactor;
                const currentSpeed = Math.sqrt(vX * vX + vY * vY);
                if (currentSpeed > maxVelocity) {
                    const scale = maxVelocity / currentSpeed;
                    vX *= scale;
                    vY *= scale;
                }
                velocityRef.current = { x: vX, y: vY };
                isMovingRef.current = true;
                setState(prev => ({ ...prev, isDragging: false, isMoving: true, velocity: velocityRef.current }));
                // Start inertia animation
                if (!animationFrameRef.current) {
                     animationFrameRef.current = requestAnimationFrame(runInertia);
                }
                triggerHapticFeedback('light'); // Haptic on flick release
            } else {
                // Not enough velocity, just stop
                 velocityRef.current = { x: 0, y: 0 };
                 setState(prev => ({ ...prev, isDragging: false, isMoving: false, velocity: {x:0, y:0} }));
            }

            pointerStartRef.current = null;
            lastPointerMoveRef.current = null;
        };

        contentElement.style.cursor = 'grab';
        contentElement.style.touchAction = 
            axis === 'x' ? 'pan-y' : 
            axis === 'y' ? 'pan-x' : 'none'; // Prevent browser scroll interference

        contentElement.addEventListener('pointerdown', handlePointerDown);
        contentElement.addEventListener('pointermove', handlePointerMove);
        contentElement.addEventListener('pointerup', handlePointerUp);
        contentElement.addEventListener('pointercancel', handlePointerUp); // Treat cancel like up

        return () => {
            contentElement.removeEventListener('pointerdown', handlePointerDown);
            contentElement.removeEventListener('pointermove', handlePointerMove);
            contentElement.removeEventListener('pointerup', handlePointerUp);
            contentElement.removeEventListener('pointercancel', handlePointerUp);
            contentElement.style.cursor = '';
            contentElement.style.touchAction = '';
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        };
    }, [contentRef, isDisabled, runInertia, velocityThreshold, velocityFactor, maxVelocity, axis]);

    // --- Controls --- 
    const reset = useCallback(() => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        isMovingRef.current = false;
        isDraggingRef.current = false;
        positionRef.current = { x: 0, y: 0 };
        velocityRef.current = { x: 0, y: 0 };
        setState({ 
            isDragging: false, 
            isMoving: false, 
            position: { x: 0, y: 0 }, 
            velocity: { x: 0, y: 0 } 
        });
    }, []);

    const stopMovement = useCallback(() => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        isMovingRef.current = false;
        velocityRef.current = { x: 0, y: 0 };
        // Keep current position, just stop velocity/animation
        setState(prev => ({ ...prev, isMoving: false, velocity: { x: 0, y: 0 } }));
    }, []);

    // --- Style --- 
    const style = useMemo(() => ({
        transform: `translate3d(${state.position.x}px, ${state.position.y}px, 0)`,
        // transition: isDraggingRef.current ? 'none' : 'transform 0s', // Let animation loop handle movement
        willChange: 'transform',
    } as React.CSSProperties), [state.position]);

    return {
        style: isDisabled ? {} : style,
        state,
        reset,
        stopMovement,
    };
}; 