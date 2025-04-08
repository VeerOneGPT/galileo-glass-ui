import React from 'react';
import type { UseGlassFocusOptions } from '../hooks/useGlassFocus'; // Assuming this path is correct

/**
 * Props for the GlassFocusRing component.
 * Extends UseGlassFocusOptions, omitting elementRef which is handled internally.
 * Adds 'children' prop.
 */
export interface GlassFocusRingProps extends Omit<UseGlassFocusOptions, 'elementRef'> {
    /** The focusable element that the ring should wrap. Must be a single React element. */
    children: React.ReactElement;
    /** Optional color alias for variant prop for simpler usage. Maps to 'variant'. */
    color?: UseGlassFocusOptions['variant'];
} 