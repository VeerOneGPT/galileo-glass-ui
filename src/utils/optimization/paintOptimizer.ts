/**
 * Paint Optimization Utilities
 *
 * Tools for optimizing browser painting performance with Glass UI components.
 */
// Import CSS type definitions
import '../../types/css';
import { DeviceCapabilityTier, getDeviceCapabilityTier } from '../deviceCapabilities';
import { OptimizationLevel } from '../performanceOptimizations';

/**
 * Paint optimization configuration
 */
export interface PaintOptimizationConfig {
  /** Current device capability tier */
  deviceTier?: DeviceCapabilityTier;

  /** Current optimization level */
  optimizationLevel?: OptimizationLevel;

  /** Whether to use hardware acceleration */
  useHardwareAcceleration?: boolean;

  /** Whether to manage paint layers */
  managePaintLayers?: boolean;

  /** Target FPS to maintain */
  targetFps?: number;

  /** Whether to automatically adjust during scrolling */
  optimizeDuringScroll?: boolean;

  /** Whether to defer non-essential paints */
  deferNonEssentialPaints?: boolean;

  /** Timeout for deferring paints (ms) */
  deferTimeout?: number;

  /** Whether to separate fast/slow paint operations */
  separatePaintOperations?: boolean;

  /** Whether to limit paint areas during animations */
  limitPaintDuringAnimation?: boolean;

  /** Whether to enable profiling for debugging */
  enableProfiling?: boolean;

  /** Whether to reduce overdraw */
  reduceOverdraw?: boolean;

  /** Whether to use opacity-aware painting */
  useOpacityAwarePainting?: boolean;

  /** Whether to clip to viewport */
  clipToViewport?: boolean;

  /** Whether to optimize glass effects */
  optimizeGlassEffects?: boolean;

  /** Cache size for optimized elements */
  cacheSize?: number;
}

/**
 * Default paint optimization configuration
 */
const DEFAULT_CONFIG: Required<PaintOptimizationConfig> = {
  deviceTier: DeviceCapabilityTier.MEDIUM,
  optimizationLevel: OptimizationLevel.NONE,
  useHardwareAcceleration: true,
  managePaintLayers: true,
  targetFps: 60,
  optimizeDuringScroll: true,
  deferNonEssentialPaints: true,
  deferTimeout: 200,
  separatePaintOperations: true,
  limitPaintDuringAnimation: true,
  enableProfiling: process.env.NODE_ENV === 'development',
  reduceOverdraw: true,
  useOpacityAwarePainting: true,
  clipToViewport: true,
  optimizeGlassEffects: true,
  cacheSize: 100,
};

/**
 * Glass element attributes related to painting
 */
interface GlassPaintAttributes {
  /** Whether element has backdrop filter */
  hasBackdropFilter: boolean;

  /** Whether element has box shadow */
  hasBoxShadow: boolean;

  /** Whether element has complex border */
  hasComplexBorder: boolean;

  /** Whether element has transform */
  hasTransform: boolean;

  /** Element's approximate pixel area */
  pixelArea: number;

  /** Whether element is currently visible */
  isVisible: boolean;

  /** Whether element is in animation */
  isAnimating: boolean;

  /** Whether element has complex background */
  hasComplexBackground: boolean;

  /** Element's opacity */
  opacity: number;
}

/**
 * Paint optimization actions to take
 */
interface PaintOptimizationActions {
  /** Whether to promote to a separate layer */
  promoteToLayer: boolean;

  /** Whether to use transform instead of top/left */
  useTransform: boolean;

  /** Whether to simplify effects during animation */
  simplifyEffectsDuringAnimation: boolean;

  /** Whether to defer painting */
  deferPainting: boolean;

  /** Whether to use hardware acceleration */
  useHardwareAcceleration: boolean;

  /** Whether to reduce quality during interaction */
  reduceQualityDuringInteraction: boolean;

  /** CSS property overrides to apply */
  cssOverrides: Record<string, string>;
}

/**
 * Paint Optimizer class for managing and optimizing paint operations
 */
export class PaintOptimizer {
  private config: Required<PaintOptimizationConfig>;
  private animatingElements: Set<HTMLElement> = new Set();
  private deferredElements: Map<HTMLElement, NodeJS.Timeout> = new Map();
  private scrollListenerActive = false;
  private animationFrameId: number | null = null;
  private lastScrollTime = 0;
  private isScrolling = false;

  /**
   * Create a new paint optimizer
   */
  constructor(config: PaintOptimizationConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      deviceTier: config.deviceTier || getDeviceCapabilityTier(),
    };

    if (this.config.optimizeDuringScroll) {
      this.setupScrollListener();
    }
  }

  /**
   * Optimize a Glass UI element for painting
   */
  public optimizeElement(element: HTMLElement, isGlassComponent = false): void {
    if (!element) return;

    // Analyze element to determine paint characteristics
    const paintAttributes = this.analyzeElement(element, isGlassComponent);

    // Determine optimization actions
    const actions = this.determineOptimizationActions(paintAttributes);

    // Apply optimizations based on actions
    this.applyOptimizations(element, actions, isGlassComponent);

    // Mark element as optimized
    element.setAttribute('data-paint-optimized', 'true');
  }

  /**
   * Mark an element as animating to enable special optimizations
   */
  public markElementAsAnimating(element: HTMLElement, duration = 300): void {
    if (!element) return;

    // Add to animating elements set
    this.animatingElements.add(element);

    // Get existing optimization level
    const currentOptimization = element.getAttribute('data-optimization-level') || '';

    // Special optimizations for animating elements
    element.style.willChange = 'transform, opacity';

    if (this.config.limitPaintDuringAnimation) {
      // For glass components, temporarily reduce effects quality
      if (element.getAttribute('data-glass-component') === 'true') {
        // Reduce blur strength
        const backdropFilter =
          element.style.backdropFilter || (element.style as any).webkitBackdropFilter;
        if (backdropFilter && backdropFilter.includes('blur')) {
          element.setAttribute('data-original-backdrop-filter', backdropFilter);

          // Reduce blur by 30%
          const match = backdropFilter.match(/blur\((\d+)px\)/);
          if (match) {
            const blurValue = parseInt(match[1], 10);
            const reducedBlur = Math.max(3, Math.round(blurValue * 0.7));
            const newFilter = backdropFilter.replace(/blur\((\d+)px\)/, `blur(${reducedBlur}px)`);

            element.style.backdropFilter = newFilter;
            (element.style as any).webkitBackdropFilter = newFilter;
          }
        }

        // Simplify box-shadow if present
        if (element.style.boxShadow && element.style.boxShadow !== 'none') {
          element.setAttribute('data-original-box-shadow', element.style.boxShadow);

          // Use a simpler shadow during animation
          element.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        }
      }
    }

    // Set a timeout to undo animation optimizations
    setTimeout(() => {
      this.unmarkElementAsAnimating(element);
    }, duration + 50); // Add a small buffer to ensure animation completes
  }

  /**
   * Unmark an element as animating, restoring normal optimizations
   */
  public unmarkElementAsAnimating(element: HTMLElement): void {
    if (!element) return;

    // Remove from animating elements set
    this.animatingElements.delete(element);

    // Restore original properties if they were changed
    const originalBackdropFilter = element.getAttribute('data-original-backdrop-filter');
    if (originalBackdropFilter) {
      element.style.backdropFilter = originalBackdropFilter;
      (element.style as any).webkitBackdropFilter = originalBackdropFilter;
      element.removeAttribute('data-original-backdrop-filter');
    }

    const originalBoxShadow = element.getAttribute('data-original-box-shadow');
    if (originalBoxShadow) {
      element.style.boxShadow = originalBoxShadow;
      element.removeAttribute('data-original-box-shadow');
    }

    // Reset will-change to avoid memory issues
    // But keep it if element is currently being interacted with
    if (!element.matches(':hover, :active, :focus')) {
      element.style.willChange = 'auto';
    }
  }

  /**
   * Defer paint operations for non-essential elements
   */
  public deferPaint(element: HTMLElement, delay: number = this.config.deferTimeout): void {
    if (!element || !this.config.deferNonEssentialPaints) return;

    // Check if there's an existing timeout for this element
    if (this.deferredElements.has(element)) {
      clearTimeout(this.deferredElements.get(element)!);
    }

    // Hide the element temporarily
    element.style.visibility = 'hidden';

    // Schedule the element to be made visible
    const timeoutId = setTimeout(() => {
      element.style.visibility = '';
      this.deferredElements.delete(element);
    }, delay);

    this.deferredElements.set(element, timeoutId);
  }

  /**
   * Cancel deferred paint for an element
   */
  public cancelDeferredPaint(element: HTMLElement): void {
    if (!element) return;

    // Check if there's a deferred paint for this element
    if (this.deferredElements.has(element)) {
      clearTimeout(this.deferredElements.get(element)!);
      this.deferredElements.delete(element);

      // Make the element visible immediately
      element.style.visibility = '';
    }
  }

  /**
   * Optimize all elements during scroll
   */
  public optimizeForScroll(active: boolean): void {
    // Set the scrolling state
    this.isScrolling = active;
    this.lastScrollTime = Date.now();

    if (active) {
      // Apply scroll-specific optimizations
      document.body.classList.add('is-scrolling');

      // Reduce quality of glass components during scroll
      document.querySelectorAll('[data-glass-component="true"]').forEach(element => {
        if (this.isElementVisible(element as HTMLElement)) {
          this.optimizeElementForScroll(element as HTMLElement);
        }
      });
    } else {
      // Remove scroll optimizations
      document.body.classList.remove('is-scrolling');

      // Restore glass components after scroll
      document
        .querySelectorAll('[data-glass-component="true"][data-scroll-optimized="true"]')
        .forEach(element => {
          this.restoreElementAfterScroll(element as HTMLElement);
        });
    }
  }

  /**
   * Clean up resources and event listeners
   */
  public dispose(): void {
    // Clean up scroll listener if active
    if (this.scrollListenerActive) {
      window.removeEventListener('scroll', this.handleScroll);
      this.scrollListenerActive = false;
    }

    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Clear all deferred paints
    this.deferredElements.forEach((timeout, element) => {
      clearTimeout(timeout);
      element.style.visibility = '';
    });
    this.deferredElements.clear();

    // Restore all animating elements
    this.animatingElements.forEach(element => {
      this.unmarkElementAsAnimating(element);
    });
    this.animatingElements.clear();
  }

  /**
   * Analyze an element to determine its paint characteristics
   */
  private analyzeElement(element: HTMLElement, isGlassComponent: boolean): GlassPaintAttributes {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    const hasBackdropFilter =
      isGlassComponent ||
      style.backdropFilter !== 'none' ||
      (style as any).webkitBackdropFilter !== 'none';

    const hasBoxShadow = style.boxShadow !== 'none';

    const hasComplexBorder =
      style.borderImage !== 'none' || style.borderRadius !== '0px' || style.border !== '0px none';

    const hasTransform = style.transform !== 'none';

    const pixelArea = rect.width * rect.height;

    const isVisible =
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0;

    const isAnimating =
      element.classList.contains('is-animating') ||
      style.animation !== 'none' ||
      style.transition !== 'none' ||
      this.animatingElements.has(element);

    const hasComplexBackground =
      style.backgroundImage !== 'none' ||
      style.background.includes('gradient') ||
      style.background.includes('url');

    const opacity = parseFloat(style.opacity);

    return {
      hasBackdropFilter,
      hasBoxShadow,
      hasComplexBorder,
      hasTransform,
      pixelArea,
      isVisible,
      isAnimating,
      hasComplexBackground,
      opacity,
    };
  }

  /**
   * Determine what optimizations to apply based on element attributes
   */
  private determineOptimizationActions(attributes: GlassPaintAttributes): PaintOptimizationActions {
    const actions: PaintOptimizationActions = {
      promoteToLayer: false,
      useTransform: true,
      simplifyEffectsDuringAnimation: false,
      deferPainting: false,
      useHardwareAcceleration: this.config.useHardwareAcceleration,
      reduceQualityDuringInteraction: false,
      cssOverrides: {},
    };

    // Determine if element should be promoted to its own layer
    if (this.config.managePaintLayers) {
      // Promote large elements with special effects to their own layers
      if (
        attributes.hasBackdropFilter ||
        (attributes.hasBoxShadow && attributes.pixelArea > 10000) ||
        (attributes.hasComplexBackground && attributes.pixelArea > 40000)
      ) {
        actions.promoteToLayer = true;
      }

      // Always promote animating elements
      if (attributes.isAnimating) {
        actions.promoteToLayer = true;
      }
    }

    // For animating elements, simplify effects during animation
    if (attributes.isAnimating && this.config.limitPaintDuringAnimation) {
      actions.simplifyEffectsDuringAnimation = true;
    }

    // Defer painting for offscreen elements that are less important
    if (!attributes.isVisible && this.config.deferNonEssentialPaints) {
      actions.deferPainting = true;
    }

    // Reduce quality during interactions for complex elements
    if (
      this.isScrolling ||
      (attributes.isAnimating &&
        (attributes.hasBackdropFilter ||
          attributes.hasBoxShadow ||
          attributes.hasComplexBackground))
    ) {
      actions.reduceQualityDuringInteraction = true;

      // Set specific CSS overrides for different effects
      if (attributes.hasBackdropFilter) {
        // Reduce blur strength during interaction
        actions.cssOverrides['backdropFilter'] = 'blur(5px)';
        actions.cssOverrides['webkitBackdropFilter'] = 'blur(5px)';
      }

      if (attributes.hasBoxShadow) {
        // Simplify box shadow during interaction
        actions.cssOverrides['boxShadow'] = '0 2px 8px rgba(0, 0, 0, 0.15)';
      }

      if (attributes.hasComplexBackground) {
        // Simplify or hide complex backgrounds during interaction
        if (this.config.optimizationLevel === OptimizationLevel.AGGRESSIVE) {
          actions.cssOverrides['backgroundImage'] = 'none';
        }
      }
    }

    return actions;
  }

  /**
   * Apply optimizations to an element based on determined actions
   */
  private applyOptimizations(
    element: HTMLElement,
    actions: PaintOptimizationActions,
    isGlassComponent: boolean
  ): void {
    // Apply hardware acceleration if needed
    if (actions.useHardwareAcceleration) {
      // Ensure we're using transform for hardware acceleration
      if (!element.style.transform || element.style.transform === 'none') {
        element.style.transform = 'translateZ(0)';
      }

      // Add backface visibility for better performance
      element.style.backfaceVisibility = 'hidden';
      // Add webkit prefix for Safari
      element.style.webkitBackfaceVisibility = 'hidden';
    }

    // Promote to layer if needed
    if (actions.promoteToLayer) {
      // Use specific will-change properties based on element type
      if (isGlassComponent) {
        element.style.willChange = 'transform, backdrop-filter, opacity';
      } else if (element.style.opacity !== '1') {
        element.style.willChange = 'transform, opacity';
      } else {
        element.style.willChange = 'transform';
      }
    }

    // Apply CSS overrides for quality reduction
    if (actions.reduceQualityDuringInteraction && this.isScrolling) {
      // Store original values if not already stored
      for (const [property, value] of Object.entries(actions.cssOverrides)) {
        const originalProperty = `data-original-${property}`;

        if (!element.hasAttribute(originalProperty)) {
          const currentValue = element.style.getPropertyValue(property);
          if (currentValue) {
            element.setAttribute(originalProperty, currentValue);
          }

          element.style.setProperty(property, value);
        }
      }

      // Mark as scroll-optimized
      element.setAttribute('data-scroll-optimized', 'true');
    }

    // Mark glass components for easier selection
    if (isGlassComponent) {
      element.setAttribute('data-glass-component', 'true');
    }
  }

  /**
   * Set up scroll event listener
   */
  private setupScrollListener(): void {
    if (typeof window === 'undefined' || this.scrollListenerActive) return;

    this.scrollListenerActive = true;

    // Bind the handler to maintain correct 'this' context
    this.handleScroll = this.handleScroll.bind(this);

    // Attach scroll listener
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  /**
   * Handle scroll events
   */
  private handleScroll = (): void => {
    // Update last scroll time
    this.lastScrollTime = Date.now();

    // Check if we're already in scrolling state
    if (!this.isScrolling) {
      this.optimizeForScroll(true);
    }

    // Use animation frame to check when scrolling stops
    if (this.animationFrameId === null) {
      this.checkScrollStop();
    }
  };

  /**
   * Check if scrolling has stopped
   */
  private checkScrollStop = (): void => {
    const now = Date.now();
    const timeSinceLastScroll = now - this.lastScrollTime;

    // If we haven't scrolled for some time, consider scrolling stopped
    if (timeSinceLastScroll > 100) {
      // 100ms threshold
      this.optimizeForScroll(false);
      this.animationFrameId = null;
      return;
    }

    // Continue checking
    this.animationFrameId = requestAnimationFrame(this.checkScrollStop);
  };

  /**
   * Apply scroll-specific optimizations to element
   */
  private optimizeElementForScroll(element: HTMLElement): void {
    if (!element) return;

    // Already optimized for scroll
    if (element.getAttribute('data-scroll-optimized') === 'true') {
      return;
    }

    // Store original backdrop-filter for glass components with proper webkit handling
    const backdropFilter =
      element.style.backdropFilter || (element.style as any).webkitBackdropFilter;
    if (backdropFilter && backdropFilter !== 'none') {
      element.setAttribute('data-original-backdrop-filter', backdropFilter);

      // Apply a reduced blur during scroll
      const match = backdropFilter.match(/blur\((\d+)px\)/);
      if (match) {
        const blurValue = parseInt(match[1], 10);
        const scrollBlur = Math.max(3, Math.round(blurValue * 0.6)); // Reduce to 60%

        const newFilter = backdropFilter.replace(/blur\((\d+)px\)/, `blur(${scrollBlur}px)`);

        // Apply to standard and webkit prefixed versions
        element.style.backdropFilter = newFilter;
        (element.style as any).webkitBackdropFilter = newFilter;
      }
    }

    // Simplify box shadows during scroll
    if (element.style.boxShadow && element.style.boxShadow !== 'none') {
      element.setAttribute('data-original-box-shadow', element.style.boxShadow);
      element.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    }

    // Add hardware acceleration
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'transform';

    // Mark as scroll-optimized
    element.setAttribute('data-scroll-optimized', 'true');
  }

  /**
   * Restore element to normal state after scroll
   */
  private restoreElementAfterScroll(element: HTMLElement): void {
    if (!element) return;

    // Restore original backdrop-filter
    const originalBackdropFilter = element.getAttribute('data-original-backdrop-filter');
    if (originalBackdropFilter) {
      element.style.backdropFilter = originalBackdropFilter;
      (element.style as any).webkitBackdropFilter = originalBackdropFilter;
      element.removeAttribute('data-original-backdrop-filter');
    }

    // Restore original box-shadow
    const originalBoxShadow = element.getAttribute('data-original-box-shadow');
    if (originalBoxShadow) {
      element.style.boxShadow = originalBoxShadow;
      element.removeAttribute('data-original-box-shadow');
    }

    // Reset will-change to avoid memory issues
    // Only if not currently being interacted with
    if (!element.matches(':hover, :active, :focus')) {
      element.style.willChange = 'auto';
    }

    // Remove scroll optimization marker
    element.removeAttribute('data-scroll-optimized');
  }

  /**
   * Check if an element is visible in viewport
   */
  private isElementVisible(element: HTMLElement): boolean {
    if (!element) return false;

    const rect = element.getBoundingClientRect();

    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }
}

/**
 * Global paint optimizer instance for shared use
 */
export const globalPaintOptimizer = typeof window !== 'undefined' ? new PaintOptimizer() : null;

/**
 * Create a new paint optimizer with custom configuration
 */
export const createPaintOptimizer = (config?: PaintOptimizationConfig): PaintOptimizer => {
  return new PaintOptimizer(config);
};

/**
 * Utility to mark element as currently animating
 */
export const markAsAnimating = (element: HTMLElement, duration = 300): void => {
  if (globalPaintOptimizer) {
    globalPaintOptimizer.markElementAsAnimating(element, duration);
  }
};

/**
 * Utility to optimize element for painting
 */
export const optimizeForPainting = (element: HTMLElement, isGlassComponent = false): void => {
  if (globalPaintOptimizer) {
    globalPaintOptimizer.optimizeElement(element, isGlassComponent);
  }
};
