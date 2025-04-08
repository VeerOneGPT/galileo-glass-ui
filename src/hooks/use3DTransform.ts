import React, { useRef, useState, useCallback, useMemo } from 'react';
import type { 
    Transform3DState, 
    Transform3DOptions, 
    Transform3DResult, 
    SetTransform3D 
} from '../types/hooks';

const DEFAULT_STATE: Required<Transform3DState> = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
};

/**
 * Applies CSS 3D transformations to an element.
 */
export const use3DTransform = <T extends HTMLElement = HTMLElement>(
    initialTransform: Partial<Transform3DState> = {},
    options: Transform3DOptions = {}
): Transform3DResult => {
    const elementRef = useRef<T>(null);
    const [transformState, setTransformState] = useState<Required<Transform3DState>>(() => ({
        ...DEFAULT_STATE,
        ...initialTransform,
        // Ensure scale defaults correctly if individual scales are provided initially
        scale: initialTransform.scale ?? 
            (initialTransform.scaleX === initialTransform.scaleY && initialTransform.scaleY === initialTransform.scaleZ ? initialTransform.scaleX : 1) ?? 1,
        scaleX: initialTransform.scaleX ?? initialTransform.scale ?? 1,
        scaleY: initialTransform.scaleY ?? initialTransform.scale ?? 1,
        scaleZ: initialTransform.scaleZ ?? initialTransform.scale ?? 1,
    }));

    const { disabled = false } = options;

    const setTransform: SetTransform3D = useCallback((newTransform) => {
        if (disabled) return;
        setTransformState(prevState => {
            const updated = { ...prevState, ...newTransform };

            // Handle unified scale setting individual scales
            if (newTransform.scale !== undefined) {
                updated.scaleX = newTransform.scale;
                updated.scaleY = newTransform.scale;
                updated.scaleZ = newTransform.scale;
            }
            // Handle individual scales potentially changing the unified scale
            else if (newTransform.scaleX !== undefined || newTransform.scaleY !== undefined || newTransform.scaleZ !== undefined) {
                if (updated.scaleX === updated.scaleY && updated.scaleY === updated.scaleZ) {
                    updated.scale = updated.scaleX; 
                } else {
                    // If scales diverge, unified scale becomes indeterminate (or keep previous?)
                    // Let's keep it as 1 if they diverge for simplicity?
                    updated.scale = 1; 
                }
            }
            return updated;
        });
    }, [disabled]);

    const style = useMemo((): React.CSSProperties => {
        if (disabled) return {};

        const { 
            translateX, translateY, translateZ, 
            rotateX, rotateY, rotateZ, 
            scaleX, scaleY, scaleZ 
        } = transformState;

        // Construct the transform string carefully, applying only non-default values
        const transforms: string[] = [];

        // Translations
        if (translateX !== 0 || translateY !== 0 || translateZ !== 0) {
            transforms.push(`translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`);
        }
        // Rotations (order matters: typically X, Y, Z)
        if (rotateX !== 0) transforms.push(`rotateX(${rotateX}deg)`);
        if (rotateY !== 0) transforms.push(`rotateY(${rotateY}deg)`);
        if (rotateZ !== 0) transforms.push(`rotateZ(${rotateZ}deg)`);
        // Scales
        if (scaleX !== 1 || scaleY !== 1 || scaleZ !== 1) {
            transforms.push(`scale3d(${scaleX}, ${scaleY}, ${scaleZ})`);
        }

        return {
            transform: transforms.length > 0 ? transforms.join(' ') : 'none',
            transformStyle: 'preserve-3d', // Often needed for 3D
            willChange: 'transform', // Performance hint
        };
    }, [transformState, disabled]);

    return {
        ref: elementRef,
        style,
        setTransform,
        currentTransform: transformState, // Return the current state read-only
    };
}; 