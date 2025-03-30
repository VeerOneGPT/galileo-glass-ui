import React, { forwardRef, useContext, useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useAnimationContext } from '../../../contexts/AnimationContext';
import type { SpringConfig } from '../../../animations/physics/springPhysics';
import { useMultiSpring } from '../../../animations/physics/useMultiSpring';

import { 
  CarouselSlide, 
  SlideCaption,
  CardContainer,
  CardMedia,
  CardContent,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  CardActions,
  HtmlContent,
  ResponsiveImage,
  VideoContainer
} from './styled';
import { CarouselItem, CardOptions } from '../types';
import { useGlassTheme } from '../../../hooks/useGlassTheme';

// Default interaction spring
const interactionSpringConfig: SpringConfig = {
    tension: 300,
    friction: 20,
    mass: 0.5,
}; 

export interface CarouselSlideItemProps {
  /**
   * Item data for the slide
   */
  item: CarouselItem;
  
  /**
   * Slide index
   */
  index: number;
  
  /**
   * Whether this slide is active
   */
  isActive: boolean;
  
  /**
   * Whether this slide is currently visible
   */
  isVisible: boolean;
  
  /**
   * Color theme for the slide
   */
  color?: string;
  
  /**
   * Glass styling variant
   */
  glassVariant?: string;
  
  /**
   * Custom renderer for slide content
   */
  renderSlide?: (item: CarouselItem, index: number, isActive: boolean) => React.ReactNode;
  
  translateX: number;

  /**
   * Optional inline styles
   */
  style?: React.CSSProperties;
}

// Original animated div is now just a regular div
const SlideContainer = styled.div<CarouselSlideItemProps>`
  position: absolute;
  top: 0;
  // ... existing code ...
`;

/**
 * Renders various content types for carousel slides
 */
const renderContent = (item: CarouselItem, isActive: boolean): React.ReactNode => {
  // Use the item's content if provided
  if (item.content) {
    return item.content;
  }
  
  // Handle different content types
  switch (item.contentType) {
    case 'image':
      if (item.image) {
        return (
          <ResponsiveImage
            $aspectRatio={item.image.aspectRatio}
            $objectFit={item.image.objectFit || (item.image.cover ? 'cover' : 'contain')}
            $objectPosition={item.image.objectPosition || 'center'}
          >
            <img
              src={item.image.src}
              alt={item.image.alt || item.alt || ''}
              loading={item.image.loading || 'lazy'}
            />
          </ResponsiveImage>
        );
      }
      break;
      
    case 'video':
      if (item.video) {
        // Handle video content
        const videoProps = {
          poster: item.video.poster,
          autoPlay: item.video.autoplay,
          muted: item.video.muted,
          loop: item.video.loop,
          controls: item.video.controls,
          // Only play when slide is active if playWhenActive is true
          ...(item.video.playWhenActive && { playsInline: true }),
        };
        
        // Conditionally handle play/pause based on active state
        if (item.video.playWhenActive) {
          // Use a ref to control video element
          const videoRef = React.useRef<HTMLVideoElement>(null);
          
          // Set up effect to control playback
          React.useEffect(() => {
            const videoElement = videoRef.current;
            if (!videoElement) return;
            
            if (isActive) {
              // Try to play the video when this slide becomes active
              try {
                videoElement.play().catch(err => {
                  // Handle autoplay restrictions silently
                  console.log('Video autoplay prevented by browser:', err);
                });
              } catch (err) {
                // Older browsers might throw instead of returning a promise
                console.log('Error playing video:', err);
              }
            } else if (item.video.pauseWhenInactive) {
              // Pause when slide becomes inactive
              videoElement.pause();
            }
          }, [isActive]);
          
          // Return the video with ref
          return (
            <VideoContainer $aspectRatio={item.video.aspectRatio}>
              {Array.isArray(item.video.src) ? (
                <video {...videoProps} ref={videoRef}>
                  {item.video.src.map((source, idx) => (
                    <source key={idx} src={source.src} type={source.type} />
                  ))}
                </video>
              ) : (
                <video src={item.video.src} {...videoProps} ref={videoRef} />
              )}
            </VideoContainer>
          );
        }
        
        // Handle multiple sources
        return (
          <VideoContainer $aspectRatio={item.video.aspectRatio}>
            {Array.isArray(item.video.src) ? (
              <video {...videoProps}>
                {item.video.src.map((source, idx) => (
                  <source key={idx} src={source.src} type={source.type} />
                ))}
              </video>
            ) : (
              <video src={item.video.src} {...videoProps} />
            )}
          </VideoContainer>
        );
      }
      break;
      
    case 'card':
      if (item.card) {
        return (
          <CardContainer $glassVariant={item.card.glassVariant || 'frosted'} $elevation={item.card.elevation}>
            {item.card.image && (
              <CardMedia>
                <img src={item.card.image} alt="" />
              </CardMedia>
            )}
            <CardContent>
              <CardHeader>
                {item.card.icon && <div className="card-icon">{item.card.icon}</div>}
                {item.card.title && <CardTitle>{item.card.title}</CardTitle>}
                {item.card.subtitle && <CardSubtitle>{item.card.subtitle}</CardSubtitle>}
              </CardHeader>
              {item.card.content && <CardBody>{item.card.content}</CardBody>}
              {item.card.actions && <CardActions>{item.card.actions}</CardActions>}
            </CardContent>
          </CardContainer>
        );
      }
      break;
      
    case 'html':
      if (item.html) {
        // Note: Be careful with innerHTML as it can expose XSS vulnerabilities
        // Consider using a sanitizer library in production
        let content = item.html.html;
        
        // Ideally, sanitize HTML if requested and a sanitizer is available
        if (item.html.sanitize) {
          try {
            // Use DOMPurify or similar if available
            if (typeof window !== 'undefined' && (window as any).DOMPurify) {
              content = (window as any).DOMPurify.sanitize(content);
            } else {
              // Basic HTML tag stripping as a fallback (not secure against all XSS)
              content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }
          } catch (err) {
            console.warn('HTML sanitization failed:', err);
          }
        }
        
        return (
          <HtmlContent 
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        );
      }
      break;
      
    default:
      return null;
  }
};

/**
 * Individual carousel slide component
 */
const CarouselSlideItem: React.FC<CarouselSlideItemProps> = (props) => {
  // Use the custom renderer if provided
  const slideContent = props.renderSlide 
    ? props.renderSlide(props.item, props.index, props.isActive) 
    : renderContent(props.item, props.isActive);
  
  // State and Hook Setup
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  // Apply multi-spring hook for scale animation
  const targetScale = prefersReducedMotion ? 1 : (isHovered || isFocused) ? 1.03 : 1;
  const { values: interactionValues, start: startInteractionSpring } = useMultiSpring({
    from: { scale: 1 },
    to: { scale: targetScale },
    animationConfig: interactionSpringConfig,
  });

  return (
    <SlideContainer
      {...props}
      style={{ 
        backgroundColor: props.item.backgroundColor,
        transform: `scale(${interactionValues.scale})`, // Apply animated scale
        ...(props.style || {})
      }}
      aria-hidden={!props.isActive}
      tabIndex={props.isActive ? 0 : -1} // Make active slide focusable
      role="group"
      aria-label={`Slide ${props.index + 1}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {slideContent}
      
      {props.item.caption && (
        <SlideCaption $color={props.color}>
          {props.item.caption}
        </SlideCaption>
      )}
    </SlideContainer>
  );
};

export default CarouselSlideItem;