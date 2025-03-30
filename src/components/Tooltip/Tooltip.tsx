import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo, cloneElement } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useGalileoSprings, type SpringsAnimationResult } from '../../hooks/useGalileoSprings';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { AnimationProps } from '../../animations/types';

export interface TooltipProps extends AnimationProps {
  /**
   * The tooltip content
   */
  title: React.ReactNode;

  /**
   * The child element that the tooltip will be attached to
   */
  children: React.ReactElement;

  /**
   * The placement of the tooltip
   */
  placement?:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end';

  /**
   * If true, the tooltip will not be displayed
   */
  disabled?: boolean;

  /**
   * The variant of the tooltip appearance
   */
  variant?: 'standard' | 'glass';

  /**
   * The color of the tooltip
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

  /**
   * The maximum width of the tooltip
   */
  maxWidth?: number;

  /**
   * If true, add an arrow pointing to the target
   */
  arrow?: boolean;

  /**
   * The delay (ms) before showing the tooltip
   */
  enterDelay?: number;

  /**
   * The delay (ms) before hiding the tooltip
   */
  leaveDelay?: number;

  /**
   * If true, the tooltip will be interactive (can be hovered)
   */
  interactive?: boolean;

  /**
   * Additional CSS class for the tooltip
   */
  className?: string;

  /**
   * Optional spring configuration or preset name for the tooltip animation.
   */
  animationConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;

  /**
   * If true, disables the transition animation.
   */
  disableAnimation?: boolean;
}

// Get color by name for theme consistency
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#1F2937'; // default dark gray
  }
};

// Calculate the position for the tooltip
const getTooltipPosition = (
  placement: string,
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  arrow: boolean
): { top: number; left: number; arrowTop?: number; arrowLeft?: number } => {
  const arrowSize = arrow ? 8 : 0;
  const offset = arrow ? arrowSize + 4 : 8;

  let top = 0;
  let left = 0;
  let arrowTop;
  let arrowLeft;

  switch (placement) {
    case 'top':
      top = targetRect.top - tooltipRect.height - offset;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      arrowTop = tooltipRect.height;
      arrowLeft = tooltipRect.width / 2 - arrowSize;
      break;

    case 'top-start':
      top = targetRect.top - tooltipRect.height - offset;
      left = targetRect.left;
      arrowTop = tooltipRect.height;
      arrowLeft = Math.min(tooltipRect.width / 4, targetRect.width / 2);
      break;

    case 'top-end':
      top = targetRect.top - tooltipRect.height - offset;
      left = targetRect.right - tooltipRect.width;
      arrowTop = tooltipRect.height;
      arrowLeft =
        tooltipRect.width - Math.min(tooltipRect.width / 4, targetRect.width / 2) - arrowSize * 2;
      break;

    case 'bottom':
      top = targetRect.bottom + offset;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      arrowTop = -arrowSize;
      arrowLeft = tooltipRect.width / 2 - arrowSize;
      break;

    case 'bottom-start':
      top = targetRect.bottom + offset;
      left = targetRect.left;
      arrowTop = -arrowSize;
      arrowLeft = Math.min(tooltipRect.width / 4, targetRect.width / 2);
      break;

    case 'bottom-end':
      top = targetRect.bottom + offset;
      left = targetRect.right - tooltipRect.width;
      arrowTop = -arrowSize;
      arrowLeft =
        tooltipRect.width - Math.min(tooltipRect.width / 4, targetRect.width / 2) - arrowSize * 2;
      break;

    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left - tooltipRect.width - offset;
      arrowTop = tooltipRect.height / 2 - arrowSize;
      arrowLeft = tooltipRect.width;
      break;

    case 'left-start':
      top = targetRect.top;
      left = targetRect.left - tooltipRect.width - offset;
      arrowTop = Math.min(tooltipRect.height / 4, targetRect.height / 2);
      arrowLeft = tooltipRect.width;
      break;

    case 'left-end':
      top = targetRect.bottom - tooltipRect.height;
      left = targetRect.left - tooltipRect.width - offset;
      arrowTop =
        tooltipRect.height -
        Math.min(tooltipRect.height / 4, targetRect.height / 2) -
        arrowSize * 2;
      arrowLeft = tooltipRect.width;
      break;

    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.right + offset;
      arrowTop = tooltipRect.height / 2 - arrowSize;
      arrowLeft = -arrowSize;
      break;

    case 'right-start':
      top = targetRect.top;
      left = targetRect.right + offset;
      arrowTop = Math.min(tooltipRect.height / 4, targetRect.height / 2);
      arrowLeft = -arrowSize;
      break;

    case 'right-end':
      top = targetRect.bottom - tooltipRect.height;
      left = targetRect.right + offset;
      arrowTop =
        tooltipRect.height -
        Math.min(tooltipRect.height / 4, targetRect.height / 2) -
        arrowSize * 2;
      arrowLeft = -arrowSize;
      break;

    default:
      // Default to top
      top = targetRect.top - tooltipRect.height - offset;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      arrowTop = tooltipRect.height;
      arrowLeft = tooltipRect.width / 2 - arrowSize;
  }

  // Ensure tooltip stays within viewport
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Adjust horizontally if needed
  if (left + tooltipRect.width > scrollX + windowWidth) {
    left = scrollX + windowWidth - tooltipRect.width - 8;
  }
  if (left < scrollX) {
    left = scrollX + 8;
  }

  // Adjust vertically if needed
  if (top + tooltipRect.height > scrollY + windowHeight) {
    top = scrollY + windowHeight - tooltipRect.height - 8;
  }
  if (top < scrollY) {
    top = scrollY + 8;
  }

  return { top, left, arrowTop, arrowLeft };
};

// Styled components
const TooltipContent = styled.div<{
  $variant: string;
  $color: string;
  $maxWidth: number;
  $placement: string;
}>`
  position: fixed;
  z-index: 1500;
  max-width: ${props => props.$maxWidth}px;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  line-height: 1.4;
  padding: 6px 10px;
  border-radius: 4px;
  pointer-events: none;
  will-change: top, left, transform, opacity;

  /* Variant styles */
  ${props => {
    if (props.$variant === 'glass') {
      return `
        background-color: ${
          props.$color === 'default' ? 'rgba(31, 41, 55, 0.8)' : `${getColorByName(props.$color)}CC`
        };
        color: white;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      `;
    }

    // standard
    return `
      background-color: ${
        props.$color === 'default' ? 'rgba(31, 41, 55, 0.9)' : getColorByName(props.$color)
      };
      color: white;
    `;
  }}

  /* Glass effect for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    glassSurface({
      elevation: 2,
      blurStrength: 'standard',
      backgroundOpacity: 'medium',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}),
    })}
  
  /* Glass glow for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    props.$color !== 'default' &&
    glassGlow({
      intensity: 'minimal',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Transform origin based on placement */
  ${props => {
    if (props.$placement.startsWith('top')) {
      return 'transform-origin: bottom center;';
    }
    if (props.$placement.startsWith('bottom')) {
      return 'transform-origin: top center;';
    }
    if (props.$placement.startsWith('left')) {
      return 'transform-origin: right center;';
    }
    if (props.$placement.startsWith('right')) {
      return 'transform-origin: left center;';
    }
    return '';
  }}
`;

const TooltipArrow = styled.div<{
  $variant: string;
  $color: string;
}>`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 8px;
  border-color: transparent;
  pointer-events: none;

  /* Variant styles */
  ${props => {
    const tooltipColor =
      props.$color === 'default'
        ? props.$variant === 'glass'
          ? 'rgba(31, 41, 55, 0.8)'
          : 'rgba(31, 41, 55, 0.9)'
        : props.$variant === 'glass'
        ? `${getColorByName(props.$color)}CC`
        : getColorByName(props.$color);

    return `
      &.arrow-top { border-bottom-color: ${tooltipColor}; }
      &.arrow-bottom { border-top-color: ${tooltipColor}; }
      &.arrow-left { border-right-color: ${tooltipColor}; }
      &.arrow-right { border-left-color: ${tooltipColor}; }
    `;
  }}
`;

/**
 * Tooltip Component
 *
 * A component that displays informative text when users hover over, focus on,
 * or tap an element.
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>((props, ref) => {
  const {
    title,
    children,
    placement = 'top',
    disabled = false,
    variant = 'standard',
    color = 'default',
    maxWidth = 300,
    arrow = false,
    enterDelay = 100,
    leaveDelay = 0,
    interactive = false,
    className,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const [visible, setVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [position, setPosition] = useState({ top: -1000, left: -1000 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 });
  const [arrowClass, setArrowClass] = useState('arrow-top');

  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<number | undefined>();
  const leaveTimeoutRef = useRef<number | undefined>();

  const prefersReducedMotion = useReducedMotion();
  const { defaultSpring } = useAnimationContext();
  const shouldAnimate = !(disableAnimation ?? prefersReducedMotion);

  // Calculate final spring config
  const finalSpringConfig = useMemo(() => {
    // Default to a quick spring for tooltips
    const baseConfig: SpringConfig = SpringPresets.STIFF;
    let contextConfig: Partial<SpringConfig> = {};
    const contextTooltipSpring = defaultSpring; // Use defaultSpring for now
    if (typeof contextTooltipSpring === 'string' && contextTooltipSpring in SpringPresets) {
      contextConfig = SpringPresets[contextTooltipSpring as keyof typeof SpringPresets];
    } else if (typeof contextTooltipSpring === 'object') {
      contextConfig = contextTooltipSpring ?? {};
    }

    let propConfig: Partial<SpringConfig> = {};
    if (typeof animationConfig === 'string' && animationConfig in SpringPresets) {
      propConfig = SpringPresets[animationConfig as keyof typeof SpringPresets];
    } else if (typeof animationConfig === 'object') {
      propConfig = animationConfig ?? {};
    }
    return { ...baseConfig, ...contextConfig, ...propConfig };
  }, [defaultSpring, animationConfig]);

  // --- Animation Setup ---
  const getAnimationTargets = () => {
    const targets = {
      opacity: visible ? 1 : 0,
      scale: visible ? 1 : 0.95,
      translateY: 0,
    };
    // Add slight vertical movement based on placement
    const offset = 5;
    if (!visible) {
      if (placement.startsWith('top')) targets.translateY = offset;
      else if (placement.startsWith('bottom')) targets.translateY = -offset;
    }
    return targets;
  };

  const handleRest = useCallback((result: SpringsAnimationResult) => {
    if (result.finished && !visible) {
      setIsRendered(false);
    }
  }, [visible]);

  const animatedValues = useGalileoSprings(getAnimationTargets(), {
    config: finalSpringConfig,
    immediate: !shouldAnimate,
    onRest: handleRest,
  });

  // Immediately render when becoming visible
  useEffect(() => {
    if (visible) {
      setIsRendered(true);
    }
  }, [visible]);

  // Function to update tooltip position
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const targetRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Get tooltip and arrow position
    const { top, left, arrowTop, arrowLeft } = getTooltipPosition(
      placement,
      targetRect,
      tooltipRect,
      arrow
    );

    // Determine arrow direction
    let arrowDir = 'arrow-top';
    if (placement.startsWith('top')) {
      arrowDir = 'arrow-top';
    } else if (placement.startsWith('bottom')) {
      arrowDir = 'arrow-bottom';
    } else if (placement.startsWith('left')) {
      arrowDir = 'arrow-left';
    } else if (placement.startsWith('right')) {
      arrowDir = 'arrow-right';
    }

    setPosition({ top, left });
    if (arrow && arrowTop !== undefined && arrowLeft !== undefined) {
      setArrowPosition({ top: arrowTop, left: arrowLeft });
    }
    setArrowClass(arrowDir);
  };

  // Show the tooltip
  const handleShow = () => {
    if (disabled || !title) return;

    clearTimeout(enterTimeoutRef.current);
    clearTimeout(leaveTimeoutRef.current);

    enterTimeoutRef.current = window.setTimeout(() => {
      setVisible(true);
      // Update position after render
      setTimeout(updatePosition, 0);
    }, enterDelay);
  };

  // Hide the tooltip
  const handleHide = () => {
    clearTimeout(enterTimeoutRef.current);
    clearTimeout(leaveTimeoutRef.current);

    leaveTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, leaveDelay);
  };

  // Handle tooltip touch events
  const handleTouchStart = () => {
    handleShow();

    // Auto-hide after 1.5s for mobile
    setTimeout(handleHide, 1500);
  };

  // Handle hover on tooltip for interactive mode
  const handleTooltipMouseEnter = () => {
    if (interactive) {
      clearTimeout(leaveTimeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (interactive) {
      handleHide();
    }
  };

  // Clone child element with tooltip trigger props
  const trigger = React.cloneElement(children, {
    ref: (node: HTMLElement) => {
      // Save the trigger element reference
      triggerRef.current = node;

      // Forward the ref to the original ref if it exists
      const { ref: childRef } = children as any;
      if (childRef) {
        if (typeof childRef === 'function') {
          childRef(node);
        } else if (Object.prototype.hasOwnProperty.call(childRef, 'current')) {
          if (childRef && 'current' in childRef) {
            (childRef as React.MutableRefObject<HTMLElement>).current = node;
          }
        }
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleShow();

      // Call original handler if it exists
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleHide();

      // Call original handler if it exists
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      handleShow();

      // Call original handler if it exists
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      handleHide();

      // Call original handler if it exists
      if (children.props.onBlur) {
        children.props.onBlur(e);
      }
    },
    onTouchStart: (e: React.TouchEvent) => {
      handleTouchStart();

      // Call original handler if it exists
      if (children.props.onTouchStart) {
        children.props.onTouchStart(e);
      }
    },
  });

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(enterTimeoutRef.current);
      clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  // Update position if props change that would affect layout
  useEffect(() => {
    if (visible) {
      updatePosition();
    }
  }, [visible, placement, title]);

  // Don't render anything if disabled or no title
  if (disabled || !title) {
    return children;
  }

  // Calculate animated style
  const animatedStyle: React.CSSProperties = {
    opacity: animatedValues.opacity,
    transform: `translateY(${animatedValues.translateY}px) scale(${animatedValues.scale})`,
  };

  // Render portal only if isRendered is true
  return (
    <>
      {trigger}
      {isRendered && ReactDOM.createPortal(
        <TooltipContent
          ref={node => {
            tooltipRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLDivElement>).current = node!;
            }
          }}
          className={className}
          style={{
            top: position.top,
            left: position.left,
            ...animatedStyle,
          }}
          $variant={variant}
          $color={color}
          $maxWidth={maxWidth}
          $placement={placement}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          role="tooltip"
          {...rest}
        >
          {title}
          {arrow && (
            <TooltipArrow
              className={arrowClass}
              style={{
                top: arrowPosition.top,
                left: arrowPosition.left,
              }}
              $variant={variant}
              $color={color}
            />
          )}
        </TooltipContent>,
        document.body
      )}
    </>
  );
});

Tooltip.displayName = 'Tooltip';

/**
 * GlassTooltip Component
 *
 * A tooltip component with glass morphism styling.
 */
export const GlassTooltip = forwardRef<HTMLDivElement, TooltipProps>((props, ref) => {
  const { className, variant = 'glass', ...rest } = props;

  return (
    <Tooltip ref={ref} className={`glass-tooltip ${className || ''}`} variant={variant} {...rest} />
  );
});

GlassTooltip.displayName = 'GlassTooltip';
