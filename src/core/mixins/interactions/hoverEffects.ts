/**
 * Hover Effects Mixin
 *
 * Creates hover state effects for components
 */
import { css } from 'styled-components';

import { withAlpha } from '../../colorUtils';
import { cssWithKebabProps } from '../../cssUtils';

/**
 * Hover effects options
 */
export interface HoverEffectsOptions {
  /**
   * Hover effect type
   */
  type?: 'glow' | 'lift' | 'scale' | 'highlight' | 'brighten' | 'border' | 'custom';

  /**
   * Color to use for the hover effect
   */
  color?: string;

  /**
   * Intensity of the effect (0-1)
   */
  intensity?: 'subtle' | 'light' | 'medium' | 'strong' | number;

  /**
   * If true, the effect will be animated
   */
  animated?: boolean;

  /**
   * Duration of the animation in seconds
   */
  duration?: number;

  /**
   * For scale and lift effects, the amount of scale/lift
   */
  amount?: 'small' | 'medium' | 'large' | number;

  /**
   * For custom hover type, a custom CSS snippet
   */
  customCss?: string;

  /**
   * If true, reduces motion for accessibility
   */
  reducedMotion?: boolean;

  /**
   * Transition timing function
   */
  easing?: string;

  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Get intensity value
 */
const getIntensityValue = (
  intensity?: 'subtle' | 'light' | 'medium' | 'strong' | number
): number => {
  if (typeof intensity === 'number') return Math.min(Math.max(intensity, 0), 1);

  switch (intensity) {
    case 'subtle':
      return 0.2;
    case 'light':
      return 0.4;
    case 'medium':
      return 0.6;
    case 'strong':
      return 0.8;
    default:
      return 0.4;
  }
};

/**
 * Get amount value
 */
const getAmountValue = (amount?: 'small' | 'medium' | 'large' | number): number => {
  if (typeof amount === 'number') return amount;

  switch (amount) {
    case 'small':
      return 0.02;
    case 'medium':
      return 0.05;
    case 'large':
      return 0.1;
    default:
      return 0.05;
  }
};

/**
 * Creates a hover effect
 */
export const hoverEffects = (options: HoverEffectsOptions) => {
  const {
    type = 'glow',
    color,
    intensity = 'medium',
    animated = true,
    duration = 0.2,
    amount = 'medium',
    customCss,
    reducedMotion = false,
    easing = 'ease',
    themeContext,
  } = options;

  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;

  // Determine hover color
  const hoverColor = color || (isDarkMode ? '#5b6ecc' : '#3b82f6');

  // Get intensity value
  const intensityValue = getIntensityValue(intensity);

  // Get amount value
  const amountValue = getAmountValue(amount);

  // Create animation styles
  const transitionStyle = animated ? `transition: all ${duration}s ${easing};` : '';

  // Build the hover effect based on type
  let hoverStyle = '';

  switch (type) {
    case 'glow':
      hoverStyle = `
        ${transitionStyle}
        
        &:hover {
          box-shadow: 0 0 ${intensityValue * 15}px ${withAlpha(hoverColor, intensityValue * 0.7)};
        }
      `;
      break;

    case 'lift':
      if (reducedMotion) {
        // Use a non-motion alternative
        hoverStyle = `
          ${transitionStyle}
          
          &:hover {
            box-shadow: 0 ${intensityValue * 8}px ${intensityValue * 16}px ${withAlpha(
          '#000000',
          intensityValue * 0.3
        )};
          }
        `;
      } else {
        hoverStyle = `
          ${transitionStyle}
          
          &:hover {
            transform: translateY(-${amountValue * 20}px);
            box-shadow: 0 ${intensityValue * 8}px ${intensityValue * 16}px ${withAlpha(
          '#000000',
          intensityValue * 0.3
        )};
          }
        `;
      }
      break;

    case 'scale':
      if (reducedMotion) {
        // Use a non-motion alternative
        hoverStyle = `
          ${transitionStyle}
          
          &:hover {
            box-shadow: 0 0 0 ${amountValue * 10}px ${withAlpha(hoverColor, intensityValue * 0.2)};
          }
        `;
      } else {
        hoverStyle = `
          ${transitionStyle}
          
          &:hover {
            transform: scale(${1 + amountValue});
          }
        `;
      }
      break;

    case 'highlight':
      hoverStyle = `
        ${transitionStyle}
        
        &:hover {
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, ${withAlpha(
              hoverColor,
              intensityValue * 0.3
            )}, transparent 60%);
            border-radius: inherit;
            pointer-events: none;
          }
        }
      `;
      break;

    case 'brighten':
      hoverStyle = `
        ${transitionStyle}
        
        &:hover {
          filter: brightness(${1 + intensityValue * 0.3});
          background-color: ${withAlpha(hoverColor, intensityValue * 0.1)};
        }
      `;
      break;

    case 'border':
      hoverStyle = `
        ${transitionStyle}
        
        &:hover {
          border-color: ${withAlpha(hoverColor, intensityValue)};
        }
      `;
      break;

    case 'custom':
      hoverStyle = `
        ${transitionStyle}
        
        &:hover {
          ${customCss || ''}
        }
      `;
      break;

    default:
      hoverStyle = `
        ${transitionStyle}
        
        &:hover {
          box-shadow: 0 0 ${intensityValue * 15}px ${withAlpha(hoverColor, intensityValue * 0.7)};
        }
      `;
      break;
  }

  // Build the complete CSS
  return cssWithKebabProps`
    position: relative;
    ${hoverStyle}
  `;
};

export default hoverEffects;
