import React, { forwardRef } from "react";
import styled from "styled-components";
import { Card } from "../Card/Card";
import { glassSurface } from "../../core/mixins/glassSurface";
import { createThemeContext } from "../../core/themeContext";

// Enhanced glass card with 3D effects and dynamic lighting
const EnhancedLinkCard = styled.div`
  transform-style: preserve-3d;
  transition: all 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  
  &:hover {
    transform: translateY(-8px) scale(1.01) perspective(1000px) rotateX(2deg);
    box-shadow: 
      0 20px 30px -10px rgba(0, 0, 0, 0.3),
      0 0 15px rgba(120, 120, 255, 0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 80%
    );
    z-index: 1;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

// Enhanced icon container with glow
const EnhancedIconContainer = styled.div`
  position: relative;
  transition: all 0.3s ease-out;
  z-index: 2;
  
  &::after {
    content: '';
    position: absolute;
    inset: -10px;
    border-radius: 8px;
    background: radial-gradient(
      circle,
      rgba(100, 100, 255, 0.15) 0%,
      transparent 70%
    );
    opacity: 0;
    z-index: -1;
    transition: opacity 0.4s ease;
  }
  
  a:hover & {
    transform: translateY(-5px) scale(1.05);
  }
  
  a:hover &::after {
    opacity: 1;
  }
`;

// Enhanced arrow animation
const FloatingArrow = styled.div`
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  
  svg {
    width: 16px;
    height: 16px;
    margin-left: 4px;
  }
  
  a:hover & {
    transform: translateX(6px);
  }
`;

// Component containers for content sections
const CardHeader = styled.div`
  padding: 1rem 0;
`;

const CardContent = styled.div`
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 1rem;
`;

const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// Styled link wrapper
const LinkWrapper = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
`;

export interface GlassCardLinkProps {
  /** Icon to display in the card */
  icon?: React.ReactNode;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** URL to navigate to when clicked */
  link: string;
  /** Button text for the call to action */
  buttonText?: string;
  /** Additional class name */
  className?: string;
  /** Custom content to display in the card */
  customPreview?: React.ReactNode;
  /** Glass variant styling */
  glassVariant?: 'clear' | 'frosted' | 'tinted' | 'luminous';
  /** Click handler (optional - will use link navigation if not provided) */
  onClick?: (e: React.MouseEvent) => void;
  /** Optional children to render instead of default content */
  children?: React.ReactNode;
}

/**
 * GlassCardLink Component
 * 
 * An enhanced card with 3D transform effects and link functionality.
 * Features physics-inspired animations and intuitive hover states.
 */
export const GlassCardLink = forwardRef<HTMLAnchorElement, GlassCardLinkProps>(({
  icon,
  title,
  description,
  link,
  buttonText = "Learn more",
  className = "",
  customPreview,
  glassVariant = "frosted",
  onClick,
  children
}, ref) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      // Prevent default only if custom handler is provided
      e.preventDefault();
    }
  };

  const ArrowIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );

  // Render card content
  const renderCardContent = () => {
    if (children) return children;

    return (
      <>
        <CardHeader>
          {icon && (
            <EnhancedIconContainer className="card-icon-container">
              {icon}
            </EnhancedIconContainer>
          )}
        </CardHeader>

        <CardContent>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          
          {customPreview && (
            <div className="custom-preview-container">
              {customPreview}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className="card-link-action">
            <FloatingArrow>
              {buttonText}
              <ArrowIcon />
            </FloatingArrow>
          </div>
        </CardFooter>
      </>
    );
  };

  // Wrap the card in a link if no custom handler
  return (
    <LinkWrapper 
      ref={ref}
      href={link}
      className={`glass-card-link-wrapper ${className}`}
      onClick={handleClick}
    >
      <EnhancedLinkCard className={`glass-card-link ${glassVariant}`}>
        {renderCardContent()}
      </EnhancedLinkCard>
    </LinkWrapper>
  );
});

GlassCardLink.displayName = 'GlassCardLink';

export default GlassCardLink; 