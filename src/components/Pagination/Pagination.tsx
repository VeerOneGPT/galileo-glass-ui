import React, { forwardRef, useState, useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { usePhysicsInteraction, PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AnimationProps } from '../../animations/types';

// Calculate the range of pages to display
const getPageRange = (
  currentPage: number,
  totalPages: number,
  boundaryCount: number,
  siblingCount: number
): (number | 'ellipsis')[] => {
  // Always include first and last pages
  const startPages = Array.from({ length: boundaryCount }, (_, i) => i + 1);
  const endPages = Array.from(
    { length: boundaryCount },
    (_, i) => totalPages - boundaryCount + i + 1
  ).filter(page => page > 0);

  // Calculate sibling pages around current page
  const siblingStart = Math.max(currentPage - siblingCount, boundaryCount + 1);
  const siblingEnd = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

  // Build final page range
  const range: (number | 'ellipsis')[] = [];

  // Add start pages
  range.push(...startPages);

  // Add ellipsis if needed
  if (siblingStart > boundaryCount + 1) {
    range.push('ellipsis');
  }

  // Add sibling pages around current page
  for (let i = siblingStart; i <= siblingEnd; i++) {
    if (i > boundaryCount && i <= totalPages - boundaryCount) {
      range.push(i);
    }
  }

  // Add ellipsis if needed
  if (siblingEnd < totalPages - boundaryCount) {
    range.push('ellipsis');
  }

  // Add end pages
  range.push(...endPages);

  // Remove duplicates and sort
  return [...new Set(range)].sort((a, b) => {
    if (a === 'ellipsis') return 0;
    if (b === 'ellipsis') return 0;
    return a - b;
  });
};

// Pagination props interface
export interface PaginationProps extends AnimationProps {
  /**
   * The total number of pages
   */
  count: number;

  /**
   * The current page
   */
  page?: number;

  /**
   * Default page value for uncontrolled component
   */
  defaultPage?: number;

  /**
   * Callback fired when the page changes
   */
  onChange?: (event: React.ChangeEvent<unknown>, page: number) => void;

  /**
   * If true, the component is disabled
   */
  disabled?: boolean;

  /**
   * The shape of the pagination items
   */
  shape?: 'circular' | 'rounded' | 'square';

  /**
   * The size of the pagination items
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * The variant of the pagination
   */
  variant?: 'text' | 'outlined' | 'contained';

  /**
   * The color of the pagination
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

  /**
   * If true, show first and last page buttons
   */
  showFirstButton?: boolean;

  /**
   * If true, show previous and next page buttons
   */
  showPrevNextButtons?: boolean;

  /**
   * The number of boundary pages to show
   */
  boundaryCount?: number;

  /**
   * The number of sibling pages on either side of current page
   */
  siblingCount?: number;

  /**
   * CSS class applied to the root element
   */
  className?: string;
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
      return '#6366F1';
  }
};

// Styled components
const PaginationContainer = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const PaginationList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const PaginationButton = styled.button<{
  $current: boolean;
  $disabled: boolean;
  $shape: 'circular' | 'rounded' | 'square';
  $size: 'small' | 'medium' | 'large';
  $variant: 'text' | 'outlined' | 'contained';
  $color: string;
  $isEllipsis?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  border: ${props =>
    props.$variant === 'outlined'
      ? `1px solid ${props.$current ? getColorByName(props.$color) : 'rgba(0, 0, 0, 0.23)'}`
      : 'none'};
  background-color: ${props => {
    if (props.$variant === 'contained') {
      return props.$current ? getColorByName(props.$color) : 'rgba(0, 0, 0, 0.08)';
    }
    return 'transparent';
  }};
  color: ${props => {
    if (props.$variant === 'contained' && props.$current) {
      return '#fff';
    }
    return props.$current ? getColorByName(props.$color) : 'rgba(0, 0, 0, 0.87)';
  }};
  cursor: ${props => {
    if (props.$disabled || props.$isEllipsis) return 'not-allowed';
    return props.$current ? 'default' : 'pointer';
  }};
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  outline: 0;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  font-family: 'Inter', sans-serif;
  font-weight: ${props => (props.$current ? 600 : 400)};
  will-change: transform;

  /* Size styles */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          min-width: 28px;
          height: 28px;
          font-size: 0.8125rem;
        `;
      case 'large':
        return `
          min-width: 40px;
          height: 40px;
          font-size: 0.9375rem;
        `;
      default: // medium
        return `
          min-width: 32px;
          height: 32px;
          font-size: 0.875rem;
        `;
    }
  }}

  /* Shape styles */
  ${props => {
    switch (props.$shape) {
      case 'circular':
        return 'border-radius: 50%;';
      case 'rounded':
        return 'border-radius: 8px;';
      default: // square
        return 'border-radius: 4px;';
    }
  }}
  
  /* Glass effect for current page button */
  ${props =>
    props.$current &&
    !props.$disabled &&
    glassSurface({
      elevation: 1,
      blurStrength: 'minimal',
      backgroundOpacity: props.$variant === 'contained' ? 'strong' : 'subtle',
      borderOpacity: 'medium',
      themeContext: createThemeContext({}),
    })}
  
  /* Glass glow for current page button */
  ${props =>
    props.$current &&
    !props.$disabled &&
    glassGlow({
      intensity: 'low',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Focus styles - Keep box-shadow */
  &:focus-visible {
    ${props =>
      !props.$disabled &&
      !props.$isEllipsis &&
      `
      box-shadow: 0 0 0 3px ${getColorByName(props.$color)}40;
    `}
  }
`;

const PaginationItem = styled.li`
  margin: 0;
`;

// --- Interactable Button Wrapper ---
interface InteractableButtonProps {
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  current?: boolean;
  isEllipsis?: boolean;
  shape: 'circular' | 'rounded' | 'square';
  size: 'small' | 'medium' | 'large';
  variant: 'text' | 'outlined' | 'contained';
  color: string;
  animationConfig: Partial<PhysicsInteractionOptions>;
  reducedMotion: boolean;
  ariaLabel?: string;
  // Any other props needed by PaginationButton
}

const InteractablePaginationButton: React.FC<InteractableButtonProps> = ({
  children,
  onClick,
  disabled = false,
  current = false,
  isEllipsis = false,
  shape,
  size,
  variant,
  color,
  animationConfig,
  reducedMotion,
  ariaLabel,
  ...rest // Pass rest to PaginationButton
}) => {
  const { style: physicsStyle, eventHandlers } = usePhysicsInteraction<HTMLButtonElement>({
    ...animationConfig,
    reducedMotion: reducedMotion || disabled || current || isEllipsis, // Disable physics for disabled/current/ellipsis
  });

  return (
    <PaginationButton
      onClick={onClick}
      disabled={disabled}
      $current={current}
      $disabled={disabled}
      $shape={shape}
      $size={size}
      $variant={variant}
      $color={color}
      $isEllipsis={isEllipsis}
      aria-label={ariaLabel}
      style={physicsStyle} // Apply physics style
      {...eventHandlers} // Apply physics handlers
      {...rest} // Spread other props
    >
      {children}
    </PaginationButton>
  );
};
// --- End Interactable Button Wrapper ---

/**
 * Pagination Component
 *
 * A component for navigating through paged content.
 */
export const Pagination = forwardRef<HTMLDivElement, PaginationProps>((props, ref) => {
  const {
    count,
    page,
    defaultPage = 1,
    onChange,
    disabled = false,
    shape = 'circular',
    size = 'medium',
    variant = 'text',
    color = 'primary',
    showFirstButton = false,
    showPrevNextButtons = true,
    boundaryCount = 1,
    siblingCount = 1,
    className,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  // State for controlled/uncontrolled component
  const [currentPage, setCurrentPage] = useState(page ?? defaultPage);
  const { defaultSpring, disableAnimation: contextDisableAnimation } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion(); // Use hook directly
  const finalDisableAnimation = (disableAnimation ?? contextDisableAnimation ?? prefersReducedMotion) || disabled;

  // Update currentPage when page prop changes
  useEffect(() => {
    if (page !== undefined) {
      setCurrentPage(page);
    }
  }, [page]);

  // Calculate final spring config for buttons
  const finalPressConfig = useMemo<Partial<PhysicsInteractionOptions>>(() => {
      // Define base spring parameters from a default preset
      const basePreset = SpringPresets.DEFAULT;
      const baseOptions: Partial<PhysicsInteractionOptions> = {
        affectsScale: true,    // Enable scaling
        scaleAmplitude: 0.05, // Control scale amount (adjust as needed)
        stiffness: basePreset.tension,
        dampingRatio: basePreset.friction ? basePreset.friction / (2 * Math.sqrt(basePreset.tension)) : 0.5, // Calculate dampingRatio
        mass: basePreset.mass,
        // Removed scaleOnPress and scaleOnHover, use affectsScale/scaleAmplitude
      };

      // Resolve context spring config
      let contextResolvedConfig: Partial<SpringConfig> = {};
      if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
          contextResolvedConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
      } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
          contextResolvedConfig = defaultSpring;
      }

      // Resolve prop spring config
      let propResolvedConfig: Partial<PhysicsInteractionOptions> = {};
      const configProp = animationConfig;
      if (typeof configProp === 'string' && configProp in SpringPresets) {
          const preset = SpringPresets[configProp as keyof typeof SpringPresets];
          propResolvedConfig = {
            stiffness: preset.tension,
            dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt(preset.tension)) : undefined,
            mass: preset.mass,
          };
      } else if (typeof configProp === 'object' && configProp !== null) {
          // Directly use prop object if it contains valid PhysicsInteractionOptions
          propResolvedConfig = configProp;
      }
      
      // Merge: Prop > Context > Base
      const finalStiffness = propResolvedConfig.stiffness ?? contextResolvedConfig.tension ?? baseOptions.stiffness;
      const finalFriction = propResolvedConfig.dampingRatio !== undefined 
          ? propResolvedConfig.dampingRatio * 2 * Math.sqrt(finalStiffness ?? 100) // Convert dampingRatio back to friction approx.
          : contextResolvedConfig.friction ?? basePreset.friction; 
      const finalMass = propResolvedConfig.mass ?? contextResolvedConfig.mass ?? baseOptions.mass;
      
      // Recalculate dampingRatio based on final values
      const finalDampingRatio = finalFriction && finalStiffness && finalStiffness > 0 
        ? finalFriction / (2 * Math.sqrt(finalStiffness))
        : 0.5; // Default damping ratio if calculation isn't possible

      return {
          ...baseOptions, // Start with base scale/interaction settings
          stiffness: finalStiffness,
          dampingRatio: finalDampingRatio, // Use calculated final damping ratio
          mass: finalMass,
          // Merge any other valid PhysicsInteractionOptions from propResolvedConfig
          ...(propResolvedConfig.strength && { strength: propResolvedConfig.strength }),
          ...(propResolvedConfig.radius && { radius: propResolvedConfig.radius }),
          ...(propResolvedConfig.affectsRotation !== undefined && { affectsRotation: propResolvedConfig.affectsRotation }),
          ...(propResolvedConfig.affectsScale !== undefined && { affectsScale: propResolvedConfig.affectsScale }),
          ...(propResolvedConfig.rotationAmplitude !== undefined && { rotationAmplitude: propResolvedConfig.rotationAmplitude }),
          ...(propResolvedConfig.scaleAmplitude !== undefined && { scaleAmplitude: propResolvedConfig.scaleAmplitude }),
          // Ensure no 'config' property is present
      };
  }, [defaultSpring, animationConfig]);

  // Handle page changes
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, targetPage: number) => {
    if (disabled) return;

    // Ensure page is within valid range
    const validPage = Math.max(1, Math.min(targetPage, count));

    // Update uncontrolled state
    if (page === undefined) {
      setCurrentPage(validPage);
    }

    // Call onChange handler if provided
    if (onChange) {
      onChange(event as unknown as React.ChangeEvent<unknown>, validPage);
    }
  };

  // Calculate page range
  const pageRange = useMemo(() => {
    return getPageRange(currentPage, count, boundaryCount, siblingCount);
  }, [currentPage, count, boundaryCount, siblingCount]);

  return (
    <PaginationContainer ref={ref} className={className} {...rest}>
      <PaginationList>
        {/* First Page Button */}
        {showFirstButton && (
          <PaginationItem key="first">
            <InteractablePaginationButton
              onClick={(e) => handleClick(e, 1)}
              disabled={disabled || currentPage === 1}
              shape={shape}
              size={size}
              variant={variant}
              color={color}
              animationConfig={finalPressConfig}
              reducedMotion={finalDisableAnimation}
              ariaLabel="Go to first page"
            >
              {'<<'}
            </InteractablePaginationButton>
          </PaginationItem>
        )}
        {/* Previous Page Button */}
        {showPrevNextButtons && (
          <PaginationItem key="prev">
            <InteractablePaginationButton
              onClick={(e) => handleClick(e, currentPage - 1)}
              disabled={disabled || currentPage === 1}
              shape={shape}
              size={size}
              variant={variant}
              color={color}
              animationConfig={finalPressConfig}
              reducedMotion={finalDisableAnimation}
              ariaLabel="Go to previous page"
            >
              {'<'}
            </InteractablePaginationButton>
          </PaginationItem>
        )}
        {/* Page Number Buttons */}
        {pageRange.map((pageNum, index) => (
          <PaginationItem key={`${pageNum}-${index}`}>
            {pageNum === 'ellipsis' ? (
              <InteractablePaginationButton
                disabled={true} // Ellipsis is not interactive
                isEllipsis={true}
                shape={shape}
                size={size}
                variant={variant}
                color={color}
                animationConfig={finalPressConfig} // Still pass config, reducedMotion handles disabling
                reducedMotion={true} // Always disable physics for ellipsis
                onClick={() => {}} // No-op click
              >
                ...
              </InteractablePaginationButton>
            ) : (
              <InteractablePaginationButton
                onClick={(e) => handleClick(e, pageNum)}
                disabled={disabled}
                current={currentPage === pageNum}
                shape={shape}
                size={size}
                variant={variant}
                color={color}
                animationConfig={finalPressConfig}
                reducedMotion={finalDisableAnimation}
                ariaLabel={`Go to page ${pageNum}`}
              >
                {pageNum}
              </InteractablePaginationButton>
            )}
          </PaginationItem>
        ))}
        {/* Next Page Button */}
        {showPrevNextButtons && (
          <PaginationItem key="next">
            <InteractablePaginationButton
              onClick={(e) => handleClick(e, currentPage + 1)}
              disabled={disabled || currentPage === count}
              shape={shape}
              size={size}
              variant={variant}
              color={color}
              animationConfig={finalPressConfig}
              reducedMotion={finalDisableAnimation}
              ariaLabel="Go to next page"
            >
              {'>'}
            </InteractablePaginationButton>
          </PaginationItem>
        )}
        {/* Last Page Button */}
        {showFirstButton && (
          <PaginationItem key="last">
            <InteractablePaginationButton
              onClick={(e) => handleClick(e, count)}
              disabled={disabled || currentPage === count}
              shape={shape}
              size={size}
              variant={variant}
              color={color}
              animationConfig={finalPressConfig}
              reducedMotion={finalDisableAnimation}
              ariaLabel="Go to last page"
            >
              {'>>'}
            </InteractablePaginationButton>
          </PaginationItem>
        )}
      </PaginationList>
    </PaginationContainer>
  );
});

Pagination.displayName = 'Pagination';

/**
 * GlassPagination Component
 *
 * A pagination component with glass morphism styling.
 */
export const GlassPagination = forwardRef<HTMLDivElement, PaginationProps>((props, ref) => {
  const { className, variant = 'contained', ...rest } = props;

  return (
    <Pagination
      ref={ref}
      className={`glass-pagination ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassPagination.displayName = 'GlassPagination';
