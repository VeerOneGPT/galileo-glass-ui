/**
 * Visual Feedback Mixin
 *
 * Creates visual feedback for better accessibility
 */
import { css } from 'styled-components';

import { withAlpha } from '../../colorUtils';
import { cssWithKebabProps } from '../../cssUtils';

/**
 * Visual feedback options
 */
export interface VisualFeedbackOptions {
  /**
   * Type of visual feedback
   */
  type?: 'hover' | 'active' | 'focus' | 'loading' | 'success' | 'error' | 'warning' | 'custom';

  /**
   * Intensity of the feedback effect
   */
  intensity?: 'subtle' | 'light' | 'medium' | 'strong' | number;

  /**
   * Color of the feedback effect
   */
  color?: string;

  /**
   * If true, the feedback will be animated
   */
  animated?: boolean;

  /**
   * Duration of the animation in seconds
   */
  duration?: number;

  /**
   * If true, includes a secondary indicator for colorblind users
   */
  colorblindFriendly?: boolean;

  /**
   * For 'loading' type, the style of loading indicator
   */
  loadingStyle?: 'pulse' | 'spinner' | 'dots' | 'progress';

  /**
   * For custom type, a custom CSS snippet
   */
  customCss?: string;

  /**
   * If true, reduces motion for accessibility
   */
  reducedMotion?: boolean;

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
 * Creates visual feedback styles
 */
export const visualFeedback = (options: VisualFeedbackOptions) => {
  const {
    type = 'hover',
    intensity = 'medium',
    color,
    animated = true,
    duration = 0.2,
    colorblindFriendly = true,
    loadingStyle = 'pulse',
    customCss,
    reducedMotion = false,
    themeContext,
  } = options;

  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;

  // Get intensity value
  const intensityValue = getIntensityValue(intensity);

  // Determine color based on feedback type and theme
  let feedbackColor = color;
  if (!feedbackColor) {
    switch (type) {
      case 'hover':
        feedbackColor = isDarkMode ? '#90caf9' : '#2196f3';
        break;
      case 'active':
        feedbackColor = isDarkMode ? '#42a5f5' : '#1976d2';
        break;
      case 'focus':
        feedbackColor = isDarkMode ? '#90caf9' : '#2196f3';
        break;
      case 'loading':
        feedbackColor = isDarkMode ? '#90caf9' : '#2196f3';
        break;
      case 'success':
        feedbackColor = isDarkMode ? '#66bb6a' : '#4caf50';
        break;
      case 'error':
        feedbackColor = isDarkMode ? '#f44336' : '#d32f2f';
        break;
      case 'warning':
        feedbackColor = isDarkMode ? '#ffa726' : '#ff9800';
        break;
      default:
        feedbackColor = isDarkMode ? '#90caf9' : '#2196f3';
    }
  }

  // Build feedback styles based on type
  let feedbackStyles = '';

  switch (type) {
    case 'hover':
      feedbackStyles = `
        position: relative;
        
        &:hover {
          ${
            colorblindFriendly
              ? `
            &::before {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              border: 1px solid ${withAlpha(feedbackColor, intensityValue)};
              border-radius: inherit;
              pointer-events: none;
              opacity: 0.8;
            }
          `
              : ''
          }
          
          border-color: ${withAlpha(feedbackColor, intensityValue * 0.8)};
          background-color: ${withAlpha(feedbackColor, intensityValue * 0.2)};
          
          ${
            animated
              ? `
            transition: all ${duration}s ease;
          `
              : ''
          }
        }
      `;
      break;

    case 'active':
      feedbackStyles = `
        position: relative;
        
        &:active {
          ${
            colorblindFriendly
              ? `
            &::before {
              content: '';
              position: absolute;
              top: -1px;
              left: -1px;
              right: -1px;
              bottom: -1px;
              border: 2px solid ${withAlpha(feedbackColor, intensityValue)};
              border-radius: inherit;
              pointer-events: none;
              opacity: 0.9;
            }
          `
              : ''
          }
          
          background-color: ${withAlpha(feedbackColor, intensityValue * 0.3)};
          
          ${
            reducedMotion
              ? ''
              : `
            transform: scale(0.98);
          `
          }
          
          ${
            animated
              ? `
            transition: all ${duration}s ease;
          `
              : ''
          }
        }
      `;
      break;

    case 'focus':
      feedbackStyles = `
        position: relative;
        
        &:focus-visible {
          outline: none;
          
          ${
            colorblindFriendly
              ? `
            &::before {
              content: '';
              position: absolute;
              top: -3px;
              left: -3px;
              right: -3px;
              bottom: -3px;
              border: 2px solid ${withAlpha(feedbackColor, intensityValue)};
              border-radius: inherit;
              pointer-events: none;
            }
          `
              : ''
          }
          
          box-shadow: 0 0 0 2px ${withAlpha(feedbackColor, intensityValue * 0.7)};
          
          ${
            animated
              ? `
            transition: box-shadow ${duration}s ease;
          `
              : ''
          }
        }
      `;
      break;

    case 'loading':
      // Different loading animations based on style and reduced motion preference
      let loadingAnimation = '';

      if (reducedMotion) {
        // Simplified animations for reduced motion
        loadingAnimation = `
          opacity: 0.7;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${withAlpha(feedbackColor, intensityValue * 0.2)};
            border-radius: inherit;
          }
          
          &::after {
            content: '...';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: ${withAlpha(feedbackColor, intensityValue)};
          }
        `;
      } else {
        // Full animations based on loading style
        switch (loadingStyle) {
          case 'pulse':
            loadingAnimation = `
              animation: pulse-feedback ${duration * 4}s infinite ease-in-out;
              
              @keyframes pulse-feedback {
                0%, 100% {
                  opacity: 0.7;
                  background-color: ${withAlpha(feedbackColor, intensityValue * 0.1)};
                }
                50% {
                  opacity: 0.9;
                  background-color: ${withAlpha(feedbackColor, intensityValue * 0.3)};
                }
              }
            `;
            break;

          case 'spinner':
            loadingAnimation = `
              position: relative;
              
              &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin-top: -10px;
                margin-left: -10px;
                border-radius: 50%;
                border: 2px solid ${withAlpha(feedbackColor, intensityValue * 0.3)};
                border-top-color: ${withAlpha(feedbackColor, intensityValue)};
                animation: spinner-feedback ${duration * 4}s infinite linear;
              }
              
              @keyframes spinner-feedback {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `;
            break;

          case 'dots':
            loadingAnimation = `
              position: relative;
              
              &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 30px;
                height: 6px;
                background-image: radial-gradient(
                  circle,
                  ${withAlpha(feedbackColor, intensityValue)} 0%, 
                  ${withAlpha(feedbackColor, intensityValue)} 33%,
                  transparent 33%
                ),
                radial-gradient(
                  circle,
                  ${withAlpha(feedbackColor, intensityValue)} 0%, 
                  ${withAlpha(feedbackColor, intensityValue)} 33%,
                  transparent 33%
                ),
                radial-gradient(
                  circle,
                  ${withAlpha(feedbackColor, intensityValue)} 0%, 
                  ${withAlpha(feedbackColor, intensityValue)} 33%,
                  transparent 33%
                );
                background-size: 6px 6px;
                background-position: 0px center, 12px center, 24px center;
                background-repeat: no-repeat;
                animation: dots-feedback ${duration * 3}s infinite linear;
              }
              
              @keyframes dots-feedback {
                0%, 100% {
                  opacity: 0.3;
                }
                16% {
                  opacity: 1;
                  background-position: 0px center, 12px center, 24px center;
                }
                33% {
                  opacity: 0.3;
                }
                50% {
                  opacity: 1;
                  background-position: 24px center, 0px center, 12px center;
                }
                66% {
                  opacity: 0.3;
                }
                83% {
                  opacity: 1;
                  background-position: 12px center, 24px center, 0px center;
                }
              }
            `;
            break;

          case 'progress':
            loadingAnimation = `
              position: relative;
              overflow: hidden;
              
              &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 2px;
                background-color: ${withAlpha(feedbackColor, intensityValue)};
                animation: progress-feedback ${duration * 5}s infinite ease-in-out;
              }
              
              @keyframes progress-feedback {
                0% {
                  left: 0;
                  width: 0;
                }
                20% {
                  left: 0;
                  width: 100%;
                }
                100% {
                  left: 100%;
                  width: 0;
                }
              }
            `;
            break;

          default:
            loadingAnimation = `
              animation: pulse-feedback ${duration * 4}s infinite ease-in-out;
              
              @keyframes pulse-feedback {
                0%, 100% {
                  opacity: 0.7;
                  background-color: ${withAlpha(feedbackColor, intensityValue * 0.1)};
                }
                50% {
                  opacity: 0.9;
                  background-color: ${withAlpha(feedbackColor, intensityValue * 0.3)};
                }
              }
            `;
        }
      }

      feedbackStyles = `
        position: relative;
        ${loadingAnimation}
        cursor: wait;
      `;
      break;

    case 'success':
      feedbackStyles = `
        position: relative;
        border-color: ${withAlpha(feedbackColor, intensityValue)};
        background-color: ${withAlpha(feedbackColor, intensityValue * 0.1)};
        
        ${
          colorblindFriendly
            ? `
          &::before {
            content: '✓';
            display: inline-block;
            margin-right: 5px;
            color: ${withAlpha(feedbackColor, intensityValue)};
            font-weight: bold;
          }
        `
            : ''
        }
        
        ${
          animated
            ? `
          transition: all ${duration}s ease;
        `
            : ''
        }
      `;
      break;

    case 'error':
      feedbackStyles = `
        position: relative;
        border-color: ${withAlpha(feedbackColor, intensityValue)};
        background-color: ${withAlpha(feedbackColor, intensityValue * 0.1)};
        
        ${
          colorblindFriendly
            ? `
          &::before {
            content: '!';
            display: inline-block;
            margin-right: 5px;
            color: ${withAlpha(feedbackColor, intensityValue)};
            font-weight: bold;
          }
        `
            : ''
        }
        
        ${
          animated && !reducedMotion
            ? `
          animation: shake-feedback 0.6s;
          
          @keyframes shake-feedback {
            0%, 100% {
              transform: translateX(0);
            }
            10%, 30%, 50%, 70%, 90% {
              transform: translateX(-2px);
            }
            20%, 40%, 60%, 80% {
              transform: translateX(2px);
            }
          }
        `
            : ''
        }
      `;
      break;

    case 'warning':
      feedbackStyles = `
        position: relative;
        border-color: ${withAlpha(feedbackColor, intensityValue)};
        background-color: ${withAlpha(feedbackColor, intensityValue * 0.1)};
        
        ${
          colorblindFriendly
            ? `
          &::before {
            content: '⚠';
            display: inline-block;
            margin-right: 5px;
            color: ${withAlpha(feedbackColor, intensityValue)};
          }
        `
            : ''
        }
        
        ${
          animated && !reducedMotion
            ? `
          animation: pulse-warning ${duration * 3}s;
          
          @keyframes pulse-warning {
            0%, 100% {
              background-color: ${withAlpha(feedbackColor, intensityValue * 0.1)};
            }
            50% {
              background-color: ${withAlpha(feedbackColor, intensityValue * 0.3)};
            }
          }
        `
            : ''
        }
      `;
      break;

    case 'custom':
      feedbackStyles = customCss || '';
      break;

    default:
      feedbackStyles = '';
      break;
  }

  // Combine all styles
  return cssWithKebabProps`
    ${feedbackStyles}
  `;
};

export default visualFeedback;
