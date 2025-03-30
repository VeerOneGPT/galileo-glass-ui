import React, { useRef, useState, useCallback, useEffect, forwardRef, CSSProperties } from 'react';
import { GlassButton, ButtonProps as GlassButtonProps } from './Button';

export interface MagneticButtonProps extends GlassButtonProps {
  /**
   * Strength of the magnetic effect. Higher values mean stronger pull.
   * @default 0.5
   */
  magneticStrength?: number;
  /**
   * Radius in pixels within which the magnetic effect is active.
   * @default 150
   */
  magneticRadius?: number;
  /**
   * Damping factor for the return-to-center movement (0 to 1). Lower values are slower/smoother.
   * @default 0.8
   */
  magneticDampingFactor?: number; // Note: This is not directly used in the current calculation logic
  /**
   * Custom styles to apply to the button, merged with magnetic transform.
   */
  style?: CSSProperties;
}

/**
 * A GlassButton with a magnetic effect that attracts the button towards the cursor on hover.
 */
export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      magneticStrength = 0.5,
      magneticRadius = 150,
      magneticDampingFactor = 0.8, // Keep prop for potential future use or different logic
      style: propStyle, // Rename to avoid conflict
      onPointerEnter,
      onPointerLeave,
      ...restProps // Pass remaining GlassButtonProps
    },
    ref // Forwarded ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const animationFrame = useRef<number | null>(null);

    // Combine forwarded ref and local ref
    const combinedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      },
      [ref]
    );

    // Function to calculate magnetic attraction
    const calculateMagneticAttraction = useCallback((distanceX: number, distanceY: number, rect: DOMRect) => {
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

        if (distance > magneticRadius || !rect) {
            return { x: 0, y: 0 };
        }

        // Smoother falloff using cosine easing
        const normalizedDistance = distance / magneticRadius;
        const pullFactor = (Math.cos(normalizedDistance * Math.PI) + 1) / 2; // Cosine easing
        const attraction = pullFactor * magneticStrength;

        // Avoid division by zero if distance is zero
        if (distance === 0) return { x: 0, y: 0 };

        // Scale pull relative to button size (pull towards edge, not just center proportional)
        const pullToX = (distanceX / distance) * (rect.width / 2) * attraction;
        const pullToY = (distanceY / distance) * (rect.height / 2) * attraction;

        return {
            x: pullToX,
            y: pullToY,
        };
    }, [magneticRadius, magneticStrength]);


    // Handle pointer move event
    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!buttonRef.current || !isHovered) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        const attraction = calculateMagneticAttraction(distanceX, distanceY, rect);

        // Directly set position based on attraction
        setPosition({
            x: attraction.x,
            y: attraction.y
        });

    }, [isHovered, calculateMagneticAttraction]);


    // Return to center animation loop
    const returnToCenter = useCallback(() => {
        if (!isHovered && buttonRef.current && (Math.abs(position.x) > 0.01 || Math.abs(position.y) > 0.01)) {
            // Smoother damping towards center
            const dampFactor = 0.15; // Controls speed of return (higher is faster damping)
            const nextX = position.x * (1 - dampFactor);
            const nextY = position.y * (1 - dampFactor);

            setPosition({ x: nextX, y: nextY });
            animationFrame.current = requestAnimationFrame(returnToCenter);
        } else if (!isHovered) {
            // Snap to center when close enough
            setPosition({ x: 0, y: 0 });
            if (animationFrame.current !== null) {
                cancelAnimationFrame(animationFrame.current);
                animationFrame.current = null;
            }
        } else {
            // If hovered, ensure no return animation is running
             if (animationFrame.current !== null) {
                cancelAnimationFrame(animationFrame.current);
                animationFrame.current = null;
            }
        }
    }, [isHovered, position.x, position.y]);


    // Set up global event listener for pointermove
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Use capture phase to potentially get events slightly earlier if needed
            window.addEventListener('pointermove', handlePointerMove, { capture: false, passive: true });
            return () => {
                window.removeEventListener('pointermove', handlePointerMove, { capture: false });
                if (animationFrame.current !== null) {
                    cancelAnimationFrame(animationFrame.current);
                }
            };
        }
    }, [handlePointerMove]);


    // Trigger returnToCenter when hover state changes
     useEffect(() => {
        // Stop any ongoing return animation if we start hovering
        if (isHovered && animationFrame.current !== null) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
        // Start return animation if we stop hovering
        else if (!isHovered) {
            // Ensure previous animation frame is cancelled before starting a new one
             if (animationFrame.current !== null) {
                 cancelAnimationFrame(animationFrame.current);
             }
            animationFrame.current = requestAnimationFrame(returnToCenter);
        }

        // Cleanup function for the effect
        return () => {
            if (animationFrame.current !== null) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, [isHovered, returnToCenter]);


    const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
      setIsHovered(true);
      if (onPointerEnter) {
        onPointerEnter(e);
      }
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
      setIsHovered(false);
       // Let returnToCenter handle the smooth return.
      if (onPointerLeave) {
        onPointerLeave(e);
      }
    };

    // Combine prop style with dynamic transform style
    const combinedStyle: CSSProperties = {
      ...propStyle,
      transform: `translate3d(${position.x}px, ${position.y}px, 0)`, // Use translate3d for potential GPU acceleration
      transition: isHovered ? 'transform 0.05s linear' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)', // Faster follow, slower return
      willChange: 'transform', // Performance hint
    };


    return (
      <GlassButton
        ref={combinedRef}
        style={combinedStyle}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...restProps} // Pass all other GlassButton props
      />
    );
  }
);

MagneticButton.displayName = 'MagneticButton';

export default MagneticButton; 