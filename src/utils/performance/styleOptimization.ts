/**
 * Style Optimization Utilities
 *
 * Advanced style optimization utilities for Glass UI components
 * to maximize rendering performance and minimize reflows.
 */
import { DeviceCapabilityTier, getDeviceCapabilityTier } from '../deviceCapabilities';
import { OptimizationLevel } from '../performanceOptimizations';

import { globalStyleCache } from './styleCache';

/**
 * CSS property optimization strategy
 */
export enum PropertyOptimizationStrategy {
  /** Keep property as is */
  KEEP = 'keep',

  /** Remove property entirely */
  REMOVE = 'remove',

  /** Simplify property value */
  SIMPLIFY = 'simplify',

  /** Replace with more performant alternative */
  REPLACE = 'replace',

  /** Convert to hardware-accelerated property */
  HARDWARE_ACCELERATE = 'hardware-accelerate',
}

/**
 * Style optimization configuration
 */
export interface StyleOptimizationConfig {
  /** Current device capability tier */
  deviceTier?: DeviceCapabilityTier;

  /** Current optimization level */
  optimizationLevel?: OptimizationLevel;

  /** Minimum FPS target */
  targetFps?: number;

  /** Whether to use GPU acceleration */
  useGpuAcceleration?: boolean;

  /** Whether to use will-change hints */
  useWillChange?: boolean;

  /** Whether to optimize animations */
  optimizeAnimations?: boolean;

  /** Whether to reduce visual effects */
  reduceVisualEffects?: boolean;

  /** Whether to enable grouping of properties */
  enableGrouping?: boolean;

  /** Whether to optimize shadow rendering */
  optimizeShadows?: boolean;

  /** Whether to optimize glass effects */
  optimizeGlassEffects?: boolean;

  /** Minimum blur strength to preserve */
  minBlurStrength?: number;

  /** Whether to optimize border effects */
  optimizeBorders?: boolean;

  /** Whether to disable transitions on low-end devices */
  disableTransitionsOnLowEnd?: boolean;

  /** Whether to cache optimized styles */
  cacheStyles?: boolean;
}

/**
 * Default style optimization configuration
 */
const DEFAULT_CONFIG: Required<StyleOptimizationConfig> = {
  deviceTier: DeviceCapabilityTier.MEDIUM,
  optimizationLevel: OptimizationLevel.NONE,
  targetFps: 60,
  useGpuAcceleration: true,
  useWillChange: true,
  optimizeAnimations: true,
  reduceVisualEffects: false,
  enableGrouping: true,
  optimizeShadows: true,
  optimizeGlassEffects: true,
  minBlurStrength: 3,
  optimizeBorders: true,
  disableTransitionsOnLowEnd: true,
  cacheStyles: true,
};

/**
 * CSS properties to optimize for performance
 */
export const PERFORMANCE_IMPACTING_PROPERTIES = [
  'backdrop-filter',
  'box-shadow',
  'text-shadow',
  'filter',
  'opacity',
  'transform',
  'animation',
  'transition',
  'border-radius',
  'background-image',
  'mask-image',
  'clip-path',
  'perspective',
  'background-blend-mode',
  'mix-blend-mode',
  'border-image',
];

/**
 * CSS properties that benefit from GPU acceleration
 */
export const GPU_ACCELERATED_PROPERTIES = ['transform', 'opacity', 'filter', 'backdrop-filter'];

/**
 * CSS properties to add to will-change for animation
 */
export const WILL_CHANGE_CANDIDATES = ['transform', 'opacity', 'backdrop-filter', 'filter'];

/**
 * Style optimization rules for different device tiers
 */
const TIER_SPECIFIC_RULES: Record<
  DeviceCapabilityTier,
  Record<string, PropertyOptimizationStrategy>
> = {
  [DeviceCapabilityTier.ULTRA]: {
    // No optimizations needed for ultra-high-end devices
  },

  [DeviceCapabilityTier.HIGH]: {
    // Minor optimizations for high-end devices
    'box-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    'text-shadow': PropertyOptimizationStrategy.SIMPLIFY,
  },

  [DeviceCapabilityTier.MEDIUM]: {
    // Moderate optimizations for medium-tier devices
    'box-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    'text-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    filter: PropertyOptimizationStrategy.SIMPLIFY,
    'backdrop-filter': PropertyOptimizationStrategy.SIMPLIFY,
    'background-image': PropertyOptimizationStrategy.SIMPLIFY,
    'border-image': PropertyOptimizationStrategy.REMOVE,
  },

  [DeviceCapabilityTier.LOW]: {
    // Aggressive optimizations for low-end devices
    'box-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    'text-shadow': PropertyOptimizationStrategy.REMOVE,
    filter: PropertyOptimizationStrategy.SIMPLIFY,
    'backdrop-filter': PropertyOptimizationStrategy.SIMPLIFY,
    'background-image': PropertyOptimizationStrategy.SIMPLIFY,
    animation: PropertyOptimizationStrategy.SIMPLIFY,
    transition: PropertyOptimizationStrategy.SIMPLIFY,
    'border-image': PropertyOptimizationStrategy.REMOVE,
    'mask-image': PropertyOptimizationStrategy.REMOVE,
    'clip-path': PropertyOptimizationStrategy.REMOVE,
    perspective: PropertyOptimizationStrategy.REMOVE,
    'background-blend-mode': PropertyOptimizationStrategy.REMOVE,
    'mix-blend-mode': PropertyOptimizationStrategy.REMOVE,
  },

  [DeviceCapabilityTier.MINIMAL]: {
    // Maximum optimizations for minimal devices
    'box-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    'text-shadow': PropertyOptimizationStrategy.REMOVE,
    filter: PropertyOptimizationStrategy.SIMPLIFY,
    'backdrop-filter': PropertyOptimizationStrategy.SIMPLIFY,
    'background-image': PropertyOptimizationStrategy.SIMPLIFY,
    animation: PropertyOptimizationStrategy.REMOVE,
    transition: PropertyOptimizationStrategy.REMOVE,
    'border-image': PropertyOptimizationStrategy.REMOVE,
    'mask-image': PropertyOptimizationStrategy.REMOVE,
    'clip-path': PropertyOptimizationStrategy.REMOVE,
    perspective: PropertyOptimizationStrategy.REMOVE,
    'background-blend-mode': PropertyOptimizationStrategy.REMOVE,
    'mix-blend-mode': PropertyOptimizationStrategy.REMOVE,
    'border-radius': PropertyOptimizationStrategy.SIMPLIFY,
  },
};

/**
 * Optimization rules for different optimization levels
 */
const LEVEL_SPECIFIC_RULES: Record<
  OptimizationLevel,
  Record<string, PropertyOptimizationStrategy>
> = {
  [OptimizationLevel.NONE]: {
    // No optimizations
  },

  [OptimizationLevel.LIGHT]: {
    // Light optimizations
    'box-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    'text-shadow': PropertyOptimizationStrategy.SIMPLIFY,
  },

  [OptimizationLevel.MODERATE]: {
    // Moderate optimizations
    'box-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    'text-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    filter: PropertyOptimizationStrategy.SIMPLIFY,
    'backdrop-filter': PropertyOptimizationStrategy.SIMPLIFY,
    'background-image': PropertyOptimizationStrategy.SIMPLIFY,
    'border-image': PropertyOptimizationStrategy.REMOVE,
    animation: PropertyOptimizationStrategy.SIMPLIFY,
    transition: PropertyOptimizationStrategy.SIMPLIFY,
  },

  [OptimizationLevel.AGGRESSIVE]: {
    // Aggressive optimizations
    'box-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    'text-shadow': PropertyOptimizationStrategy.REMOVE,
    filter: PropertyOptimizationStrategy.SIMPLIFY,
    'backdrop-filter': PropertyOptimizationStrategy.SIMPLIFY,
    'background-image': PropertyOptimizationStrategy.SIMPLIFY,
    animation: PropertyOptimizationStrategy.SIMPLIFY,
    transition: PropertyOptimizationStrategy.SIMPLIFY,
    'border-image': PropertyOptimizationStrategy.REMOVE,
    'mask-image': PropertyOptimizationStrategy.REMOVE,
    'clip-path': PropertyOptimizationStrategy.REMOVE,
    'background-blend-mode': PropertyOptimizationStrategy.REMOVE,
    'mix-blend-mode': PropertyOptimizationStrategy.REMOVE,
  },

  [OptimizationLevel.MAXIMUM]: {
    // Maximum optimizations
    'box-shadow': PropertyOptimizationStrategy.SIMPLIFY,
    'text-shadow': PropertyOptimizationStrategy.REMOVE,
    filter: PropertyOptimizationStrategy.SIMPLIFY,
    'backdrop-filter': PropertyOptimizationStrategy.SIMPLIFY,
    'background-image': PropertyOptimizationStrategy.SIMPLIFY,
    animation: PropertyOptimizationStrategy.REMOVE,
    transition: PropertyOptimizationStrategy.REMOVE,
    'border-image': PropertyOptimizationStrategy.REMOVE,
    'mask-image': PropertyOptimizationStrategy.REMOVE,
    'clip-path': PropertyOptimizationStrategy.REMOVE,
    perspective: PropertyOptimizationStrategy.REMOVE,
    'background-blend-mode': PropertyOptimizationStrategy.REMOVE,
    'mix-blend-mode': PropertyOptimizationStrategy.REMOVE,
    'border-radius': PropertyOptimizationStrategy.SIMPLIFY,
  },
};

/**
 * Style optimization utility class
 */
export class StyleOptimizer {
  private config: Required<StyleOptimizationConfig>;

  /**
   * Create a new style optimizer
   */
  constructor(config: StyleOptimizationConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      deviceTier: config.deviceTier || getDeviceCapabilityTier(),
    };
  }

  /**
   * Optimize CSS text
   */
  public optimizeCss(cssText: string): string {
    if (!cssText) return cssText;

    // Check cache if enabled
    if (this.config.cacheStyles) {
      const cacheKey = `style-optimizer:${cssText}:${this.config.deviceTier}:${this.config.optimizationLevel}`;
      const cached = globalStyleCache.get(cacheKey);

      if (cached) {
        return cached;
      }
    }

    // Extract CSS rules
    let rules: {
      property: string;
      value: string;
    }[] = this.extractCssRules(cssText);

    // Apply optimization rules
    rules = this.optimizeRules(rules);

    // Add hardware acceleration if configured
    rules = this.addHardwareAcceleration(rules);

    // Group similar properties
    if (this.config.enableGrouping) {
      rules = this.groupProperties(rules);
    }

    // Generate optimized CSS
    const optimizedCss = this.generateCss(rules);

    // Cache if enabled
    if (this.config.cacheStyles) {
      const cacheKey = `style-optimizer:${cssText}:${this.config.deviceTier}:${this.config.optimizationLevel}`;
      globalStyleCache.set(cacheKey, optimizedCss, 'StyleOptimizer', false);
    }

    return optimizedCss;
  }

  /**
   * Optimize glass component specific styles
   */
  public optimizeGlassStyles(cssText: string): string {
    if (!cssText || !this.config.optimizeGlassEffects) return cssText;

    // Check cache if enabled
    if (this.config.cacheStyles) {
      const cacheKey = `glass-optimizer:${cssText}:${this.config.deviceTier}:${this.config.optimizationLevel}`;
      const cached = globalStyleCache.get(cacheKey);

      if (cached) {
        return cached;
      }
    }

    // Extract CSS rules
    let rules = this.extractCssRules(cssText);

    // Special glass-specific optimizations
    rules = rules.map(rule => {
      // Optimize backdrop-filter
      if (rule.property === 'backdrop-filter' || rule.property === '-webkit-backdrop-filter') {
        rule.value = this.optimizeBackdropFilter(rule.value);
      }

      // Optimize box-shadow for glass
      if (rule.property === 'box-shadow') {
        rule.value = this.optimizeBoxShadow(rule.value);
      }

      // Optimize background-color opacity
      if (rule.property === 'background-color' && rule.value.includes('rgba')) {
        rule.value = this.optimizeBackgroundOpacity(rule.value);
      }

      // Optimize border if needed
      if (this.config.optimizeBorders && rule.property.startsWith('border')) {
        rule.value = this.optimizeBorder(rule.value, rule.property);
      }

      return rule;
    });

    // Add hardware acceleration specifically for glass components
    rules = this.addGlassHardwareAcceleration(rules);

    // Prevent will-change overuse
    const hasWillChange = rules.some(r => r.property === 'will-change');
    const hasTransform = rules.some(r => r.property === 'transform');

    if (!hasWillChange && hasTransform && this.config.useWillChange) {
      rules.push({
        property: 'will-change',
        value: 'transform, opacity',
      });
    }

    // Generate optimized CSS
    const optimizedCss = this.generateCss(rules);

    // Cache if enabled
    if (this.config.cacheStyles) {
      const cacheKey = `glass-optimizer:${cssText}:${this.config.deviceTier}:${this.config.optimizationLevel}`;
      globalStyleCache.set(cacheKey, optimizedCss, 'GlassStyleOptimizer', true);
    }

    return optimizedCss;
  }

  /**
   * Optimize BackdropFilter value
   */
  public optimizeBackdropFilter(value: string): string {
    // Early return if not optimizing glass or no value
    if (!value || !this.config.optimizeGlassEffects) return value;

    // Extract blur value
    const blurMatch = value.match(/blur\((\d+)px\)/);
    if (!blurMatch) return value;

    const blurValue = parseInt(blurMatch[1], 10);

    // Adjust blur based on device tier and optimization level
    let newBlurValue = blurValue;

    switch (this.config.deviceTier) {
      case DeviceCapabilityTier.LOW:
        newBlurValue = Math.min(blurValue, 8);
        break;
      case DeviceCapabilityTier.MINIMAL:
        newBlurValue = Math.min(blurValue, 5);
        break;
    }

    // Further adjust based on optimization level
    if (this.config.optimizationLevel === OptimizationLevel.AGGRESSIVE) {
      newBlurValue = Math.min(newBlurValue, 6);
    } else if (this.config.optimizationLevel === OptimizationLevel.MAXIMUM) {
      newBlurValue = Math.min(newBlurValue, 4);
    }

    // Ensure minimum blur strength
    newBlurValue = Math.max(newBlurValue, this.config.minBlurStrength);

    // Replace the blur value
    return value.replace(/blur\(\d+px\)/, `blur(${newBlurValue}px)`);
  }

  /**
   * Optimize box-shadow value
   */
  public optimizeBoxShadow(value: string): string {
    // Early return if not optimizing shadows or no value
    if (!value || !this.config.optimizeShadows) return value;

    // Skip values that are already 'none'
    if (value === 'none') return value;

    // Simplify complex shadows based on device tier and optimization level
    if (value.includes(',')) {
      // Multiple shadows - determine how many to keep
      const shadows = value.split(',').map(s => s.trim());

      let shadowsToKeep = shadows.length;

      switch (this.config.deviceTier) {
        case DeviceCapabilityTier.HIGH:
          shadowsToKeep = Math.min(shadowsToKeep, 3);
          break;
        case DeviceCapabilityTier.MEDIUM:
          shadowsToKeep = Math.min(shadowsToKeep, 2);
          break;
        case DeviceCapabilityTier.LOW:
        case DeviceCapabilityTier.MINIMAL:
          shadowsToKeep = 1;
          break;
      }

      // Further reduce based on optimization level
      if (this.config.optimizationLevel === OptimizationLevel.AGGRESSIVE) {
        shadowsToKeep = 1;
      } else if (this.config.optimizationLevel === OptimizationLevel.MAXIMUM) {
        // For maximum optimization level, consider removing shadow entirely
        // or using a very simple one
        return '0 2px 4px rgba(0, 0, 0, 0.15)';
      }

      // Keep most important shadows (usually the first ones)
      let simplifiedShadows = shadows.slice(0, shadowsToKeep);

      if (simplifiedShadows.length < shadows.length) {
        // If we removed any shadows, further simplify the remaining ones
        simplifiedShadows = simplifiedShadows.map(shadow => {
          // Match parts of the shadow value
          const parts = shadow.match(
            /([^)]+\))?\s*([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px(\s+([-\d.]+)px)?\s+([^)]+)$/
          );

          if (!parts) return shadow;

          // Extract shadow components
          const colorPrefix = parts[1] || '';
          const xOffset = parseFloat(parts[2]);
          const yOffset = parseFloat(parts[3]);
          const blur = parseFloat(parts[4]);
          const spread = parts[6] ? parseFloat(parts[6]) : 0;
          const color = parts[7];

          // Simplify blur radius
          const newBlur = Math.min(blur, 10);

          // Construct simplified shadow
          if (spread !== 0) {
            return `${colorPrefix} ${xOffset}px ${yOffset}px ${newBlur}px ${spread}px ${color}`;
          } else {
            return `${colorPrefix} ${xOffset}px ${yOffset}px ${newBlur}px ${color}`;
          }
        });
      }

      return simplifiedShadows.join(', ');
    }

    // Single shadow - simplify if needed
    if (
      this.config.optimizationLevel === OptimizationLevel.MAXIMUM ||
      this.config.deviceTier === DeviceCapabilityTier.MINIMAL
    ) {
      // Simplify single shadow
      const parts = value.match(
        /([^)]+\))?\s*([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px(\s+([-\d.]+)px)?\s+([^)]+)$/
      );

      if (parts) {
        const colorPrefix = parts[1] || '';
        const xOffset = parseFloat(parts[2]);
        const yOffset = parseFloat(parts[3]);
        const blur = parseFloat(parts[4]);
        const spread = parts[6] ? parseFloat(parts[6]) : 0;
        const color = parts[7];

        // Simplify blur radius
        const newBlur = Math.min(blur, 6);

        // Remove spread for maximum simplification
        if (this.config.optimizationLevel === OptimizationLevel.MAXIMUM) {
          return `${colorPrefix} ${xOffset}px ${yOffset}px ${newBlur}px ${color}`;
        }

        if (spread !== 0) {
          return `${colorPrefix} ${xOffset}px ${yOffset}px ${newBlur}px ${Math.min(
            spread,
            2
          )}px ${color}`;
        } else {
          return `${colorPrefix} ${xOffset}px ${yOffset}px ${newBlur}px ${color}`;
        }
      }
    }

    return value;
  }

  /**
   * Optimize background opacity for glass effects
   */
  public optimizeBackgroundOpacity(value: string): string {
    if (!value.includes('rgba')) return value;

    // Match rgba pattern
    const match = value.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
    if (!match) return value;

    // Extract components
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    let alpha = parseFloat(match[4]);

    // Adjust opacity based on device tier and optimization level
    if (
      this.config.deviceTier === DeviceCapabilityTier.LOW ||
      this.config.optimizationLevel === OptimizationLevel.AGGRESSIVE
    ) {
      // Increase opacity for low-end devices or aggressive optimization
      alpha = Math.min(alpha + 0.1, 0.95);
    } else if (
      this.config.deviceTier === DeviceCapabilityTier.MINIMAL ||
      this.config.optimizationLevel === OptimizationLevel.MAXIMUM
    ) {
      // Significantly increase opacity for minimal devices or maximum optimization
      alpha = Math.min(alpha + 0.2, 0.95);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
  }

  /**
   * Optimize border properties
   */
  public optimizeBorder(value: string, property: string): string {
    // Skip if not optimizing borders
    if (!this.config.optimizeBorders) return value;

    // For minimal devices or maximum optimization, simplify all borders
    if (
      this.config.deviceTier === DeviceCapabilityTier.MINIMAL ||
      this.config.optimizationLevel === OptimizationLevel.MAXIMUM
    ) {
      // If it's a border-radius property, reduce the value
      if (property === 'border-radius') {
        // Parse the value
        const match = value.match(/(\d+)(px|rem|em|%)/);
        if (match) {
          const radius = Math.min(parseInt(match[1], 10), 8); // Cap at 8px or equivalent
          return `${radius}${match[2]}`;
        }
      }

      // For border-image, remove it entirely
      if (property === 'border-image') {
        return 'none';
      }

      // For complex borders (multiple values), simplify
      if (value.includes(',') || value.includes('gradient')) {
        if (property === 'border') {
          return '1px solid rgba(255, 255, 255, 0.2)';
        } else if (property.startsWith('border-')) {
          return property.includes('width')
            ? '1px'
            : property.includes('style')
            ? 'solid'
            : property.includes('color')
            ? 'rgba(255, 255, 255, 0.2)'
            : value;
        }
      }
    }

    return value;
  }

  /**
   * Extract CSS rules from a CSS text string
   */
  private extractCssRules(cssText: string): { property: string; value: string }[] {
    // Parse CSS text
    const rules: { property: string; value: string }[] = [];

    // Split into individual rules
    const ruleRegex = /([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
    let match;

    while ((match = ruleRegex.exec(cssText)) !== null) {
      rules.push({
        property: match[1].trim(),
        value: match[2].trim(),
      });
    }

    return rules;
  }

  /**
   * Apply optimization rules to CSS rules
   */
  private optimizeRules(
    rules: { property: string; value: string }[]
  ): { property: string; value: string }[] {
    // Get combined rules from device tier and optimization level
    const tierRules = TIER_SPECIFIC_RULES[this.config.deviceTier] || {};
    const levelRules = LEVEL_SPECIFIC_RULES[this.config.optimizationLevel] || {};

    // Combined rules, with level taking precedence
    const combinedRules = { ...tierRules, ...levelRules };

    // Apply optimization strategies to each rule
    return rules.filter(rule => {
      // Check if this property has an optimization strategy
      const strategy = combinedRules[rule.property];

      if (!strategy) {
        // No strategy, keep the rule as is
        return true;
      }

      switch (strategy) {
        case PropertyOptimizationStrategy.KEEP:
          return true;

        case PropertyOptimizationStrategy.REMOVE:
          return false;

        case PropertyOptimizationStrategy.SIMPLIFY:
          // Apply property-specific simplification
          if (rule.property === 'box-shadow') {
            rule.value = this.optimizeBoxShadow(rule.value);
          } else if (
            rule.property === 'backdrop-filter' ||
            rule.property === '-webkit-backdrop-filter'
          ) {
            rule.value = this.optimizeBackdropFilter(rule.value);
          } else if (rule.property === 'animation' || rule.property === 'transition') {
            rule.value = this.simplifyAnimation(rule.value);
          } else if (rule.property === 'background-image') {
            rule.value = this.simplifyBackgroundImage(rule.value);
          } else if (rule.property === 'border-radius') {
            rule.value = this.simplifyBorderRadius(rule.value);
          } else if (rule.property === 'filter') {
            rule.value = this.simplifyFilter(rule.value);
          }
          return true;

        case PropertyOptimizationStrategy.REPLACE:
          // Handle property replacements
          // This would be implemented based on specific needs
          return true;

        case PropertyOptimizationStrategy.HARDWARE_ACCELERATE:
          // Will be handled separately
          return true;

        default:
          return true;
      }
    });
  }

  /**
   * Add hardware acceleration properties
   */
  private addHardwareAcceleration(
    rules: { property: string; value: string }[]
  ): { property: string; value: string }[] {
    if (!this.config.useGpuAcceleration) {
      return rules;
    }

    // Check if transform is already present
    const hasTransform = rules.some(rule => rule.property === 'transform');

    // Add transform for hardware acceleration if not present
    if (!hasTransform) {
      rules.push({
        property: 'transform',
        value: 'translateZ(0)',
      });
    }

    // Check if backface-visibility is already set
    const hasBackfaceVisibility = rules.some(rule => rule.property === 'backface-visibility');

    // Add backface-visibility for better performance
    if (!hasBackfaceVisibility) {
      rules.push({
        property: 'backface-visibility',
        value: 'hidden',
      });
    }

    // Only add will-change if configured and not already present
    if (this.config.useWillChange) {
      const hasWillChange = rules.some(rule => rule.property === 'will-change');

      if (!hasWillChange) {
        // Determine which properties to include in will-change
        const willChangeProps: string[] = [];

        // Check which properties are being used that benefit from will-change
        WILL_CHANGE_CANDIDATES.forEach(prop => {
          if (rules.some(rule => rule.property === prop)) {
            willChangeProps.push(prop);
          }
        });

        // Only add transform as a default if nothing else is found
        if (willChangeProps.length === 0) {
          willChangeProps.push('transform');
        }

        // Limit to at most 2 properties to avoid overuse
        const limitedProps = willChangeProps.slice(0, 2).join(', ');

        rules.push({
          property: 'will-change',
          value: limitedProps,
        });
      }
    }

    return rules;
  }

  /**
   * Add glass-specific hardware acceleration
   */
  private addGlassHardwareAcceleration(
    rules: { property: string; value: string }[]
  ): { property: string; value: string }[] {
    if (!this.config.useGpuAcceleration) {
      return rules;
    }

    // Check if transform is already present
    const hasTransform = rules.some(rule => rule.property === 'transform');

    // Add transform for hardware acceleration if not present
    if (!hasTransform) {
      rules.push({
        property: 'transform',
        value: 'translateZ(0)',
      });
    }

    // Since this is specifically for glass effects, also add will-change
    if (this.config.useWillChange) {
      const hasWillChange = rules.some(rule => rule.property === 'will-change');

      if (!hasWillChange) {
        // For glass, we want to optimize backdrop-filter and opacity
        const hasBackdropFilter = rules.some(
          rule => rule.property === 'backdrop-filter' || rule.property === '-webkit-backdrop-filter'
        );

        if (hasBackdropFilter) {
          rules.push({
            property: 'will-change',
            value: 'transform, backdrop-filter',
          });
        } else {
          rules.push({
            property: 'will-change',
            value: 'transform, opacity',
          });
        }
      }
    }

    return rules;
  }

  /**
   * Group similar properties for better performance
   */
  private groupProperties(
    rules: { property: string; value: string }[]
  ): { property: string; value: string }[] {
    // We want to group certain properties:
    //  - All margin properties (margin-top, margin-right, etc.) into a single margin
    //  - All padding properties into a single padding
    //  - All border properties when possible
    //  - All background properties when possible

    // Skip if grouping is disabled
    if (!this.config.enableGrouping) {
      return rules;
    }

    // Prepare grouped rules
    const grouped: { property: string; value: string }[] = [];

    // Temporary property groups
    const margins: Record<string, string> = {};
    const paddings: Record<string, string> = {};
    const borders: Record<string, string> = {};
    const backgrounds: Record<string, string> = {};

    // Group by property category
    rules.forEach(rule => {
      if (rule.property.startsWith('margin-')) {
        const side = rule.property.substring(7);
        margins[side] = rule.value;
      } else if (rule.property.startsWith('padding-')) {
        const side = rule.property.substring(8);
        paddings[side] = rule.value;
      } else if (
        rule.property.startsWith('border-') &&
        !rule.property.includes('radius') &&
        !rule.property.includes('image')
      ) {
        const part = rule.property.substring(7);
        borders[part] = rule.value;
      } else if (rule.property.startsWith('background-') && rule.property !== 'background') {
        const part = rule.property.substring(11);
        backgrounds[part] = rule.value;
      } else {
        // Keep other rules as they are
        grouped.push(rule);
      }
    });

    // Process margin group
    if (Object.keys(margins).length > 1) {
      // Try to create shorthand margin
      const top = margins.top || '0';
      const right = margins.right || margins.left || '0';
      const bottom = margins.bottom || margins.top || '0';
      const left = margins.left || margins.right || '0';

      // Check if we can use even shorter shorthands
      if (top === right && right === bottom && bottom === left) {
        // All sides are the same, use single value
        grouped.push({ property: 'margin', value: top });
      } else if (top === bottom && right === left) {
        // Vertical/horizontal pairs
        grouped.push({ property: 'margin', value: `${top} ${right}` });
      } else {
        // Full 4-value shorthand
        grouped.push({ property: 'margin', value: `${top} ${right} ${bottom} ${left}` });
      }
    } else {
      // No grouping possible, add individual margins back
      Object.entries(margins).forEach(([side, value]) => {
        grouped.push({ property: `margin-${side}`, value });
      });
    }

    // Process padding group
    if (Object.keys(paddings).length > 1) {
      // Try to create shorthand padding
      const top = paddings.top || '0';
      const right = paddings.right || paddings.left || '0';
      const bottom = paddings.bottom || paddings.top || '0';
      const left = paddings.left || paddings.right || '0';

      // Check if we can use even shorter shorthands
      if (top === right && right === bottom && bottom === left) {
        // All sides are the same, use single value
        grouped.push({ property: 'padding', value: top });
      } else if (top === bottom && right === left) {
        // Vertical/horizontal pairs
        grouped.push({ property: 'padding', value: `${top} ${right}` });
      } else {
        // Full 4-value shorthand
        grouped.push({ property: 'padding', value: `${top} ${right} ${bottom} ${left}` });
      }
    } else {
      // No grouping possible, add individual paddings back
      Object.entries(paddings).forEach(([side, value]) => {
        grouped.push({ property: `padding-${side}`, value });
      });
    }

    // Process border group - this is more complex, so we only group simple cases
    const borderWidthProps = ['top-width', 'right-width', 'bottom-width', 'left-width'];
    const borderStyleProps = ['top-style', 'right-style', 'bottom-style', 'left-style'];
    const borderColorProps = ['top-color', 'right-color', 'bottom-color', 'left-color'];

    // Check if we have a complete set of width, style, color
    const hasWidthSet = borderWidthProps.every(p => borders[p]);
    const hasStyleSet = borderStyleProps.every(p => borders[p]);
    const hasColorSet = borderColorProps.every(p => borders[p]);

    // Check if all values are the same
    const allWidthsSame = hasWidthSet && new Set(borderWidthProps.map(p => borders[p])).size === 1;
    const allStylesSame = hasStyleSet && new Set(borderStyleProps.map(p => borders[p])).size === 1;
    const allColorsSame = hasColorSet && new Set(borderColorProps.map(p => borders[p])).size === 1;

    // Only use border shorthand if all values are the same
    if (allWidthsSame && allStylesSame && allColorsSame) {
      grouped.push({
        property: 'border',
        value: `${borders['top-width']} ${borders['top-style']} ${borders['top-color']}`,
      });
    } else if (allWidthsSame) {
      grouped.push({ property: 'border-width', value: borders['top-width'] });
    } else if (allStylesSame) {
      grouped.push({ property: 'border-style', value: borders['top-style'] });
    } else if (allColorsSame) {
      grouped.push({ property: 'border-color', value: borders['top-color'] });
    } else {
      // Can't group, add individual borders back
      Object.entries(borders).forEach(([part, value]) => {
        grouped.push({ property: `border-${part}`, value });
      });
    }

    // Process background group - more complex, only combine simple cases
    // If we have both color and image, can combine into background shorthand
    if (backgrounds.color && backgrounds.image) {
      grouped.push({
        property: 'background',
        value: `${backgrounds.color} ${backgrounds.image} ${backgrounds.position || '0 0'} ${
          backgrounds.repeat || 'no-repeat'
        }`,
      });
    } else {
      // Add individual background properties back
      Object.entries(backgrounds).forEach(([part, value]) => {
        grouped.push({ property: `background-${part}`, value });
      });
    }

    return grouped;
  }

  /**
   * Simplify animation properties
   */
  private simplifyAnimation(value: string): string {
    // If animations are disabled for low-end devices, return 'none'
    if (
      this.config.disableTransitionsOnLowEnd &&
      (this.config.deviceTier === DeviceCapabilityTier.MINIMAL ||
        this.config.optimizationLevel === OptimizationLevel.MAXIMUM)
    ) {
      return 'none';
    }

    // For multiple animations separated by commas, just keep the first one
    if (value.includes(',')) {
      return value.split(',')[0].trim();
    }

    // Split into parts (name, duration, timing-function, etc.)
    const parts = value.split(/\s+/);

    // Simplify timing function if it's a complex cubic-bezier
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith('cubic-bezier')) {
        // Replace with a simpler timing function
        parts[i] = 'ease-out';
      }
    }

    // Reduce animation duration for low-end devices
    if (parts.length >= 2 && parts[1].endsWith('s')) {
      // Parse the duration
      const duration = parseFloat(parts[1]);
      if (!isNaN(duration)) {
        // Reduce based on device tier
        let multiplier = 1;

        if (
          this.config.deviceTier === DeviceCapabilityTier.LOW ||
          this.config.optimizationLevel === OptimizationLevel.AGGRESSIVE
        ) {
          multiplier = 0.75; // 25% shorter
        } else if (
          this.config.deviceTier === DeviceCapabilityTier.MINIMAL ||
          this.config.optimizationLevel === OptimizationLevel.MAXIMUM
        ) {
          multiplier = 0.5; // 50% shorter
        }

        parts[1] = `${(duration * multiplier).toFixed(2)}s`;
      }
    }

    // Rejoin the parts
    return parts.join(' ');
  }

  /**
   * Simplify background image property
   */
  private simplifyBackgroundImage(value: string): string {
    // Handle gradients
    if (value.includes('gradient')) {
      // Simplify complex gradients
      if (value.includes(',')) {
        // Multiple color stops, simplify to just a few
        if (value.includes('linear-gradient')) {
          // Extract angle and color stops
          const match = value.match(/linear-gradient\((.*)\)/);
          if (match) {
            const gradient = match[1];
            const parts = gradient.split(',');

            // If there are many color stops, reduce them
            if (parts.length > 4) {
              // Keep first (angle), first color, and last color
              const simplified = `linear-gradient(${parts[0]}, ${parts[1]}, ${
                parts[parts.length - 1]
              })`;
              return simplified;
            }
          }
        } else if (value.includes('radial-gradient')) {
          // Similar simplification for radial gradients
          const match = value.match(/radial-gradient\((.*)\)/);
          if (match) {
            const gradient = match[1];
            const parts = gradient.split(',');

            // If there are many color stops, reduce them
            if (parts.length > 4) {
              // Keep first (shape/size), first color, and last color
              const simplified = `radial-gradient(${parts[0]}, ${parts[1]}, ${
                parts[parts.length - 1]
              })`;
              return simplified;
            }
          }
        }
      }
    }

    return value;
  }

  /**
   * Simplify border radius property
   */
  private simplifyBorderRadius(value: string): string {
    // If multiple values (more than one radius), simplify
    if (value.includes(' ')) {
      const radii = value.split(/\s+/);
      if (radii.length > 1) {
        // Just use the first value for all corners
        return radii[0];
      }
    }

    // Cap maximum radius for low-end devices
    if (
      this.config.deviceTier === DeviceCapabilityTier.LOW ||
      this.config.optimizationLevel === OptimizationLevel.AGGRESSIVE
    ) {
      // Parse the value
      const match = value.match(/(\d+)(px|rem|em|%)/);
      if (match) {
        const radius = parseInt(match[1], 10);
        if (radius > 12) {
          return `12${match[2]}`;
        }
      }
    } else if (
      this.config.deviceTier === DeviceCapabilityTier.MINIMAL ||
      this.config.optimizationLevel === OptimizationLevel.MAXIMUM
    ) {
      // Even smaller radius for minimal devices
      const match = value.match(/(\d+)(px|rem|em|%)/);
      if (match) {
        const radius = parseInt(match[1], 10);
        if (radius > 8) {
          return `8${match[2]}`;
        }
      }
    }

    return value;
  }

  /**
   * Simplify filter property
   */
  private simplifyFilter(value: string): string {
    // For none or empty values, return as is
    if (!value || value === 'none') return value;

    // Handle multiple filters
    if (value.includes(' ')) {
      // Split into individual filters
      const filters = value.split(/\s+/).filter(f => f.trim());

      // For low-end devices, limit the number of filters
      if (
        this.config.deviceTier === DeviceCapabilityTier.LOW ||
        this.config.optimizationLevel === OptimizationLevel.AGGRESSIVE
      ) {
        // Keep only the most important filter
        if (filters.length > 1) {
          // Prioritize blur and opacity filters
          const blurFilter = filters.find(f => f.startsWith('blur'));
          const opacityFilter = filters.find(f => f.startsWith('opacity'));

          if (blurFilter) {
            return blurFilter;
          } else if (opacityFilter) {
            return opacityFilter;
          } else {
            return filters[0];
          }
        }
      } else if (
        this.config.deviceTier === DeviceCapabilityTier.MINIMAL ||
        this.config.optimizationLevel === OptimizationLevel.MAXIMUM
      ) {
        // For minimal devices, remove filters entirely or use just one
        if (filters.some(f => f.startsWith('blur'))) {
          // Simplify blur filter
          const blurFilter = filters.find(f => f.startsWith('blur'));
          if (blurFilter) {
            const match = blurFilter.match(/blur\((\d+)px\)/);
            if (match) {
              const blurValue = parseInt(match[1], 10);
              return `blur(${Math.min(blurValue, 3)}px)`;
            }
          }
        } else if (filters.some(f => f.startsWith('opacity'))) {
          return filters.find(f => f.startsWith('opacity')) || filters[0];
        } else {
          return filters[0];
        }
      }
    }

    // Handle single filters
    if (value.startsWith('blur')) {
      // Reduce blur intensity for low-end devices
      const match = value.match(/blur\((\d+)px\)/);
      if (match) {
        const blurValue = parseInt(match[1], 10);

        if (
          this.config.deviceTier === DeviceCapabilityTier.LOW ||
          this.config.optimizationLevel === OptimizationLevel.AGGRESSIVE
        ) {
          return `blur(${Math.min(blurValue, 5)}px)`;
        } else if (
          this.config.deviceTier === DeviceCapabilityTier.MINIMAL ||
          this.config.optimizationLevel === OptimizationLevel.MAXIMUM
        ) {
          return `blur(${Math.min(blurValue, 3)}px)`;
        }
      }
    }

    return value;
  }

  /**
   * Generate CSS text from rules
   */
  private generateCss(rules: { property: string; value: string }[]): string {
    return rules.map(rule => `${rule.property}: ${rule.value};`).join(' ');
  }
}

/**
 * Create a new style optimizer with custom configuration
 */
export const createStyleOptimizer = (config?: StyleOptimizationConfig): StyleOptimizer => {
  return new StyleOptimizer(config);
};

/**
 * Global style optimizer for shared use
 */
export const globalStyleOptimizer = new StyleOptimizer();

/**
 * Optimize CSS for a specific component type
 */
export const optimizeComponentStyle = (
  cssText: string,
  componentType: string,
  isGlass = false,
  config?: StyleOptimizationConfig
): string => {
  const optimizer = config ? new StyleOptimizer(config) : globalStyleOptimizer;
  return isGlass ? optimizer.optimizeGlassStyles(cssText) : optimizer.optimizeCss(cssText);
};

/**
 * Add GPU acceleration to a CSS object
 */
export const addGpuAcceleration = (
  styles: Record<string, any>,
  useWillChange = true
): Record<string, any> => {
  // Clone the styles to avoid modifying the original
  const optimizedStyles = { ...styles };

  // Add transform for hardware acceleration if not already present
  if (!('transform' in optimizedStyles) || optimizedStyles.transform === 'none') {
    optimizedStyles.transform = 'translateZ(0)';
  }

  // Add backface-visibility for better performance
  if (!('backfaceVisibility' in optimizedStyles)) {
    optimizedStyles.backfaceVisibility = 'hidden';
  }

  // Add will-change for better performance if enabled
  if (useWillChange && !('willChange' in optimizedStyles)) {
    // Determine which properties to include in will-change
    const willChangeProps = [];

    if ('transform' in optimizedStyles) willChangeProps.push('transform');
    if ('opacity' in optimizedStyles) willChangeProps.push('opacity');

    // If no specific properties, use transform as default
    if (willChangeProps.length === 0) {
      willChangeProps.push('transform');
    }

    optimizedStyles.willChange = willChangeProps.join(', ');
  }

  return optimizedStyles;
};
