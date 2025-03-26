/**
 * Link Component
 *
 * A styled anchor element with glass effects
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { cssWithKebabProps } from '../../core/cssUtils';
import { createThemeContext } from '../../core/themeUtils';

/**
 * Link props
 */
export interface LinkProps {
  /**
   * The URL the link points to
   */
  href?: string;

  /**
   * The color of the link
   */
  color?: 'primary' | 'secondary' | 'inherit' | string;

  /**
   * The variant of the link
   */
  variant?: 'text' | 'button' | 'outline';

  /**
   * If true, the link will have an underline only on hover
   */
  underlineOnHover?: boolean;

  /**
   * If true, the link will have glass effects applied
   */
  glass?: boolean;

  /**
   * If true, the link will open in a new tab
   */
  external?: boolean;

  /**
   * If true, the link is disabled
   */
  disabled?: boolean;

  /**
   * Additional component alignment configuration
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Size of the link
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Font weight of the link
   */
  weight?: 'normal' | 'medium' | 'bold';

  /**
   * If true, the link will have a subtle animation on hover
   */
  animated?: boolean;

  /**
   * If true, the component will have focus visible styles
   */
  focusVisible?: boolean;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * CSS inline style
   */
  style?: React.CSSProperties;

  /**
   * Component children
   */
  children?: React.ReactNode;

  /**
   * Handler for click events
   */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;

  /**
   * Additional HTML attributes
   */
  [key: string]: any;
}

/**
 * Get font size based on size prop
 */
const getFontSize = (size?: 'small' | 'medium' | 'large'): string => {
  if (size === 'small') return '0.875rem';
  if (size === 'large') return '1.125rem';
  return '1rem';
};

/**
 * Get font weight based on weight prop
 */
const getFontWeight = (weight?: 'normal' | 'medium' | 'bold'): number => {
  if (weight === 'medium') return 500;
  if (weight === 'bold') return 700;
  return 400;
};

/**
 * Get color based on color prop and theme
 */
const getColor = (color: string | undefined, isDarkMode: boolean): string => {
  if (!color || color === 'inherit') return 'inherit';
  if (color === 'primary') return isDarkMode ? '#90caf9' : '#1976d2';
  if (color === 'secondary') return isDarkMode ? '#ce93d8' : '#9c27b0';
  return color;
};

/**
 * Styled link component
 */
const LinkRoot = styled.a<LinkProps & { theme: any }>`
  ${props => {
    const isDarkMode = props.theme?.palette?.mode === 'dark' || false;
    const color = getColor(props.color, isDarkMode);
    const fontSize = getFontSize(props.size);
    const fontWeight = getFontWeight(props.weight);

    return cssWithKebabProps`
      margin: 0;
      color: ${color};
      font-size: ${fontSize};
      font-weight: ${fontWeight};
      text-decoration: ${props.underlineOnHover ? 'none' : 'underline'};
      cursor: ${props.disabled ? 'default' : 'pointer'};
      display: inline-flex;
      align-items: center;
      justify-content: ${
        props.align === 'center' ? 'center' : props.align === 'right' ? 'flex-end' : 'flex-start'
      };
      opacity: ${props.disabled ? 0.5 : 1};
      pointer-events: ${props.disabled ? 'none' : 'auto'};
      position: relative;
      transition: all 0.2s ease-in-out;
      
      /* Glass effect for button and outline variants */
      ${
        props.glass && props.variant !== 'text'
          ? `
        padding: ${props.variant === 'button' ? '0.5rem 1rem' : '0.4rem 0.8rem'};
        border-radius: 4px;
        
        ${
          props.variant === 'button'
            ? `
          background-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'};
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        `
            : props.variant === 'outline'
            ? `
          background-color: transparent;
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)'};
        `
            : ''
        }
      `
          : ''
      }
      
      /* Default text variant with no glass effect */
      ${
        (props.variant === 'text' || !props.variant) && !props.glass
          ? `
        padding: 0;
        background-color: transparent;
        border: none;
      `
          : ''
      }
      
      /* Focus styles */
      &:focus {
        outline: none;
        ${
          props.focusVisible
            ? `
          box-shadow: 0 0 0 3px ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 4px;
        `
            : ''
        }
      }
      
      /* Hover styles */
      &:hover {
        ${props.underlineOnHover ? 'text-decoration: underline;' : ''}
        ${
          props.animated
            ? `
          transform: translateY(-2px);
          ${
            props.glass && props.variant === 'button'
              ? `
            box-shadow: 0 4px 12px ${
              isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
            };
          `
              : ''
          }
        `
            : ''
        }
        
        ${
          props.variant === 'button' && props.glass
            ? `
          background-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
        `
            : props.variant === 'outline' && props.glass
            ? `
          background-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'};
        `
            : ''
        }
      }
      
      /* Active styles */
      &:active {
        ${props.animated ? 'transform: translateY(0);' : ''}
        ${
          props.glass && props.variant === 'button'
            ? `
          box-shadow: 0 1px 3px ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
        `
            : ''
        }
      }
      
      /* Custom icon spacing if children include icons (assumed to be the first or last child) */
      & > svg {
        ${
          props.variant === 'text'
            ? `
          margin-right: ${props.children && typeof props.children !== 'string' ? '0.5rem' : '0'};
        `
            : `
          margin-right: ${props.children && typeof props.children !== 'string' ? '0.5rem' : '0'};
        `
        }
      }
      
      /* External link indicator */
      ${
        props.external
          ? `
        &::after {
          content: '↗';
          font-size: 0.8em;
          margin-left: 0.3em;
          vertical-align: super;
        }
      `
          : ''
      }
    `;
  }}
`;

/**
 * Link component implementation
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const {
    href = '#',
    color = 'primary',
    variant = 'text',
    underlineOnHover = true,
    glass = false,
    external = false,
    disabled = false,
    align,
    size = 'medium',
    weight = 'normal',
    animated = true,
    focusVisible = true,
    className,
    style,
    children,
    onClick,
    ...rest
  } = props;

  // Additional props for external links
  const externalProps = external
    ? {
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {};

  return (
    <LinkRoot
      ref={ref}
      href={disabled ? undefined : href}
      color={color}
      variant={variant}
      underlineOnHover={underlineOnHover}
      glass={glass}
      external={external}
      disabled={disabled}
      align={align}
      size={size}
      weight={weight}
      animated={animated}
      focusVisible={focusVisible}
      className={className}
      style={style}
      onClick={disabled ? undefined : onClick}
      {...externalProps}
      {...rest}
    >
      {children}
    </LinkRoot>
  );
});

export default Link;
