/**
 * Z-Space Animation System
 *
 * Creates 3D-space animations with perspective and depth for a rich UI experience.
 */
import { CSSProperties } from 'react';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { MotionSensitivityLevel, getMotionSensitivity } from '../accessibility/MotionSensitivity';

/**
 * Z-Space animation options
 */
export interface ZSpaceAnimationOptions {
  /** Whether z-space animation is enabled */
  enabled?: boolean;

  /** Animation intensity (0-1) */
  intensity?: number;

  /** Perspective depth (higher = less pronounced effect) */
  perspective?: number;

  /** Z-axis offset for the element */
  zOffset?: number;

  /** Whether to enable parallax effect */
  parallax?: boolean;

  /** Parallax intensity multiplier */
  parallaxIntensity?: number;

  /** Rotation amount in degrees */
  rotation?: {
    x?: number;
    y?: number;
    z?: number;
  };

  /** Scale amount (1 = no scale) */
  scale?: number;

  /** Transition duration in ms */
  transitionDuration?: number;

  /** Easing function for transitions */
  easing?: string;

  /** Motion sensitivity level */
  sensitivity?: MotionSensitivityLevel;
}

/**
 * Default Z-Space animation options
 */
const DEFAULT_ZSPACE_OPTIONS: ZSpaceAnimationOptions = {
  enabled: true,
  intensity: 0.5,
  perspective: 1000,
  zOffset: 0,
  parallax: true,
  parallaxIntensity: 0.1,
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  },
  scale: 1,
  transitionDuration: 300,
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  sensitivity: MotionSensitivityLevel.NONE,
};

/**
 * Class to manage Z-Space animations
 */
export class ZSpaceAnimator {
  private options: ZSpaceAnimationOptions;
  private initialMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private currentMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private isMouseMoving = false;
  private lastFrameTime = 0;
  private animationFrameId: number | null = null;
  private elements: Map<string, HTMLElement> = new Map();
  private isReducedMotion = false;

  /**
   * Create a new Z-Space animator
   * @param options Animation options
   */
  constructor(options: ZSpaceAnimationOptions = {}) {
    this.options = { ...DEFAULT_ZSPACE_OPTIONS, ...options };

    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Listen for changes to reduced motion preference
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
        this.isReducedMotion = e.matches;
      });
    }
  }

  /**
   * Initialize the animator
   */
  init(): void {
    if (!this.options.enabled || this.isReducedMotion) {
      return;
    }

    // Start listening for mouse movement
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('mouseenter', this.handleMouseEnter);
      window.addEventListener('mouseleave', this.handleMouseLeave);

      // Start animation loop
      this.startAnimationLoop();
    }
  }

  /**
   * Clean up the animator
   */
  cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mouseenter', this.handleMouseEnter);
      window.removeEventListener('mouseleave', this.handleMouseLeave);

      // Stop animation loop
      this.stopAnimationLoop();
    }
  }

  /**
   * Register an element for Z-Space animation
   * @param id Element identifier
   * @param element HTML element to animate
   */
  registerElement(id: string, element: HTMLElement): void {
    this.elements.set(id, element);
  }

  /**
   * Unregister an element
   * @param id Element identifier
   */
  unregisterElement(id: string): void {
    this.elements.delete(id);
  }

  /**
   * Update animation options
   * @param options New options to apply
   */
  updateOptions(options: Partial<ZSpaceAnimationOptions>): void {
    this.options = { ...this.options, ...options };

    // Restart if enabled state changed
    if (options.enabled !== undefined) {
      if (options.enabled) {
        this.init();
      } else {
        this.cleanup();
      }
    }
  }

  /**
   * Handle mouse movement
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.options.enabled || this.isReducedMotion) {
      return;
    }

    this.currentMousePosition = {
      x: e.clientX,
      y: e.clientY,
    };

    this.isMouseMoving = true;
  };

  /**
   * Handle mouse entering the window
   */
  private handleMouseEnter = (e: MouseEvent): void => {
    if (!this.options.enabled || this.isReducedMotion) {
      return;
    }

    this.initialMousePosition = {
      x: e.clientX,
      y: e.clientY,
    };

    this.currentMousePosition = { ...this.initialMousePosition };
  };

  /**
   * Handle mouse leaving the window
   */
  private handleMouseLeave = (): void => {
    this.isMouseMoving = false;

    // Reset all elements
    this.elements.forEach(element => {
      this.resetElementTransform(element);
    });
  };

  /**
   * Start the animation loop
   */
  private startAnimationLoop(): void {
    // Stop any existing loop
    this.stopAnimationLoop();

    // Start new loop
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.animationLoop);
  }

  /**
   * Stop the animation loop
   */
  private stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Animation loop
   */
  private animationLoop = (timestamp: number): void => {
    if (!this.options.enabled || this.isReducedMotion) {
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
      return;
    }

    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Skip if not enough time has passed
    if (deltaTime < 16) {
      // ~60 FPS
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
      return;
    }

    // Update elements if mouse is moving
    if (this.isMouseMoving) {
      this.updateElements();
    }

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(this.animationLoop);
  };

  /**
   * Update all registered elements
   */
  private updateElements(): void {
    if (!this.options.enabled || this.isReducedMotion) {
      return;
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate mouse position as percentage of window
    const mouseX = (this.currentMousePosition.x / windowWidth) * 2 - 1; // -1 to 1
    const mouseY = (this.currentMousePosition.y / windowHeight) * 2 - 1; // -1 to 1

    // Update each element
    this.elements.forEach(element => {
      // Get element boundaries
      const rect = element.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;

      // Calculate element position as percentage of window
      const elementX = (elementCenterX / windowWidth) * 2 - 1; // -1 to 1
      const elementY = (elementCenterY / windowHeight) * 2 - 1; // -1 to 1

      // Calculate distance from mouse to element center
      const distanceX = mouseX - elementX;
      const distanceY = mouseY - elementY;

      // Apply rotation based on mouse position and intensity
      const rotationX = -distanceY * 10 * (this.options.intensity || 0.5);
      const rotationY = distanceX * 10 * (this.options.intensity || 0.5);

      // Apply parallax effect
      let translateX = 0;
      let translateY = 0;

      if (this.options.parallax) {
        translateX = -distanceX * 10 * (this.options.parallaxIntensity || 0.1);
        translateY = -distanceY * 10 * (this.options.parallaxIntensity || 0.1);
      }

      // Apply transformation
      this.applyElementTransform(element, {
        rotationX,
        rotationY,
        translateX,
        translateY,
      });
    });
  }

  /**
   * Apply transform to an element
   * @param element Element to transform
   * @param transform Transform values
   */
  private applyElementTransform(
    element: HTMLElement,
    transform: {
      rotationX: number;
      rotationY: number;
      translateX: number;
      translateY: number;
    }
  ): void {
    const { rotationX, rotationY, translateX, translateY } = transform;
    const { zOffset = 0, scale = 1, transitionDuration = 300, easing = 'ease' } = this.options;

    // Build transform string
    const transformString = `
      perspective(${this.options.perspective || 1000}px)
      translate3d(${translateX}px, ${translateY}px, ${zOffset}px)
      rotateX(${rotationX}deg)
      rotateY(${rotationY}deg)
      scale(${scale})
    `;

    // Apply transform
    element.style.transform = transformString;
    element.style.transition = `transform ${transitionDuration}ms ${easing}`;
  }

  /**
   * Reset element transform
   * @param element Element to reset
   */
  private resetElementTransform(element: HTMLElement): void {
    const { transitionDuration = 300, easing = 'ease', scale = 1 } = this.options;

    // Reset to default transform
    element.style.transform = `
      perspective(${this.options.perspective || 1000}px)
      translate3d(0, 0, ${this.options.zOffset || 0}px)
      rotateX(0)
      rotateY(0)
      scale(${scale})
    `;

    element.style.transition = `transform ${transitionDuration}ms ${easing}`;
  }

  /**
   * Generate CSS properties for Z-space animation
   * @returns CSS properties for the container and element
   */
  getCSSProperties(): {
    containerStyle: CSSProperties;
    elementStyle: CSSProperties;
  } {
    if (!this.options.enabled || this.isReducedMotion) {
      return {
        containerStyle: {},
        elementStyle: {},
      };
    }

    return {
      containerStyle: {
        perspective: `${this.options.perspective || 1000}px`,
        transformStyle: 'preserve-3d',
      },
      elementStyle: {
        transform: `
          translate3d(0, 0, ${this.options.zOffset || 0}px)
          rotateX(${this.options.rotation?.x || 0}deg)
          rotateY(${this.options.rotation?.y || 0}deg)
          rotateZ(${this.options.rotation?.z || 0}deg)
          scale(${this.options.scale || 1})
        `,
        transition: `transform ${this.options.transitionDuration || 300}ms ${
          this.options.easing || 'ease'
        }`,
      },
    };
  }
}

/**
 * Hook for using Z-Space animations in components
 * @param options Z-Space animation options
 * @returns Object with animation CSS properties and controls
 */
export const useZSpaceAnimation = (
  options: ZSpaceAnimationOptions = {}
): {
  containerStyle: CSSProperties;
  elementStyle: CSSProperties;
  animator: ZSpaceAnimator;
} => {
  const prefersReducedMotion = useReducedMotion();
  const sensitivityConfig = getMotionSensitivity(options.sensitivity);

  // Disable z-space animations for reduced motion or high sensitivity
  const isEnabled =
    options.enabled !== false && !prefersReducedMotion && !sensitivityConfig.disableParallax;

  // Create animator with adjusted options
  const animator = new ZSpaceAnimator({
    ...options,
    enabled: isEnabled,
  });

  // Get CSS properties
  const { containerStyle, elementStyle } = animator.getCSSProperties();

  return {
    containerStyle,
    elementStyle,
    animator,
  };
};
