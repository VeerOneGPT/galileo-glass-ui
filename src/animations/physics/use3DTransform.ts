/**
 * use3DTransform.ts
 * 
 * React hook for applying and animating 3D CSS transformations.
 * Simplifies working with rotate3d, translate3d, scale3d, and matrix3d.
 */

import React, { useState, useMemo, useRef, useEffect, RefObject, CSSProperties, useCallback } from 'react';
import { useVectorSpring, VectorSpringOptions } from './useVectorSpring'; // Import vector spring hook
import { SpringConfig, SpringPresets } from './springPhysics'; // Import config types/presets

// Basic vector type for 3D
export type Vector3D = { x: number; y: number; z: number };

/**
 * Configuration options for the use3DTransform hook
 */
export interface Transform3DOptions {
  /** Initial translation */
  initialTranslate?: Partial<Vector3D>;
  /** Initial rotation (Euler angles in degrees) */
  initialRotate?: Partial<Vector3D>;
  /** Initial scale */
  initialScale?: Partial<Vector3D> | number;
  /** Transform origin (CSS string, e.g., '50% 50% 0') */
  transformOrigin?: string;
  /** Whether to enable spring physics for animations */
  enablePhysics?: boolean;
  /** Spring physics configuration (preset name or config object) */
  physicsConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;
}

/**
 * Represents the current 3D transform state
 */
export interface Transform3DState {
  translate: Vector3D;
  rotate: Vector3D; // Euler angles (degrees)
  scale: Vector3D;
}

/**
 * Result of the use3DTransform hook
 */
export interface Transform3DResult<T extends HTMLElement = HTMLElement> {
  /** Ref to attach to the target element */
  elementRef: RefObject<T>;
  /** Current 3D transform state */
  transformState: Transform3DState;
  /** CSS style object to apply */
  style: CSSProperties;
  /** Function to update the transform state */
  setTransform: (newState: Partial<Transform3DState>) => void;
  /** Function to animate to a new transform state (basic for now) */
  animateTo: (targetState: Partial<Transform3DState>, duration?: number) => void;
}

/** Normalizes scale input to a Vector3D */
const normalizeScale = (scale: Partial<Vector3D> | number | undefined): Vector3D => {
  if (typeof scale === 'number') {
    return { x: scale, y: scale, z: scale };
  }
  return {
    x: scale?.x ?? 1,
    y: scale?.y ?? 1,
    z: scale?.z ?? 1,
  };
};

/**
 * Hook for managing and animating 3D CSS transformations.
 *
 * @param options Configuration options
 * @returns Transform3DResult containing refs, styles, and controls
 */
export function use3DTransform<T extends HTMLElement = HTMLElement>(
  options: Transform3DOptions = {}
): Transform3DResult<T> {
  const {
    initialTranslate = { x: 0, y: 0, z: 0 },
    initialRotate = { x: 0, y: 0, z: 0 },
    initialScale,
    transformOrigin,
    enablePhysics = false, // Default to false
    physicsConfig = 'DEFAULT',
  } = options;

  const elementRef = useRef<T>(null);

  // Ensure initial values are complete vectors
  const initialTranslateVec = useMemo(() => ({ x: 0, y: 0, z: 0, ...initialTranslate }), [initialTranslate]);
  const initialRotateVec = useMemo(() => ({ x: 0, y: 0, z: 0, ...initialRotate }), [initialRotate]);
  const initialScaleVec = useMemo(() => normalizeScale(initialScale), [initialScale]);

  // Use state only if physics is disabled
  const [staticTransformState, setStaticTransformState] = useState<Transform3DState>({ 
      translate: initialTranslateVec,
      rotate: initialRotateVec,
      scale: initialScaleVec
  });

  // --- Physics Setup ---
  const springOptions: VectorSpringOptions = useMemo(() => ({
      config: physicsConfig,
      immediate: !enablePhysics, // Start immediately only if physics is off (effectively static)
  }), [physicsConfig, enablePhysics]);

  const translateSpring = useVectorSpring({ ...springOptions, from: initialTranslateVec, to: initialTranslateVec });
  const rotateSpring = useVectorSpring({ ...springOptions, from: initialRotateVec, to: initialRotateVec });
  const scaleSpring = useVectorSpring({ ...springOptions, from: initialScaleVec, to: initialScaleVec });

  // Get current transform state from physics or static state
  const transformState: Transform3DState = enablePhysics
      ? { translate: translateSpring.value, rotate: rotateSpring.value, scale: scaleSpring.value }
      : staticTransformState;

  // Function to apply CSS transforms based on state
  const style = useMemo((): CSSProperties => {
    const { translate, rotate, scale } = transformState;
    
    // Construct the CSS transform string
    // Order matters: typically scale -> rotate -> translate
    const transformString = ` \
      translate3d(${translate.x}px, ${translate.y}px, ${translate.z}px) \
      rotateX(${rotate.x}deg) \
      rotateY(${rotate.y}deg) \
      rotateZ(${rotate.z}deg) \
      scale3d(${scale.x}, ${scale.y}, ${scale.z}) \
    `;

    return {
      transform: transformString.trim(),
      transformOrigin: transformOrigin,
      transformStyle: 'preserve-3d',
      willChange: 'transform',
    };
  }, [transformState, transformOrigin]);

  // Function to update state (merges updates)
  const setTransform = useCallback((newState: Partial<Transform3DState>) => {
    if (enablePhysics) {
        // Trigger spring animations
        if (newState.translate) translateSpring.start({ to: newState.translate });
        if (newState.rotate) rotateSpring.start({ to: newState.rotate });
        if (newState.scale) scaleSpring.start({ to: normalizeScale(newState.scale) });
    } else {
        // Update static state directly
        setStaticTransformState(current => ({
          translate: { ...current.translate, ...newState.translate },
          rotate: { ...current.rotate, ...newState.rotate },
          scale: newState.scale ? normalizeScale(newState.scale) : { ...current.scale },
        }));
    }
  }, [enablePhysics, translateSpring, rotateSpring, scaleSpring]);

  // Basic animation function (now uses setTransform which handles physics)
  const animateTo = useCallback((targetState: Partial<Transform3DState>, duration?: number /* Ignored with physics */) => {
    // setTransform will handle starting the spring animation if physics is enabled
    setTransform(targetState);
  }, [setTransform]);


  return {
    elementRef,
    transformState,
    style,
    setTransform,
    animateTo,
  };
}

export default use3DTransform; 