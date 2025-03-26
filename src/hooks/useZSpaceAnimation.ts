import { useRef, useEffect, useState, useCallback, useMemo, HTMLAttributes } from 'react';

import { getCurrentTime } from '../utils/time';

import { useGlassPerformance } from './useGlassPerformance';
import { useMotionSettings } from './useMotionSettings';
import { useReducedMotion } from './useReducedMotion';

/**
 * Z-plane types for positioning elements in 3D space
 */
export type ZPlane = 'foreground' | 'midground' | 'background' | number;

/**
 * Z-axis animation patterns
 */
export type ZAnimationPattern =
  | 'static' // No movement
  | 'parallax' // Moves inversely to scroll/mouse (standard parallax)
  | 'follow' // Moves with scroll/mouse
  | 'push' // Pushes away from scroll/mouse
  | 'orbital' // Circles around a point
  | 'floating' // Gentle up/down floating
  | 'breathe' // Scale in/out gently
  | 'hover' // Subtle floating + slight tilt
  | 'tilt' // Tilt based on mouse position
  | 'depth-scale'; // Scale based on z-position

/**
 * Trigger methods for z-space animations
 */
export type ZAnimationTrigger =
  | 'mouse' // Mouse movement triggers animation
  | 'scroll' // Scrolling triggers animation
  | 'view' // Visibility in viewport triggers animation
  | 'load' // Animation runs on load
  | 'hover' // Element hover triggers animation
  | 'combined'; // Multiple trigger types

/**
 * Z-space element sizes
 */
export type ZElementSize = 'small' | 'medium' | 'large' | 'full';

/**
 * Enhanced Z-space animation options
 */
export interface ZSpaceAnimationOptions {
  /**
   * The Z-plane for the element (foreground, midground, background, or custom number)
   */
  plane?: ZPlane;

  /**
   * If true, the element will move in response to mouse movement
   */
  interactive?: boolean;

  /**
   * The amount of parallax effect (0-1)
   */
  intensity?: number;

  /**
   * If true, the element will have a subtle floating animation
   */
  floating?: boolean;

  /**
   * If true, the effect will be applied on scroll rather than mouse movement
   */
  scrollBased?: boolean;

  /**
   * The depth in pixels for 3D perspective
   */
  perspectiveDepth?: number;

  /**
   * If true, the animation will be disabled
   */
  disabled?: boolean;

  /**
   * If true, disable the animation in reduced motion mode
   */
  respectReducedMotion?: boolean;

  /**
   * Optional root element to use for mouse tracking (defaults to window)
   */
  rootElement?: React.RefObject<HTMLElement>;

  /**
   * Animation pattern to use
   */
  pattern?: ZAnimationPattern;

  /**
   * Trigger method for the animation
   */
  trigger?: ZAnimationTrigger;

  /**
   * Size of the Z-space element (affects motion scale)
   */
  elementSize?: ZElementSize;

  /**
   * Custom animation duration in seconds
   */
  duration?: number;

  /**
   * Animation easing function
   */
  easing?: string;

  /**
   * Maximum rotation in degrees (for tilt effects)
   */
  maxRotation?: number;

  /**
   * Maximum scale change (for scale effects)
   */
  maxScale?: number;

  /**
   * Z-depth in pixels (for 3D positioning)
   */
  zDepth?: number;

  /**
   * If true, GPU acceleration will be enabled
   */
  gpuAccelerated?: boolean;

  /**
   * If true, spring physics will be applied to movement
   */
  springPhysics?: boolean;

  /**
   * Spring stiffness value (higher = faster spring)
   */
  stiffness?: number;

  /**
   * Spring damping value (higher = less bounce)
   */
  damping?: number;

  /**
   * If true, the element will cast a dynamic shadow
   */
  dynamicShadow?: boolean;

  /**
   * If true, add a subtle glow effect that changes with movement
   */
  dynamicGlow?: boolean;

  /**
   * Radius for movement influence in pixels
   */
  influenceRadius?: number;

  /**
   * If true, enhance motion based on device capabilities
   */
  adaptiveMotion?: boolean;

  /**
   * If true, the animation will be synchronized with other animations
   */
  syncWithOthers?: boolean;

  /**
   * Optional animation delay in seconds
   */
  delay?: number;

  /**
   * If true, the animation is enabled (shorthand for !disabled)
   */
  enabled?: boolean;
}

/**
 * Z-space style properties
 */
interface ZSpaceStyles {
  transform: string;
  transition: string;
  zIndex: number;
  willChange: string;
  perspective?: string;
  transformStyle?: 'flat' | 'preserve-3d';
  boxShadow?: string;
  filter?: string;
  opacity?: number;
}

/**
 * Calculate Z-index based on z-plane
 */
const planeToZIndex = (plane: ZPlane): number => {
  if (typeof plane === 'number') {
    return Math.max(1, Math.min(999, Math.round(plane)));
  }

  switch (plane) {
    case 'foreground':
      return 10;
    case 'midground':
      return 5;
    case 'background':
      return 1;
    default:
      return 5;
  }
};

/**
 * Calculate intensity based on z-plane
 */
const planeToIntensity = (plane: ZPlane, baseIntensity = 0.1): number => {
  if (typeof plane === 'number') {
    // Convert plane number to an intensity value (higher plane = more movement)
    return Math.max(0, Math.min(1, baseIntensity * (plane / 10)));
  }

  switch (plane) {
    case 'foreground':
      return baseIntensity * 2; // More movement
    case 'midground':
      return baseIntensity;
    case 'background':
      return baseIntensity * 0.5; // Less movement
    default:
      return baseIntensity;
  }
};

/**
 * Calculate z-depth based on z-plane and perspective settings
 */
const planeToZDepth = (plane: ZPlane, perspectiveDepth: number): number => {
  if (typeof plane === 'number') {
    // Map custom plane value to a z-depth
    return Math.min(0, -perspectiveDepth * (plane / 20));
  }

  switch (plane) {
    case 'foreground':
      return -perspectiveDepth * 0.1; // Close to viewer
    case 'midground':
      return -perspectiveDepth * 0.5; // Middle distance
    case 'background':
      return -perspectiveDepth * 0.9; // Far from viewer
    default:
      return -perspectiveDepth * 0.5;
  }
};

/**
 * Calculate element size multiplier
 */
const sizeToMultiplier = (size: ZElementSize): number => {
  switch (size) {
    case 'small':
      return 0.5;
    case 'medium':
      return 1;
    case 'large':
      return 1.5;
    case 'full':
      return 2;
    default:
      return 1;
  }
};

/**
 * Enhanced hook for creating Z-space (parallax) animations
 *
 * This hook adds 3D perspective and depth to elements, creating a
 * sense of parallax based on mouse movement or scroll position. It
 * includes advanced features like spring physics, pattern options,
 * and performant rendering.
 */
export const useZSpaceAnimation = (
  options: ZSpaceAnimationOptions = {}
): {
  ref: React.RefObject<HTMLElement>;
  style: ZSpaceStyles;
  isPerspectiveActive: boolean;
  isInView: boolean;
  setCustomPosition: (x: number, y: number, z?: number) => void;
  reset: () => void;
  containerStyle: React.CSSProperties;
  elementStyle: React.CSSProperties;
} => {
  const {
    plane = 'midground',
    interactive = true,
    intensity = 0.1,
    floating = false,
    scrollBased = false,
    perspectiveDepth = 1000,
    disabled = false,
    respectReducedMotion = true,
    rootElement,
    pattern = 'parallax',
    trigger = 'mouse',
    elementSize = 'medium',
    duration = 0.3,
    easing = 'ease-out',
    maxRotation = 10,
    maxScale = 0.1,
    zDepth,
    gpuAccelerated = true,
    springPhysics = false,
    stiffness = 80,
    damping = 10,
    dynamicShadow = false,
    dynamicGlow = false,
    influenceRadius = 300,
    adaptiveMotion = true,
    syncWithOthers = false,
    delay = 0,
    enabled = true,
  } = options;

  // Hooks for accessibility and performance
  const prefersReducedMotion = useReducedMotion();
  const motionSettings = useMotionSettings();
  const performance = useGlassPerformance();

  // Get recommended glass settings function
  const getRecommendedGlassSettings = useMemo(() => {
    return performance?.getSuggestions
      ? () => ({ reducedMotion: performance.isPoorPerformance })
      : () => ({ reducedMotion: false });
  }, [performance]);

  // Element reference
  const elementRef = useRef<HTMLElement>(null);

  // State for position, visibility, and animation tracking
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1 });
  const [isInView, setIsInView] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Spring animation properties
  const springPositionRef = useRef({ x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1 });
  const springVelocityRef = useRef({ x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Safe type for recommended settings
  type RecommendedSettings = { reducedMotion?: boolean };

  // Get recommended motion settings based on device performance
  const recommendedSettings = useMemo<RecommendedSettings>(() => {
    if (!adaptiveMotion) return {};
    // Use performance object's properties directly
    return { reducedMotion: performance?.isPoorPerformance || false };
  }, [adaptiveMotion, performance?.isPoorPerformance]);

  // Calculate the zIndex based on the plane
  const zIndex = planeToZIndex(plane);

  // Determine effective z-depth value
  const effectiveZDepth = zDepth !== undefined ? zDepth : planeToZDepth(plane, perspectiveDepth);

  // Calculate size multiplier based on element size
  const sizeMultiplier = sizeToMultiplier(elementSize);

  // Determine if animations should be active
  const isAnimationDisabled =
    disabled ||
    (respectReducedMotion && prefersReducedMotion) ||
    (adaptiveMotion && recommendedSettings.reducedMotion === true);

  // Define a safe type for motion settings
  type SafeMotionSettings = { intensity?: number };

  // Adjust intensity based on reduced motion settings
  const effectiveIntensity = isAnimationDisabled
    ? intensity * 0.1 // Greatly reduced for accessibility
    : motionSettings
    ? intensity *
      // Check if there's a "intensity" property we can use
      (typeof (motionSettings as SafeMotionSettings)?.intensity === 'number'
        ? ((motionSettings as SafeMotionSettings).intensity as number)
        : 1)
    : intensity;

  // Set custom position function (useful for external controls)
  const setCustomPosition = useCallback(
    (x: number, y: number, z?: number) => {
      setPosition(prev => ({
        ...prev,
        x,
        y,
        z: z !== undefined ? z : prev.z,
      }));

      if (springPhysics) {
        springPositionRef.current = {
          ...springPositionRef.current,
          x,
          y,
          z: z !== undefined ? z : springPositionRef.current.z,
        };
      }
    },
    [springPhysics]
  );

  // Reset position and animations
  const reset = useCallback(() => {
    setPosition({ x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1 });

    if (springPhysics) {
      springPositionRef.current = { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1 };
      springVelocityRef.current = { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 0 };
    }

    setIsAnimating(false);
  }, [springPhysics]);

  // Mouse move handler with pattern-specific calculations
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (
        isAnimationDisabled ||
        (!interactive && trigger !== 'mouse') ||
        !elementRef.current ||
        (scrollBased && trigger !== 'combined')
      ) {
        return;
      }

      // Get the bounds of the container (window or custom root element)
      let containerWidth = window.innerWidth;
      let containerHeight = window.innerHeight;
      let containerLeft = 0;
      let containerTop = 0;

      // If a custom root element is provided, use its bounds
      if (rootElement && rootElement.current) {
        const rect = rootElement.current.getBoundingClientRect();
        containerWidth = rect.width;
        containerHeight = rect.height;
        containerLeft = rect.left;
        containerTop = rect.top;
      }

      // Get element position
      const elementRect = elementRef.current.getBoundingClientRect();
      const elementCenterX = elementRect.left + elementRect.width / 2;
      const elementCenterY = elementRect.top + elementRect.height / 2;

      // Calculate the mouse position relative to the center of the container
      const mouseX = ((event.clientX - containerLeft) / containerWidth) * 2 - 1;
      const mouseY = ((event.clientY - containerTop) / containerHeight) * 2 - 1;

      // Calculate distance from mouse to element center (for influence radius)
      const distanceX = event.clientX - elementCenterX;
      const distanceY = event.clientY - elementCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Check if mouse is within influence radius
      const isInRange = distance < influenceRadius;

      // Apply the intensity based on the plane
      const effectivePlaneIntensity = planeToIntensity(plane, effectiveIntensity);

      // Apply size multiplier
      const scaledIntensity = effectivePlaneIntensity * sizeMultiplier;

      // Create base values for transform calculation
      let newX = 0;
      let newY = 0;
      let newZ = 0;
      let newRotateX = 0;
      let newRotateY = 0;
      let newScale = 1;

      // If mouse is in range, calculate effect based on the selected pattern
      if (isInRange || pattern === 'parallax') {
        switch (pattern) {
          case 'parallax':
            // Standard parallax movement - moves opposite to mouse
            newX = -mouseX * scaledIntensity * 30;
            newY = -mouseY * scaledIntensity * 30;
            break;

          case 'follow':
            // Follows mouse movement
            newX = mouseX * scaledIntensity * 30;
            newY = mouseY * scaledIntensity * 30;
            break;

          case 'push':
            // Pushes away from mouse - stronger close to element
            if (isInRange) {
              const pushStrength = (1 - distance / influenceRadius) * scaledIntensity * 40;
              newX = (distanceX / distance) * pushStrength;
              newY = (distanceY / distance) * pushStrength;
            }
            break;

          case 'orbital':
            // Circular movement around a point
            if (isInRange) {
              const angle = Math.atan2(distanceY, distanceX);
              const orbitRadius = (1 - distance / influenceRadius) * scaledIntensity * 30;
              newX = Math.cos(angle + Math.PI / 2) * orbitRadius;
              newY = Math.sin(angle + Math.PI / 2) * orbitRadius;
            }
            break;

          case 'tilt':
            // Tilt based on mouse position - more natural 3D look
            newRotateX = mouseY * maxRotation * scaledIntensity;
            newRotateY = -mouseX * maxRotation * scaledIntensity;
            break;

          case 'hover':
            // Combined subtle float and tilt
            newY = -mouseY * scaledIntensity * 15;
            newRotateX = mouseY * maxRotation * scaledIntensity * 0.5;
            newRotateY = -mouseX * maxRotation * scaledIntensity * 0.5;
            newScale = 1 + (1 - distance / influenceRadius) * maxScale * scaledIntensity;
            break;

          case 'depth-scale':
            // Scale based on mouse proximity (z-axis simulation)
            if (isInRange) {
              const depthFactor = 1 - distance / influenceRadius;
              newScale = 1 + depthFactor * maxScale * scaledIntensity;
              newZ = depthFactor * 50 * scaledIntensity;
            }
            break;

          case 'floating':
          case 'breathe':
            // These patterns don't respond directly to mouse position
            // They'll be handled in the animation loop
            break;

          case 'static':
          default:
            // No movement
            break;
        }
      }

      // Apply the calculated values
      if (springPhysics && pattern !== 'static') {
        // For spring physics, update target position
        springPositionRef.current = {
          x: newX,
          y: newY,
          z: newZ,
          rotateX: newRotateX,
          rotateY: newRotateY,
          scale: newScale,
        };

        // Start animation loop if not already running
        if (!animationFrameRef.current) {
          lastFrameTimeRef.current = getCurrentTime();
          animationFrameRef.current = requestAnimationFrame(updateSpringAnimation);
        }
      } else {
        // For non-spring animations, directly update state
        setPosition({
          x: newX,
          y: newY,
          z: newZ,
          rotateX: newRotateX,
          rotateY: newRotateY,
          scale: newScale,
        });
      }

      // Mark as animating if there's movement
      if (
        newX !== 0 ||
        newY !== 0 ||
        newZ !== 0 ||
        newRotateX !== 0 ||
        newRotateY !== 0 ||
        newScale !== 1
      ) {
        setIsAnimating(true);
      }
    },
    [
      isAnimationDisabled,
      interactive,
      trigger,
      scrollBased,
      rootElement,
      plane,
      effectiveIntensity,
      pattern,
      influenceRadius,
      sizeMultiplier,
      maxRotation,
      maxScale,
      springPhysics,
    ]
  );

  // Scroll handler with pattern-based calculations
  const handleScroll = useCallback(() => {
    if (
      isAnimationDisabled ||
      (!scrollBased && trigger !== 'scroll' && trigger !== 'combined') ||
      !elementRef.current
    ) {
      return;
    }

    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    // Calculate how far the element is from the top of the document
    const rect = elementRef.current.getBoundingClientRect();
    const elementTop = rect.top + scrollPosition;
    const elementCenter = elementTop + rect.height / 2;

    // Calculate how far the viewport center is from the element center
    const viewportCenter = scrollPosition + windowHeight / 2;
    const distanceFromCenter = (viewportCenter - elementCenter) / windowHeight;

    // Calculate the percentage of the scroll position relative to the element
    const scrollPercentage =
      (scrollPosition - elementTop + windowHeight) / (windowHeight + rect.height);
    const clampedPercentage = Math.max(0, Math.min(1, scrollPercentage));

    // Apply the intensity based on the plane
    const effectivePlaneIntensity = planeToIntensity(plane, effectiveIntensity);

    // Apply size multiplier
    const scaledIntensity = effectivePlaneIntensity * sizeMultiplier;

    // Create base values for transform calculation
    const newX = 0;
    let newY = 0;
    let newZ = 0;
    let newRotateX = 0;
    const newRotateY = 0;
    let newScale = 1;

    // Calculate transform based on the selected pattern
    switch (pattern) {
      case 'parallax':
        // Standard parallax scrolling - moves at different rate than content
        newY = distanceFromCenter * scaledIntensity * 100;
        break;

      case 'follow':
        // Content follows scroll direction
        newY = -distanceFromCenter * scaledIntensity * 50;
        break;

      case 'depth-scale':
        // Scale and z-translation based on scroll position
        newScale = 1 + (0.5 - Math.abs(distanceFromCenter)) * maxScale * scaledIntensity;
        newZ = (0.5 - Math.abs(distanceFromCenter)) * 50 * scaledIntensity;
        break;

      case 'tilt':
        // Tilt based on scroll position
        newRotateX = distanceFromCenter * maxRotation * scaledIntensity;
        break;

      case 'push':
        // Push effect on scroll
        newY =
          Math.sign(distanceFromCenter) *
          Math.pow(Math.min(1, Math.abs(distanceFromCenter)), 2) *
          scaledIntensity *
          80;
        break;

      case 'static':
      default:
        // No movement
        break;
    }

    // Apply the calculated values
    if (springPhysics && pattern !== 'static') {
      // For spring physics, update target position
      springPositionRef.current = {
        x: newX,
        y: newY,
        z: newZ,
        rotateX: newRotateX,
        rotateY: newRotateY,
        scale: newScale,
      };

      // Start animation loop if not already running
      if (!animationFrameRef.current) {
        lastFrameTimeRef.current = getCurrentTime();
        animationFrameRef.current = requestAnimationFrame(updateSpringAnimation);
      }
    } else {
      // For non-spring animations, directly update state
      setPosition({
        x: newX,
        y: newY,
        z: newZ,
        rotateX: newRotateX,
        rotateY: newRotateY,
        scale: newScale,
      });
    }

    // Mark as animating if there's movement
    if (
      newX !== 0 ||
      newY !== 0 ||
      newZ !== 0 ||
      newRotateX !== 0 ||
      newRotateY !== 0 ||
      newScale !== 1
    ) {
      setIsAnimating(true);
    }
  }, [
    isAnimationDisabled,
    scrollBased,
    trigger,
    plane,
    effectiveIntensity,
    pattern,
    sizeMultiplier,
    maxRotation,
    maxScale,
    springPhysics,
  ]);

  // Time reference for animation loops
  const lastFrameTimeRef = useRef<number>(0);
  const timeSinceStartRef = useRef<number>(0);

  // We're using the imported getCurrentTime() function instead

  // Periodic animation update for floating and breathe patterns
  const updatePeriodicAnimation = useCallback(
    (timestamp: number) => {
      if (isAnimationDisabled || !isInView || !['floating', 'breathe'].includes(pattern)) {
        return;
      }

      // Calculate time delta
      const elapsed = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      // Update time counter
      timeSinceStartRef.current += elapsed;

      // Apply the intensity based on the plane
      const effectivePlaneIntensity = planeToIntensity(plane, effectiveIntensity);

      // Apply size multiplier
      const scaledIntensity = effectivePlaneIntensity * sizeMultiplier;

      // Calculate animation values based on pattern
      if (pattern === 'floating') {
        // Gentle floating animation using sine wave
        const floatAmount = scaledIntensity * 15;
        const floatPeriod = 3000; // 3 seconds for a complete cycle
        const floatValue =
          Math.sin((timeSinceStartRef.current / floatPeriod) * 2 * Math.PI) * floatAmount;

        setPosition(prev => ({
          ...prev,
          y: floatValue,
        }));
      } else if (pattern === 'breathe') {
        // Breathing effect (subtle scale animation)
        const breatheAmount = scaledIntensity * maxScale * 0.5;
        const breathePeriod = 4000; // 4 seconds for a complete cycle
        const breatheValue =
          1 + Math.sin((timeSinceStartRef.current / breathePeriod) * 2 * Math.PI) * breatheAmount;

        setPosition(prev => ({
          ...prev,
          scale: breatheValue,
        }));
      }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updatePeriodicAnimation);
    },
    [isAnimationDisabled, isInView, pattern, plane, effectiveIntensity, sizeMultiplier, maxScale]
  );

  // Spring physics animation update function
  const updateSpringAnimation = useCallback(
    (timestamp: number) => {
      if (isAnimationDisabled) {
        animationFrameRef.current = null;
        return;
      }

      // Calculate time delta in seconds (cap at 100ms to prevent large jumps)
      const deltaTime = Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = timestamp;

      // Spring properties
      const mass = 1;
      const dampingFactor = damping;
      const springConstant = stiffness;

      // Current position and velocity
      const current = { ...position };
      const velocity = { ...springVelocityRef.current };
      const target = { ...springPositionRef.current };

      // Calculate spring physics for each property
      ['x', 'y', 'z', 'rotateX', 'rotateY', 'scale'].forEach(prop => {
        // Calculate spring force: F = -k * x (Hooke's Law)
        const springForce =
          springConstant *
          (target[prop as keyof typeof target] - current[prop as keyof typeof current]);

        // Calculate damping force: F = -c * v
        const dampingForce = dampingFactor * velocity[prop as keyof typeof velocity];

        // Calculate acceleration: a = F / m
        const acceleration = (springForce - dampingForce) / mass;

        // Update velocity: v = v + a * dt
        velocity[prop as keyof typeof velocity] += acceleration * deltaTime;

        // Update position: x = x + v * dt
        current[prop as keyof typeof current] +=
          velocity[prop as keyof typeof velocity] * deltaTime;
      });

      // Update state
      setPosition(current);
      springVelocityRef.current = velocity;

      // Check if animation should continue
      const isStillMoving =
        Math.abs(velocity.x) > 0.01 ||
        Math.abs(velocity.y) > 0.01 ||
        Math.abs(velocity.z) > 0.01 ||
        Math.abs(velocity.rotateX) > 0.01 ||
        Math.abs(velocity.rotateY) > 0.01 ||
        Math.abs(velocity.scale) > 0.001 ||
        Math.abs(target.x - current.x) > 0.01 ||
        Math.abs(target.y - current.y) > 0.01 ||
        Math.abs(target.z - current.z) > 0.01 ||
        Math.abs(target.rotateX - current.rotateX) > 0.01 ||
        Math.abs(target.rotateY - current.rotateY) > 0.01 ||
        Math.abs(target.scale - current.scale) > 0.001;

      // Continue animation loop if still moving
      if (isStillMoving) {
        animationFrameRef.current = requestAnimationFrame(updateSpringAnimation);
      } else {
        animationFrameRef.current = null;
        setIsAnimating(false);
      }
    },
    [isAnimationDisabled, position, damping, stiffness]
  );

  // Intersection observer to detect when the element is in view
  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasInView = isInView;
        const nowInView = entry.isIntersecting;

        setIsInView(nowInView);

        // Handle 'view' trigger animations
        if (!wasInView && nowInView && trigger === 'view') {
          // Element just came into view
          setIsAnimating(true);

          if (['floating', 'breathe'].includes(pattern) && !isAnimationDisabled) {
            // Start periodic animation
            timeSinceStartRef.current = 0;
            lastFrameTimeRef.current = getCurrentTime();
            if (!animationFrameRef.current) {
              animationFrameRef.current = requestAnimationFrame(updatePeriodicAnimation);
            }
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isAnimationDisabled, isInView, pattern, trigger, updatePeriodicAnimation]);

  // Handle load-triggered animations
  useEffect(() => {
    if (trigger === 'load' && !hasLoaded) {
      setHasLoaded(true);

      if (['floating', 'breathe'].includes(pattern) && !isAnimationDisabled) {
        // Start periodic animation on load
        timeSinceStartRef.current = 0;
        lastFrameTimeRef.current = getCurrentTime();
        if (!animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(updatePeriodicAnimation);
        }
      }
    }
  }, [hasLoaded, isAnimationDisabled, pattern, trigger, updatePeriodicAnimation]);

  // Set up event listeners
  useEffect(() => {
    if (isAnimationDisabled) {
      return;
    }

    // Mouse-triggered animations
    if (['mouse', 'combined'].includes(trigger) && interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Scroll-triggered animations
    if (['scroll', 'combined'].includes(trigger) || scrollBased) {
      window.addEventListener('scroll', handleScroll);
      // Initial calculation
      handleScroll();
    }

    // Start periodic animations
    if (['floating', 'breathe'].includes(pattern) && isInView) {
      timeSinceStartRef.current = 0;
      lastFrameTimeRef.current = getCurrentTime();
      animationFrameRef.current = requestAnimationFrame(updatePeriodicAnimation);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);

      // Cancel animation frame on cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    isAnimationDisabled,
    interactive,
    scrollBased,
    trigger,
    pattern,
    isInView,
    handleMouseMove,
    handleScroll,
    updatePeriodicAnimation,
  ]);

  // Calculate shadow and glow styles
  const shadowStyle = useMemo(() => {
    if (!dynamicShadow || isAnimationDisabled) return '';

    // Calculate shadow based on position
    const offsetX = position.rotateY * 0.5;
    const offsetY = -position.rotateX * 0.5;
    const blur = Math.abs(position.rotateX) + Math.abs(position.rotateY) + 5;
    const spread = 0;
    const opacity =
      0.1 + Math.min(0.4, ((Math.abs(position.rotateX) + Math.abs(position.rotateY)) / 40) * 0.3);

    return `${offsetX}px ${offsetY}px ${blur}px ${spread}px rgba(0, 0, 0, ${opacity})`;
  }, [dynamicShadow, isAnimationDisabled, position.rotateX, position.rotateY]);

  const glowStyle = useMemo(() => {
    if (!dynamicGlow || isAnimationDisabled) return '';

    // Calculate glow based on position
    const glowAmount = Math.abs(position.x) + Math.abs(position.y);
    const glowOpacity = Math.min(0.6, (glowAmount / 30) * 0.3);

    return `0 0 ${10 + glowAmount * 0.3}px rgba(255, 255, 255, ${glowOpacity})`;
  }, [dynamicGlow, isAnimationDisabled, position.x, position.y]);

  // Determine the CSS transform based on position and options
  const transform = useMemo(() => {
    if (isAnimationDisabled && !isInView) {
      return 'translate3d(0, 0, 0)';
    }

    // Construct transform based on position values
    const translatePart = `translate3d(${position.x}px, ${position.y}px, ${
      position.z + effectiveZDepth
    }px)`;
    const rotatePart =
      position.rotateX || position.rotateY
        ? `rotateX(${position.rotateX}deg) rotateY(${position.rotateY}deg)`
        : '';
    const scalePart = position.scale !== 1 ? `scale(${position.scale})` : '';

    return `${translatePart} ${rotatePart} ${scalePart}`.trim();
  }, [isAnimationDisabled, isInView, position, effectiveZDepth]);

  // Determine transition style based on options
  const transitionStyle = useMemo(() => {
    if (springPhysics || isAnimationDisabled) {
      return 'none';
    }

    return `transform ${duration}s ${easing} ${delay}s`;
  }, [springPhysics, isAnimationDisabled, duration, easing, delay]);

  // Create the style object
  const style: ZSpaceStyles = useMemo(() => {
    const styles: ZSpaceStyles = {
      transform,
      transition: transitionStyle,
      zIndex,
      willChange: isAnimating && !isAnimationDisabled ? 'transform' : 'auto',
    };

    // Add perspective for 3D effects
    if (pattern === 'tilt' || pattern === 'hover' || pattern === 'depth-scale') {
      styles.perspective = `${perspectiveDepth}px`;
      styles.transformStyle = 'preserve-3d';
    }

    // Add dynamic shadow if enabled
    if (dynamicShadow && shadowStyle) {
      styles.boxShadow = shadowStyle;
    }

    // Add dynamic glow if enabled
    if (dynamicGlow && glowStyle) {
      styles.filter = `drop-shadow(${glowStyle})`;
    }

    return styles;
  }, [
    transform,
    transitionStyle,
    zIndex,
    isAnimating,
    isAnimationDisabled,
    pattern,
    perspectiveDepth,
    dynamicShadow,
    shadowStyle,
    dynamicGlow,
    glowStyle,
  ]);

  // Determine if perspective should be active
  const isPerspectiveActive = !isAnimationDisabled && isInView;

  return {
    ref: elementRef as React.RefObject<HTMLElement>,
    style,
    isPerspectiveActive,
    isInView,
    setCustomPosition,
    reset,
    containerStyle: style,
    elementStyle: style,
  };
};

export default useZSpaceAnimation;
