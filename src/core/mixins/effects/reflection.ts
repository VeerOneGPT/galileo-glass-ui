/**
 * reflection.ts
 * 
 * Styled-components mixin for simulating reflection effects using gradients.
 */

import { css, FlattenSimpleInterpolation , DefaultTheme } from 'styled-components';

export interface ReflectionEffectOptions {
  /**
   * Intensity of the reflection (0-1). Controls the opacity of the gradient.
   * Default: 0.15
   */
  intensity?: number;
  /**
   * Angle of the reflection gradient in degrees.
   * Default: 180 (simulating reflection from below)
   */
  angle?: number;
  /**
   * Starting color of the reflection gradient. Defaults to transparent white.
   */
  startColor?: string;
  /**
   * Ending color of the reflection gradient. Defaults to fully transparent.
   */
  endColor?: string;
  /**
   * Position where the reflection starts (0-1). 
   * Default: 0.5 (starts halfway down the element)
   */
  startPosition?: number;
  /**
   * Position where the reflection ends (0-1).
   * Default: 1 (ends at the bottom)
   */
  endPosition?: number;
  /**
   * Blend mode for applying the reflection.
   * Default: 'overlay'
   */
  blendMode?: string;
  /**
   * Apply to pseudo-element (e.g., '::before' or '::after').
   * If not set, applies as a background-image.
   */
  pseudoElement?: '::before' | '::after';
  /**
   * Theme object (currently unused but good practice).
   */
  theme: DefaultTheme;
}

/**
 * Mixin to simulate reflection effects using CSS gradients.
 */
export const reflectionEffect = (options: ReflectionEffectOptions): FlattenSimpleInterpolation => {
  const {
    intensity = 0.15,
    angle = 180,
    startColor = `rgba(255, 255, 255, ${intensity})`,
    endColor = 'rgba(255, 255, 255, 0)',
    startPosition = 0.5,
    endPosition = 1,
    blendMode = 'overlay',
    pseudoElement,
    theme // Keep theme for potential future use
  } = options;

  const gradient = `linear-gradient(${angle}deg, ${startColor} ${startPosition * 100}%, ${endColor} ${endPosition * 100}%)`;

  if (pseudoElement) {
    // Apply gradient to a pseudo-element
    return css`
      position: relative; // Ensure parent has positioning context
      overflow: hidden; // Clip pseudo-element if needed

      ${pseudoElement} {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: ${gradient};
        mix-blend-mode: ${blendMode};
        pointer-events: none; // Ensure pseudo-element doesn't interfere with interaction
        z-index: 1; // Adjust as needed relative to content
      }
    `;
  } else {
    // Apply gradient as a background-image layer
    // Note: This requires careful handling if other backgrounds are present
    return css`
      background-image: ${gradient}, var(--existing-background, none);
      background-blend-mode: ${blendMode}, normal;
      /* Add other background properties if needed (size, position, repeat) */
    `;
  }
}; 