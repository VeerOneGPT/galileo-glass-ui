import React, { useRef, useMemo } from 'react';
import { useGlassFocus } from '../../hooks/useGlassFocus';
import type { GlassFocusRingProps } from '../../types/components';
// No longer need mergeRefs if attaching ref to wrapper div
// import { mergeRefs } from '../../utils/refUtils'; 

/**
 * A component that wraps a focusable element to provide an animated,
 * glass-styled focus indicator ring.
 */
export const GlassFocusRing: React.FC<GlassFocusRingProps> = ({
  children,
    color,
    variant,
    offset,
    thickness,
    borderRadius,
    disabled,
    // Extract other potential UseGlassFocusOptions if needed
}) => {
    // This ref will be attached to the wrapper div
  const wrapperRef = useRef<HTMLDivElement>(null);

    const child = React.Children.only(children);

    const focusVariant = variant || color || 'primary';

    // Use the core hook, targeting the wrapper div
    const { isFocused, focusRingProps } = useGlassFocus({
        elementRef: wrapperRef, // Target the wrapper div
        variant: focusVariant,
        offset,
        thickness,
        borderRadius,
        disabled,
    });

  return (
        // Wrapper div to capture focus and position the ring
        <div 
      ref={wrapperRef}
            style={{ 
                position: 'relative', // Needed for absolute positioning of the ring
                display: 'inline-block', // Or 'block' depending on desired layout
                outline: 'none', // Hide potential default outline on the wrapper
            }}
            // Important: Make the wrapper div focusable
            // Use onFocus/onBlur on the wrapper to trigger the hook's internal logic.
            // The hook itself adds the necessary listeners if elementRef is provided.
            tabIndex={disabled ? -1 : 0} // Make focusable only if not disabled
        >
            {/* Render the original child inside the wrapper */} 
            {child}
            {/* Render the focus ring element */} 
            {!disabled && <div data-testid="glass-focus-ring-element" {...focusRingProps} />} 
        </div>
  );
};

// Add default export if this is the main export of the file
// export default GlassFocusRing; 