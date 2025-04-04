import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';

import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useGlassTheme } from '../../hooks/useGlassTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Adaptation modes for context-aware glass
export type AdaptationMode =
  | 'auto' // Automatically determine the best adaptation
  | 'content' // Adapt based on content
  | 'background' // Adapt based on background
  | 'hybrid' // Adapt based on both content and background
  | 'fixed' // Use fixed settings without adaptation
  | 'dynamic' // Continuously adapt to changes
  | 'contrast' // Prioritize contrast
  | 'immersive'; // Prioritize immersive experience

// Content types that can be detected
export type ContentType =
  | 'text' // Primarily text content
  | 'image' // Image-heavy content
  | 'mixed' // Mixed content types
  | 'data' // Data visualization
  | 'form' // Form inputs
  | 'interactive' // Interactive controls
  | 'multimedia' // Video or rich media
  | 'unknown'; // Unable to determine content type

// Background types that can be detected
export type BackgroundType =
  | 'light' // Light solid color
  | 'dark' // Dark solid color
  | 'image' // Image background
  | 'gradient' // Gradient background
  | 'pattern' // Pattern background
  | 'video' // Video background
  | 'complex' // Complex or busy background
  | 'unknown'; // Unable to determine background type

export interface ContextAwareGlassProps {
  /**
   * The content to render within the glass container
   */
  children: React.ReactNode;

  /**
   * The adaptation mode to use
   */
  adaptationMode?: AdaptationMode;

  /**
   * If provided, explicitly sets the content type instead of auto-detection
   */
  contentType?: ContentType;

  /**
   * If provided, explicitly sets the background type instead of auto-detection
   */
  backgroundType?: BackgroundType;

  /**
   * Base blur strength (will be adjusted based on context)
   */
  baseBlurStrength?: number;

  /**
   * Base background opacity (will be adjusted based on context)
   */
  baseOpacity?: number;

  /**
   * Base border opacity (will be adjusted based on context)
   */
  baseBorderOpacity?: number;

  /**
   * Enable edge highlighting effect
   */
  enableEdgeHighlight?: boolean;

  /**
   * Enable glow effect
   */
  enableGlow?: boolean;

  /**
   * Color for glow effect (if enabled)
   */
  glowColor?: string;

  /**
   * Enable continuous adaptation (analyzes content periodically)
   */
  enableContinuousAdaptation?: boolean;

  /**
   * Interval (ms) for continuous adaptation checks
   */
  adaptationInterval?: number;

  /**
   * Handle adaptation changes
   */
  onAdaptationChange?: (settings: {
    blurStrength: number;
    opacity: number;
    borderOpacity: number;
    contentType: ContentType;
    backgroundType: BackgroundType;
  }) => void;

  /**
   * Optional element ID to analyze as background instead of parent element
   */
  backgroundElementId?: string;

  /**
   * Border radius for the container
   */
  borderRadius?: string | number;

  /**
   * Optional CSS class
   */
  className?: string;

  /**
   * Content padding
   */
  padding?: string | number;

  /**
   * Enable debug mode (shows adaptation information)
   */
  debug?: boolean;

  /**
   * Force light mode settings
   */
  forceLightMode?: boolean;

  /**
   * Force dark mode settings
   */
  forceDarkMode?: boolean;

  /**
   * Minimum blur strength (px)
   */
  minBlurStrength?: number;

  /**
   * Maximum blur strength (px)
   */
  maxBlurStrength?: number;

  /**
   * Minimum background opacity (0-1)
   */
  minOpacity?: number;

  /**
   * Maximum background opacity (0-1)
   */
  maxOpacity?: number;
}

// Helper to convert to CSS dimension
const toCssDimension = (value: string | number | undefined): string => {
  if (value === undefined) return '0';
  return typeof value === 'number' ? `${value}px` : value;
};

// Styled components
const GlassContainer = styled.div<{
  $blurStrength: number;
  $opacity: number;
  $borderOpacity: number;
  $enableEdgeHighlight: boolean;
  $enableGlow: boolean;
  $glowColor: string;
  $borderRadius: string;
  $padding: string;
  $isDarkMode: boolean;
}>`
  position: relative;
  overflow: hidden;
  border-radius: ${props => props.$borderRadius};
  padding: ${props => props.$padding};

  /* Apply glass surface effect */
  ${props =>
    glassSurface({
      blurStrength: `${props.$blurStrength}px`,
      backgroundOpacity: props.$opacity,
      borderOpacity: props.$borderOpacity,
      themeContext: createThemeContext({ isDarkMode: props.$isDarkMode }),
    })}

  /* Apply edge highlight if enabled */
  ${props =>
    props.$enableEdgeHighlight &&
    edgeHighlight({
      thickness: 1,
      opacity: 0.5,
      position: 'all',
      themeContext: createThemeContext({ isDarkMode: props.$isDarkMode }),
    })}
  
  /* Apply glow effect if enabled */
  ${props =>
    props.$enableGlow &&
    glassGlow({
      intensity: 'medium',
      color: props.$glowColor,
      themeContext: createThemeContext({ isDarkMode: props.$isDarkMode }),
    })}
`;

const DebugInfo = styled.div<{
  $isDarkMode: boolean;
}>`
  position: absolute;
  top: 0;
  right: 0;
  background-color: ${props =>
    props.$isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
  color: ${props => (props.$isDarkMode ? 'white' : 'black')};
  font-size: 10px;
  padding: 4px;
  border-bottom-left-radius: 4px;
  z-index: 1;
  pointer-events: none;
  font-family: monospace;
`;

/**
 * ContextAwareGlass Component
 *
 * A glass container that adapts its appearance based on content and background.
 */
export const ContextAwareGlass = forwardRef<HTMLDivElement, ContextAwareGlassProps>(
  (props, ref) => {
    const {
      children,
      adaptationMode = 'auto',
      contentType,
      backgroundType,
      baseBlurStrength = 10,
      baseOpacity = 0.15,
      baseBorderOpacity = 0.2,
      enableEdgeHighlight = true,
      enableGlow = false,
      glowColor = '#6366F1', // Primary color
      enableContinuousAdaptation = false,
      adaptationInterval = 1000,
      onAdaptationChange,
      backgroundElementId,
      borderRadius = '8px',
      className,
      padding = '16px',
      debug = false,
      forceLightMode = false,
      forceDarkMode = false,
      minBlurStrength = 5,
      maxBlurStrength = 20,
      minOpacity = 0.1,
      maxOpacity = 0.4,
      ...rest
    } = props;

    // Get theme information
    const { isDarkMode: themeIsDarkMode } = useGlassTheme();
    const isDarkMode = forceDarkMode || (themeIsDarkMode && !forceLightMode);
    const prefersReducedMotion = useReducedMotion();

    // Refs and state
    const containerRef = useRef<HTMLDivElement>(null);
    const adaptationTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Default state for glass settings and detection
    const [detectedContentType, setDetectedContentType] = useState<ContentType>(
      contentType || 'unknown'
    );
    const [detectedBackgroundType, setDetectedBackgroundType] = useState<BackgroundType>(
      backgroundType || 'unknown'
    );
    const [blurStrength, setBlurStrength] = useState(baseBlurStrength);
    const [opacity, setOpacity] = useState(baseOpacity);
    const [borderOpacity, setBorderOpacity] = useState(baseBorderOpacity);

    // Convert borderRadius and padding to CSS dimensions
    const borderRadiusValue = toCssDimension(borderRadius);
    const paddingValue = toCssDimension(padding);

    // Function to detect content type
    const detectContentType = useCallback((): ContentType => {
      if (contentType) return contentType;
      if (!containerRef.current) return 'unknown';

      const container = containerRef.current;

      // Check if container has form elements
      const hasFormElements =
        container.querySelectorAll('input, select, textarea, button').length > 0;
      if (hasFormElements) return 'form';

      // Check if container has images
      const hasImages = container.querySelectorAll('img, svg, canvas').length > 0;

      // Check if container has video or audio elements
      const hasMultimedia = container.querySelectorAll('video, audio, iframe').length > 0;
      if (hasMultimedia) return 'multimedia';

      // Check if container has interactive elements
      const hasInteractive = container.querySelectorAll('button, a, [role="button"]').length > 0;

      // Check text content length
      const textContent = container.textContent || '';
      const hasSignificantText = textContent.length > 50;

      // Determine content type based on findings
      if (hasImages && hasSignificantText) return 'mixed';
      if (hasImages) return 'image';
      if (hasInteractive) return 'interactive';
      if (hasSignificantText) return 'text';

      // Default to unknown if can't determine
      return 'unknown';
    }, [contentType, containerRef]);

    // Function to detect background type
    const detectBackgroundType = useCallback((): BackgroundType => {
      if (backgroundType) return backgroundType;

      let background: Element | null = null;

      // Try to get specified background element
      if (backgroundElementId) {
        background = document.getElementById(backgroundElementId);
      }

      // If no specified element or not found, use parent of container
      if (!background && containerRef.current) {
        background = containerRef.current.parentElement;
      }

      if (!background) return 'unknown';

      // Get computed style of background element
      const style = window.getComputedStyle(background);

      // Check for background image or gradient
      const backgroundImage = style.backgroundImage;
      if (backgroundImage && backgroundImage !== 'none') {
        if (backgroundImage.includes('gradient')) return 'gradient';
        if (backgroundImage.includes('url')) return 'image';
        return 'pattern';
      }

      // Check if element is or contains a video
      if (background.tagName === 'VIDEO' || background.querySelector('video')) {
        return 'video';
      }

      // Check background color for light/dark
      const backgroundColor = style.backgroundColor;
      if (
        backgroundColor &&
        backgroundColor !== 'transparent' &&
        backgroundColor !== 'rgba(0, 0, 0, 0)'
      ) {
        // Parse the color to determine if it's light or dark
        const isLight = isLightColor(backgroundColor);
        return isLight ? 'light' : 'dark';
      }

      // If we have multiple backgrounds or complex setup
      if (style.background && style.background !== style.backgroundColor) {
        return 'complex';
      }

      return 'unknown';
    }, [backgroundType, backgroundElementId, containerRef]);

    // Function to determine if a color is light or dark
    const isLightColor = (color: string): boolean => {
      // Handle rgba/rgb format
      let r = 0,
        g = 0,
        b = 0;

      if (color.startsWith('rgba') || color.startsWith('rgb')) {
        const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          r = parseInt(match[1], 10);
          g = parseInt(match[2], 10);
          b = parseInt(match[3], 10);
        }
      } else if (color.startsWith('#')) {
        // Handle hex format
        const hex = color.substring(1);
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
      }

      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Return true if luminance is greater than 0.5 (light color)
      return luminance > 0.5;
    };

    // Function to adjust glass settings based on content and background
    const adjustGlassSettings = useCallback(() => {
      const currentContentType = detectContentType();
      const currentBackgroundType = detectBackgroundType();

      setDetectedContentType(currentContentType);
      setDetectedBackgroundType(currentBackgroundType);

      // Helper function to clamp a value between min and max
      const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max);

      // Calculate adjusted values based on adaptation mode and detected types
      let adjustedBlurStrength = baseBlurStrength;
      let adjustedOpacity = baseOpacity;
      let adjustedBorderOpacity = baseBorderOpacity;

      switch (adaptationMode) {
        case 'content':
          // Adjust based on content type
          switch (currentContentType) {
            case 'text':
              // For text, increase opacity and decrease blur for better readability
              adjustedBlurStrength = baseBlurStrength * 0.8;
              adjustedOpacity = baseOpacity * 1.2;
              break;
            case 'image':
              // For images, decrease opacity and increase blur for better visibility
              adjustedBlurStrength = baseBlurStrength * 1.2;
              adjustedOpacity = baseOpacity * 0.8;
              break;
            case 'interactive':
              // For interactive elements, make more visible
              adjustedBlurStrength = baseBlurStrength;
              adjustedOpacity = baseOpacity * 1.1;
              adjustedBorderOpacity = baseBorderOpacity * 1.2;
              break;
            case 'form':
              // For forms, maximize readability and contrast
              adjustedBlurStrength = baseBlurStrength * 0.9;
              adjustedOpacity = baseOpacity * 1.3;
              adjustedBorderOpacity = baseBorderOpacity * 1.3;
              break;
            case 'multimedia':
              // For multimedia, maximize transparency
              adjustedBlurStrength = baseBlurStrength * 1.3;
              adjustedOpacity = baseOpacity * 0.7;
              break;
            default:
              // No adjustment for unknown or mixed content
              break;
          }
          break;

        case 'background':
          // Adjust based on background type
          switch (currentBackgroundType) {
            case 'light':
              // For light backgrounds, decrease opacity in light mode, increase in dark mode
              adjustedOpacity = isDarkMode ? baseOpacity * 1.2 : baseOpacity * 0.9;
              break;
            case 'dark':
              // For dark backgrounds, increase opacity in light mode, decrease in dark mode
              adjustedOpacity = isDarkMode ? baseOpacity * 0.9 : baseOpacity * 1.2;
              break;
            case 'image':
            case 'complex':
            case 'pattern':
              // For busy backgrounds, increase blur and opacity for better isolation
              adjustedBlurStrength = baseBlurStrength * 1.4;
              adjustedOpacity = baseOpacity * 1.3;
              break;
            case 'video':
              // For video backgrounds, maximize blur for better isolation
              adjustedBlurStrength = baseBlurStrength * 1.6;
              adjustedOpacity = baseOpacity * 1.2;
              break;
            case 'gradient':
              // For gradients, moderate adjustments
              adjustedBlurStrength = baseBlurStrength * 1.2;
              adjustedOpacity = baseOpacity * 1.1;
              break;
            default:
              // No adjustment for unknown backgrounds
              break;
          }
          break;

        case 'hybrid':
          // Combine both content and background adaptations
          // First apply content-based adjustments
          switch (currentContentType) {
            case 'text':
              adjustedBlurStrength = baseBlurStrength * 0.8;
              adjustedOpacity = baseOpacity * 1.1;
              break;
            case 'image':
              adjustedBlurStrength = baseBlurStrength * 1.1;
              adjustedOpacity = baseOpacity * 0.9;
              break;
            default:
              break;
          }

          // Then apply background-based adjustments
          switch (currentBackgroundType) {
            case 'image':
            case 'complex':
            case 'video':
              adjustedBlurStrength *= 1.2;
              adjustedOpacity *= 1.1;
              break;
            case 'light':
              if (isDarkMode) adjustedOpacity *= 1.1;
              break;
            case 'dark':
              if (!isDarkMode) adjustedOpacity *= 1.1;
              break;
            default:
              break;
          }
          break;

        case 'contrast':
          // Prioritize contrast and readability
          adjustedBlurStrength = baseBlurStrength * 0.7;
          adjustedOpacity = baseOpacity * 1.4;
          adjustedBorderOpacity = baseBorderOpacity * 1.5;
          break;

        case 'immersive':
          // Prioritize immersion and aesthetic
          adjustedBlurStrength = baseBlurStrength * 1.5;
          adjustedOpacity = baseOpacity * 0.8;
          break;

        case 'fixed':
          // Use base values without adaptation
          break;

        case 'dynamic':
        case 'auto':
        default:
          // For auto/dynamic, use a combination of approaches based on content and background
          if (currentContentType === 'text' || currentContentType === 'form') {
            // Prioritize readability for text/forms
            adjustedBlurStrength = baseBlurStrength * 0.8;
            adjustedOpacity = baseOpacity * 1.2;
          } else if (currentContentType === 'image' || currentContentType === 'multimedia') {
            // Prioritize visibility for images/multimedia
            adjustedBlurStrength = baseBlurStrength * 1.2;
            adjustedOpacity = baseOpacity * 0.9;
          }

          // Further adjust based on background
          if (currentBackgroundType === 'complex' || currentBackgroundType === 'video') {
            adjustedBlurStrength *= 1.3;
            adjustedOpacity *= 1.2;
          } else if (currentBackgroundType === 'light' && isDarkMode) {
            adjustedOpacity *= 1.2;
          } else if (currentBackgroundType === 'dark' && !isDarkMode) {
            adjustedOpacity *= 1.2;
          }
          break;
      }

      // For reduced motion preferences, use more subtle effects
      if (prefersReducedMotion) {
        adjustedBlurStrength = Math.min(adjustedBlurStrength, baseBlurStrength);
      }

      // Clamp final values within valid ranges
      const finalBlurStrength = clamp(adjustedBlurStrength, minBlurStrength, maxBlurStrength);
      const finalOpacity = clamp(adjustedOpacity, minOpacity, maxOpacity);
      const finalBorderOpacity = clamp(adjustedBorderOpacity, 0.1, 0.5);

      // Update state with adjusted values
      setBlurStrength(finalBlurStrength);
      setOpacity(finalOpacity);
      setBorderOpacity(finalBorderOpacity);

      // Call onAdaptationChange callback if provided
      if (onAdaptationChange) {
        onAdaptationChange({
          blurStrength: finalBlurStrength,
          opacity: finalOpacity,
          borderOpacity: finalBorderOpacity,
          contentType: currentContentType,
          backgroundType: currentBackgroundType,
        });
      }
    }, [
      adaptationMode,
      baseBlurStrength,
      baseOpacity,
      baseBorderOpacity,
      detectContentType,
      detectBackgroundType,
      isDarkMode,
      prefersReducedMotion,
      minBlurStrength,
      maxBlurStrength,
      minOpacity,
      maxOpacity,
      onAdaptationChange,
    ]);

    // Effect to adjust settings on mount and when dependencies change
    useEffect(() => {
      adjustGlassSettings();
    }, [
      adaptationMode,
      contentType,
      backgroundType,
      baseBlurStrength,
      baseOpacity,
      baseBorderOpacity,
      isDarkMode,
      adjustGlassSettings,
    ]);

    // Effect for continuous adaptation
    useEffect(() => {
      if (enableContinuousAdaptation && adaptationMode !== 'fixed') {
        // Set up periodic check
        adaptationTimerRef.current = setInterval(() => {
          adjustGlassSettings();
        }, adaptationInterval);

        // Clean up on unmount
        return () => {
          if (adaptationTimerRef.current) {
            clearInterval(adaptationTimerRef.current);
          }
        };
      }
    }, [enableContinuousAdaptation, adaptationMode, adaptationInterval, adjustGlassSettings]);

    return (
      <GlassContainer
        ref={node => {
          containerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement>).current = node!;
          }
        }}
        className={className}
        $blurStrength={blurStrength}
        $opacity={opacity}
        $borderOpacity={borderOpacity}
        $enableEdgeHighlight={enableEdgeHighlight}
        $enableGlow={enableGlow}
        $glowColor={glowColor}
        $borderRadius={borderRadiusValue}
        $padding={paddingValue}
        $isDarkMode={isDarkMode}
        {...rest}
      >
        {debug && (
          <DebugInfo $isDarkMode={isDarkMode}>
            <div>Content: {detectedContentType}</div>
            <div>Background: {detectedBackgroundType}</div>
            <div>Blur: {blurStrength.toFixed(1)}px</div>
            <div>Opacity: {opacity.toFixed(2)}</div>
          </DebugInfo>
        )}
        {children}
      </GlassContainer>
    );
  }
);

ContextAwareGlass.displayName = 'ContextAwareGlass';

export default ContextAwareGlass;
