import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { MagneticElementOptions } from '../types/hooks'; // Corrected path
import { useReducedMotion } from './useReducedMotion'; // Corrected path
import { useGalileoStateSpring } from './useGalileoStateSpring'; // Import the spring hook
import type { SpringConfig } from '../animations/physics/springPhysics'; // Import type
import { useAnimationContext } from '../contexts/AnimationContext'; // Import context
import { MotionSensitivityLevel, AnimationCategory } from '../types/accessibility'; // Import enums
// Remove react-spring and context imports for now
// import { useAnimationContext } from '../contexts/AnimationContext';
// import { SpringPresets } from '../animations/physics/springPhysics';
// import type { SpringConfig } from '../animations/physics/springPhysics';

// Helper function to calculate distance
const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper function to calculate angle in degrees between two points
const calculateAngleDegrees = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

// Helper function to apply directional field modifiers
const applyDirectionalField = (
  force: number, 
  pointerPosition: { x: number; y: number }, 
  elementCenter: { x: number; y: number }, 
  directionalField: NonNullable<MagneticElementOptions['directionalField']>
): number => {
  // Calculate angle from element to pointer
  const angle = calculateAngleDegrees(elementCenter, pointerPosition);
  
  // Calculate the angular distance from the preferred direction
  const angleDifference = ((angle - directionalField.direction) + 180) % 360 - 180;
  const normalizedDifference = Math.abs(angleDifference) / 180;
  
  // Calculate the directional modifier based on the shape
  let modifier: number;
  if (directionalField.shape === 'cosine') {
    // Cosine gives a smoother falloff from 1 to 0
    modifier = Math.cos(normalizedDifference * Math.PI);
    // Scale to 0-1 range
    modifier = (modifier + 1) / 2;
  } else {
    // Linear falloff (default)
    modifier = 1 - normalizedDifference;
  }
  
  // Apply intensity to make the effect more or less focused
  modifier = Math.pow(modifier, directionalField.intensity || 1);
  
  // Invert if needed (strongest perpendicular to direction)
  if (directionalField.invert) {
    modifier = 1 - modifier;
  }
  
  // Apply the modifier to the force
  return force * modifier;
};

// Default options adjusted to include correct defaults
const DEFAULT_MAGNETIC_OPTIONS = {
    strength: 0.4,
    radius: 150,
    mode: 'attract',
    followPointer: false, 
    maxDisplacement: 40,
    disabled: false,
    motionSensitivityLevel: MotionSensitivityLevel.MEDIUM, 
    category: AnimationCategory.FEEDBACK,
};

export const useMagneticElement = <T extends HTMLElement = HTMLElement>(
    options: MagneticElementOptions = {}
): {
  ref: React.RefObject<T>;
  style: React.CSSProperties;
  isActive: boolean;
} => {
    const elementRef = useRef<T>(null);
    const [isActive, setIsActive] = useState(false);
    const pointerPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isPointerOver = useRef(false);
    const targetPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const currentSpringPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // Track current spring value
    const linkedElements = useRef<Map<HTMLElement, { x: number, y: number }> | null>(null);

    const prefersReducedMotion = useReducedMotion();
    // Get sensitivity level from context
    const { motionSensitivityLevel: contextSensitivityLevel } = useAnimationContext();

    // Initialize linked elements tracking
    useEffect(() => {
        if (options.linkedElements?.length) {
            linkedElements.current = new Map();
        } else {
            linkedElements.current = null;
        }
    }, [options.linkedElements]);

    // Resolve non-physics options, incorporating sensitivity
    const resolvedOptions = useMemo((): Required<Omit<typeof DEFAULT_MAGNETIC_OPTIONS, never>> & {
        directionalField: MagneticElementOptions['directionalField'];
        linkedElements: MagneticElementOptions['linkedElements'];
    } => {
        // Determine the sensitivity level to use
        const sensitivityLevel = options.motionSensitivityLevel ?? contextSensitivityLevel ?? MotionSensitivityLevel.MEDIUM;
        let sensitivityMultiplier = 1.0;
        switch (sensitivityLevel) {
            case MotionSensitivityLevel.LOW: sensitivityMultiplier = 0.5; break;
            case MotionSensitivityLevel.HIGH: sensitivityMultiplier = 1.5; break;
            default: sensitivityMultiplier = 1.0; break;
        }

        // Determine category
        const category = options.category ?? DEFAULT_MAGNETIC_OPTIONS.category;

        return {
            strength: options.strength ?? DEFAULT_MAGNETIC_OPTIONS.strength,
            radius: options.radius ?? DEFAULT_MAGNETIC_OPTIONS.radius,
            mode: options.mode ?? DEFAULT_MAGNETIC_OPTIONS.mode,
            followPointer: options.followPointer ?? DEFAULT_MAGNETIC_OPTIONS.followPointer,
            maxDisplacement: (options.maxDisplacement ?? DEFAULT_MAGNETIC_OPTIONS.maxDisplacement) * sensitivityMultiplier,
            disabled: options.disabled ?? DEFAULT_MAGNETIC_OPTIONS.disabled,
            motionSensitivityLevel: sensitivityLevel,
            category: category,
            directionalField: options.directionalField,
            linkedElements: options.linkedElements,
        };
    }, [options, contextSensitivityLevel]);

    const isDisabled = resolvedOptions.disabled || prefersReducedMotion;

    // --- Use Galileo Springs for X and Y --- 
    const springOptions = useMemo(() => ({ 
        immediate: isDisabled,
        animationConfig: options.animationConfig,
        tension: options.stiffness,
        friction: options.damping ? (options.damping * 2 * Math.sqrt((options.stiffness ?? 170) * (options.mass ?? 1))) : undefined,
        mass: options.mass,
        // Pass resolved sensitivity level down to the spring hook
        motionSensitivityLevel: resolvedOptions.motionSensitivityLevel,
        // Update currentSpringPos ref whenever the spring value changes
        onChange: (result: { value: { x?: number, y?: number } }) => { 
             console.log('[useMagneticElement] Spring onChange:', result.value);
             if (result.value.x !== undefined) currentSpringPos.current.x = result.value.x;
             if (result.value.y !== undefined) currentSpringPos.current.y = result.value.y;
        }
    }), [
        isDisabled, options.animationConfig, options.stiffness, 
        options.damping, options.mass, 
        resolvedOptions.motionSensitivityLevel // Use resolved level from memoized options
    ]);

    const { value: springX, start: startX, stop: stopX } = useGalileoStateSpring(0, springOptions);
    const { value: springY, start: startY, stop: stopY } = useGalileoStateSpring(0, springOptions);

    // Event listeners for pointer tracking
    useEffect(() => {
        if (isDisabled || !elementRef.current) return;

        const element = elementRef.current;
        let elementBounds = element.getBoundingClientRect();
        let elementCenter = { x: elementBounds.left + elementBounds.width / 2, y: elementBounds.top + elementBounds.height / 2 };

        const updateBounds = () => {
             if(!elementRef.current) return;
             elementBounds = elementRef.current.getBoundingClientRect();
             elementCenter = { x: elementBounds.left + elementBounds.width / 2, y: elementBounds.top + elementBounds.height / 2 };
        }
        window.addEventListener('resize', updateBounds);
        window.addEventListener('scroll', updateBounds, true); 

        const handlePointerMove = (event: PointerEvent) => {
            pointerPosition.current = { x: event.clientX, y: event.clientY };
            console.log('[useMagneticElement] Pointer Move:', pointerPosition.current);
            
            // Calculate distance relative to the element's visual center (including spring offset)
            const currentVisualCenterX = elementCenter.x + currentSpringPos.current.x;
            const currentVisualCenterY = elementCenter.y + currentSpringPos.current.y;
            const dist = calculateDistance(pointerPosition.current, {x: currentVisualCenterX, y: currentVisualCenterY });
            console.log(`[useMagneticElement] Dist: ${dist.toFixed(2)}, Radius: ${resolvedOptions.radius}`);

            // Only calculate if pointer entered the element OR if followPointer is enabled
            if (!isPointerOver.current && !resolvedOptions.followPointer) {
                 // If not following and pointer left radius, reset
                 if (isActive) {
                     setIsActive(false);
                     targetPosition.current = { x: 0, y: 0 };
                     startX({ to: 0 });
                     startY({ to: 0 });
                 }
                 return; 
             }

            let targetX = 0;
            let targetY = 0;
            let shouldBeActive = false;

            if (dist < resolvedOptions.radius || resolvedOptions.followPointer) { // Always calculate if followPointer
                shouldBeActive = dist < resolvedOptions.radius; // Still only visually active within radius

                const direction = resolvedOptions.mode === 'attract' ? 1 : -1;
                let dx = pointerPosition.current.x - currentVisualCenterX;
                let dy = pointerPosition.current.y - currentVisualCenterY;
                
                if (resolvedOptions.followPointer) {
                    // Target moves towards the pointer position relative to the static center
                    // The spring will handle moving the element there
                    targetX = pointerPosition.current.x - elementCenter.x;
                    targetY = pointerPosition.current.y - elementCenter.y;
                } else { 
                    // Original magnetic effect: move element based on distance/strength
                    let forceFactor = resolvedOptions.strength * (1 - Math.min(dist, resolvedOptions.radius) / resolvedOptions.radius);
                    console.log(`[useMagneticElement] Initial ForceFactor: ${forceFactor.toFixed(3)}`);
                    
                    // Apply directional field if specified
                    if (resolvedOptions.directionalField) {
                        forceFactor = applyDirectionalField(
                            forceFactor, 
                            pointerPosition.current, 
                            { x: currentVisualCenterX, y: currentVisualCenterY }, 
                            resolvedOptions.directionalField
                        );
                    }
                    
                    targetX = dx * forceFactor * direction;
                    targetY = dy * forceFactor * direction;
                    console.log(`[useMagneticElement] Target after force: (${targetX.toFixed(2)}, ${targetY.toFixed(2)})`);
                }
                
                // Clamp displacement (apply regardless of mode)
                const displacement = Math.sqrt(targetX * targetX + targetY * targetY);
                if (displacement > resolvedOptions.maxDisplacement) {
                    const scale = resolvedOptions.maxDisplacement / displacement;
                    targetX *= scale;
                    targetY *= scale;
                    console.log(`[useMagneticElement] Target after clamp: (${targetX.toFixed(2)}, ${targetY.toFixed(2)})`);
                }
            } else {
                // Outside radius and not following pointer
                shouldBeActive = false;
                targetX = 0;
                targetY = 0;
            }
            
            // --- Snap Points Logic --- 
            const snapThreshold = 20; // Pixels: How close the pointer needs to be to a snap point
            const snapForceThreshold = 25; // Pixels: How close the calculated target needs to be before snapping
            let didSnap = false;

            if (options.snapPoints && options.snapPoints.length > 0 && dist < resolvedOptions.radius) { // Only snap if pointer is within main radius
                for (const point of options.snapPoints) {
                    // Calculate distance from the *pointer* to the snap point (relative to element center)
                    const snapPointGlobalX = elementCenter.x + point.x;
                    const snapPointGlobalY = elementCenter.y + point.y;
                    const pointerDistToSnap = calculateDistance(pointerPosition.current, { x: snapPointGlobalX, y: snapPointGlobalY });

                    // Calculate distance from the calculated magnetic/follow target to the snap point
                    const targetDistToSnap = calculateDistance({ x: targetX, y: targetY }, point);
                    
                    // Option 2: Snap if calculated target is close enough (might feel better)
                    if (targetDistToSnap < snapForceThreshold) {
                        targetX = point.x;
                        targetY = point.y;
                        didSnap = true;
                        break; // Snap to the first point found
                    }
                }
            }
            // --- End Snap Points --- 

            // --- Process Linked Elements --- 
            if (resolvedOptions.linkedElements && linkedElements.current && elementRef.current) {
                for (const link of resolvedOptions.linkedElements) {
                    if (!link.elementRef.current) continue;
                    
                    // Calculate distance between this element and the linked element
                    const linkedBounds = link.elementRef.current.getBoundingClientRect();
                    const linkedCenter = { 
                        x: linkedBounds.left + linkedBounds.width / 2, 
                        y: linkedBounds.top + linkedBounds.height / 2
                    };
                    
                    const distToLinked = calculateDistance(
                        { x: elementCenter.x + targetX, y: elementCenter.y + targetY },
                        linkedCenter
                    );
                    
                    // Skip if beyond max distance
                    const maxDist = link.maxDistance ?? resolvedOptions.radius * 2;
                    if (distToLinked > maxDist) {
                        continue;
                    }
                    
                    // Calculate force between elements
                    const linkStrength = link.strength ?? resolvedOptions.strength * 0.5;
                    const linkDirection = (link.mode ?? resolvedOptions.mode) === 'attract' ? 1 : -1;
                    const linkForceFactor = linkStrength * (1 - (distToLinked / maxDist)) * linkDirection;
                    
                    // Calculate vector toward/away from linked element
                    const dx = linkedCenter.x - (elementCenter.x + targetX);
                    const dy = linkedCenter.y - (elementCenter.y + targetY);
                    const mag = Math.sqrt(dx * dx + dy * dy) || 1; // Avoid division by zero
                    
                    // Apply force to our target position
                    targetX += (dx / mag) * linkForceFactor * resolvedOptions.maxDisplacement;
                    targetY += (dy / mag) * linkForceFactor * resolvedOptions.maxDisplacement;
                    
                    // Track this element's position for the linked element to use
                    linkedElements.current.set(link.elementRef.current, { 
                        x: elementCenter.x + targetX, 
                        y: elementCenter.y + targetY 
                    });
                }
                
                // Apply final displacement limit again after linked forces
                const finalDisplacement = Math.sqrt(targetX * targetX + targetY * targetY);
                if (finalDisplacement > resolvedOptions.maxDisplacement) {
                    const scale = resolvedOptions.maxDisplacement / finalDisplacement;
                    targetX *= scale;
                    targetY *= scale;
                }
            }
            // --- End Linked Elements ---

            // --- MODIFICATION START: Always trigger spring update --- 
            // Always update the target ref *before* calling start
            targetPosition.current = { x: targetX, y: targetY };

            // Always call start, let the spring handle if the target is the same
            // This bypasses the check: if (targetPosition.current.x !== targetX || ...)
            startX({ to: targetX });
            startY({ to: targetY });
            // --- MODIFICATION END ---
            
            // Update isActive state
            if(isActive !== shouldBeActive) {
                setIsActive(shouldBeActive);
            }
        };

        const handlePointerEnter = (event: PointerEvent) => {
            isPointerOver.current = true;
            updateBounds(); 
            handlePointerMove(event); 
        };

        const handlePointerLeave = () => {
            isPointerOver.current = false;
            // Don't reset immediately if followPointer is on and pointer still near
             if (!resolvedOptions.followPointer) {
                 setIsActive(false);
                 targetPosition.current = { x: 0, y: 0 };
                 startX({ to: 0 });
                 startY({ to: 0 });
             } else {
                 // If followPointer, check distance on leave before deciding to reset
                 const dist = calculateDistance(pointerPosition.current, elementCenter);
                 if (dist >= resolvedOptions.radius) {
                      setIsActive(false);
                      targetPosition.current = { x: 0, y: 0 };
                      startX({ to: 0 });
                      startY({ to: 0 });
                 }
             }
        };

        element.addEventListener('pointerenter', handlePointerEnter);
        element.addEventListener('pointerleave', handlePointerLeave);
        window.addEventListener('pointermove', handlePointerMove);

        return () => {
            element.removeEventListener('pointerenter', handlePointerEnter);
            element.removeEventListener('pointerleave', handlePointerLeave);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('resize', updateBounds);
            window.removeEventListener('scroll', updateBounds, true);
            // Stop springs on cleanup
            stopX();
            stopY();
        };
    }, [resolvedOptions, isDisabled, startX, startY, stopX, stopY, isActive, options.snapPoints]); // Include spring controls and snapPoints in deps

    // Construct the style object
    const style = useMemo(() => {
        // Apply simple transition for now, physics later
        return {
            transform: `translate3d(${springX}px, ${springY}px, 0)`,
            transition: isDisabled ? 'none' : 'transform 0.1s ease-out', // Fast transition
            willChange: 'transform', 
        } as React.CSSProperties;
    }, [springX, springY, isDisabled]);

    return {
        ref: elementRef,
        style: isDisabled ? {} : style, 
        isActive,
    };
}; 