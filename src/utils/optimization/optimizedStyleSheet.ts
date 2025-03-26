/**
 * Optimized StyleSheet Management
 *
 * A system for creating and managing optimized CSS stylesheets
 * to improve performance with Glass UI components.
 */
import { DeviceCapabilityTier, getDeviceCapabilityTier } from '../deviceCapabilities';
import { globalStyleCache } from '../performance/styleCache';
import { globalStyleOptimizer } from '../performance/styleOptimization';

/**
 * A class name with optimization metadata
 */
interface OptimizedClassName {
  /** The generated class name */
  className: string;

  /** The original CSS styles */
  originalCss: string;

  /** The optimized CSS styles */
  optimizedCss: string;

  /** Component type that created this class */
  componentType: string;

  /** Whether this is a glass component */
  isGlass: boolean;

  /** Creation timestamp */
  timestamp: number;

  /** Counter to make names unique */
  counter: number;
}

/**
 * Configuration for optimized stylesheet
 */
export interface OptimizedStyleSheetConfig {
  /** Whether to include comments in generated CSS */
  includeComments?: boolean;

  /** Whether to optimize styles automatically */
  autoOptimize?: boolean;

  /** Prefix for generated class names */
  classNamePrefix?: string;

  /** Maximum number of stylesheets to create before reusing them */
  maxStyleSheets?: number;

  /** Max rules per stylesheet (to avoid performance issues) */
  maxRulesPerSheet?: number;

  /** Whether to cache generated styles */
  cacheStyles?: boolean;

  /** Whether to use namespaced class names */
  useNamespacedClasses?: boolean;

  /** Whether to group similar rules together */
  groupSimilarRules?: boolean;

  /** Whether to minify CSS */
  minifyCss?: boolean;

  /** Namespace for the stylesheet */
  namespace?: string;

  /** Whether to optimize selectors */
  optimizeSelectors?: boolean;

  /** Whether to reuse classes */
  reuseClasses?: boolean;

  /** Cache size for optimized classes */
  cacheSize?: number;
}

/**
 * Optimized StyleSheet Manager
 *
 * Efficiently manages CSS stylesheets for Glass UI components
 * with built-in optimization and performance features.
 */
export class OptimizedStyleSheet {
  private styleSheets: HTMLStyleElement[] = [];
  private classNameMap: Map<string, OptimizedClassName> = new Map();
  private config: Required<OptimizedStyleSheetConfig>;
  private counter = 0;
  private deviceTier: DeviceCapabilityTier;

  /**
   * Create a new optimized stylesheet manager
   */
  constructor(config: OptimizedStyleSheetConfig = {}) {
    this.config = {
      includeComments: config.includeComments ?? false,
      autoOptimize: config.autoOptimize ?? true,
      classNamePrefix: config.classNamePrefix ?? 'glass-',
      maxStyleSheets: config.maxStyleSheets ?? 10,
      maxRulesPerSheet: config.maxRulesPerSheet ?? 4000,
      cacheStyles: config.cacheStyles ?? true,
      useNamespacedClasses: config.useNamespacedClasses ?? true,
      groupSimilarRules: config.groupSimilarRules ?? true,
      minifyCss: config.minifyCss ?? true,
      namespace: config.namespace ?? 'galileo-glass',
      optimizeSelectors: config.optimizeSelectors ?? true,
      reuseClasses: config.reuseClasses ?? true,
      cacheSize: config.cacheSize ?? 50,
    };

    this.deviceTier = getDeviceCapabilityTier();

    // Create initial stylesheet
    this.createStyleSheet();
  }

  /**
   * Create a new class with optimized styles
   */
  public createClass(css: string, componentType = 'unknown', isGlass = false): string {
    // Check cache if enabled
    if (this.config.cacheStyles) {
      const cacheKey = `${componentType}:${css}:${this.deviceTier}`;
      const cachedClass = globalStyleCache.get(cacheKey);

      if (cachedClass) {
        return cachedClass;
      }
    }

    // Generate a unique class name
    const className = this.generateClassName(componentType);

    // Optimize CSS if configured
    let optimizedCss = css;
    if (this.config.autoOptimize) {
      optimizedCss = isGlass
        ? globalStyleOptimizer.optimizeGlassStyles(css)
        : globalStyleOptimizer.optimizeCss(css);
    }

    // Store class information
    this.classNameMap.set(className, {
      className,
      originalCss: css,
      optimizedCss,
      componentType,
      isGlass,
      timestamp: Date.now(),
      counter: this.counter++,
    });

    // Insert the CSS rule
    this.insertRule(className, optimizedCss);

    // Cache the class name if enabled
    if (this.config.cacheStyles) {
      const cacheKey = `${componentType}:${css}:${this.deviceTier}`;
      globalStyleCache.set(cacheKey, className, 'OptimizedStyleSheet', isGlass);
    }

    return className;
  }

  /**
   * Create multiple classes at once for an object of styles
   */
  public createClasses(
    styles: Record<string, string>,
    componentType = 'unknown',
    isGlass = false
  ): Record<string, string> {
    const result: Record<string, string> = {};

    Object.entries(styles).forEach(([key, css]) => {
      result[key] = this.createClass(css, `${componentType}-${key}`, isGlass);
    });

    return result;
  }

  /**
   * Remove a class and its styles
   */
  public removeClass(className: string): boolean {
    const classInfo = this.classNameMap.get(className);
    if (!classInfo) return false;

    // Find the rule in stylesheets
    for (const sheet of this.styleSheets) {
      const rules = sheet.sheet?.cssRules;
      if (!rules) continue;

      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (rule instanceof CSSStyleRule && rule.selectorText === `.${className}`) {
          sheet.sheet?.deleteRule(i);
          this.classNameMap.delete(className);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Update a class with new styles
   */
  public updateClass(
    className: string,
    css: string,
    optimize: boolean = this.config.autoOptimize
  ): boolean {
    // Check if class exists
    const classInfo = this.classNameMap.get(className);
    if (!classInfo) return false;

    // Remove the old rule
    this.removeClass(className);

    // Optimize if requested
    let optimizedCss = css;
    if (optimize) {
      optimizedCss = classInfo.isGlass
        ? globalStyleOptimizer.optimizeGlassStyles(css)
        : globalStyleOptimizer.optimizeCss(css);
    }

    // Create updated class info
    this.classNameMap.set(className, {
      ...classInfo,
      originalCss: css,
      optimizedCss,
      timestamp: Date.now(),
    });

    // Insert the updated rule
    this.insertRule(className, optimizedCss);

    // Update cache if enabled
    if (this.config.cacheStyles) {
      const cacheKey = `${classInfo.componentType}:${css}:${this.deviceTier}`;
      globalStyleCache.set(cacheKey, className, 'OptimizedStyleSheet', classInfo.isGlass);
    }

    return true;
  }

  /**
   * Get information about a class
   */
  public getClassInfo(className: string): OptimizedClassName | null {
    return this.classNameMap.get(className) || null;
  }

  /**
   * Check if a class exists
   */
  public hasClass(className: string): boolean {
    return this.classNameMap.has(className);
  }

  /**
   * Get the number of defined classes
   */
  public getClassCount(): number {
    return this.classNameMap.size;
  }

  /**
   * Get all classes for a component type
   */
  public getClassesForComponent(componentType: string): string[] {
    const classes: string[] = [];

    this.classNameMap.forEach((info, className) => {
      if (info.componentType === componentType) {
        classes.push(className);
      }
    });

    return classes;
  }

  /**
   * Get all glass component classes
   */
  public getGlassClasses(): string[] {
    const classes: string[] = [];

    this.classNameMap.forEach((info, className) => {
      if (info.isGlass) {
        classes.push(className);
      }
    });

    return classes;
  }

  /**
   * Clear all stylesheets and classes
   */
  public clear(): void {
    // Remove all style elements
    this.styleSheets.forEach(sheet => {
      document.head.removeChild(sheet);
    });

    // Reset state
    this.styleSheets = [];
    this.classNameMap.clear();
    this.counter = 0;

    // Create a new initial stylesheet
    this.createStyleSheet();
  }

  /**
   * Optimize all existing glass styles based on current device capability
   */
  public optimizeAllGlassStyles(): void {
    // Get all glass classes
    const glassClasses = this.getGlassClasses();

    // Re-optimize each glass class
    glassClasses.forEach(className => {
      const info = this.classNameMap.get(className);
      if (info) {
        const _optimizedCss = globalStyleOptimizer.optimizeGlassStyles(info.originalCss);
        this.updateClass(className, info.originalCss, true);
      }
    });
  }

  /**
   * Generate a unique class name
   */
  private generateClassName(componentType: string): string {
    const base = this.config.classNamePrefix;
    let name: string;

    if (this.config.useNamespacedClasses) {
      // Use a namespaced approach: prefix-component-counter
      const sanitizedType = componentType.toLowerCase().replace(/[^a-z0-9]/g, '-');
      name = `${base}${sanitizedType}-${this.counter}`;
    } else {
      // Use a simple approach: prefix-counter
      name = `${base}${this.counter}`;
    }

    return name;
  }

  /**
   * Create a new stylesheet element
   */
  private createStyleSheet(): HTMLStyleElement {
    // Check if we need to reuse an existing sheet
    if (this.styleSheets.length >= this.config.maxStyleSheets) {
      // Reuse the sheet with the fewest rules
      let minRules = Infinity;
      let minIndex = 0;

      this.styleSheets.forEach((sheet, index) => {
        const ruleCount = sheet.sheet?.cssRules.length || 0;
        if (ruleCount < minRules) {
          minRules = ruleCount;
          minIndex = index;
        }
      });

      // Clear the selected sheet and return it
      const sheet = this.styleSheets[minIndex];
      while (sheet.sheet?.cssRules.length) {
        sheet.sheet.deleteRule(0);
      }

      return sheet;
    }

    // Create a new stylesheet
    const style = document.createElement('style');
    style.setAttribute('data-glass-ui', 'true');

    // Add a descriptive comment if configured
    if (this.config.includeComments) {
      style.textContent = `/* Galileo Glass UI - Optimized StyleSheet #${
        this.styleSheets.length + 1
      } */\n`;
    }

    // Add to document and store
    document.head.appendChild(style);
    this.styleSheets.push(style);

    return style;
  }

  /**
   * Insert a CSS rule for a class
   */
  private insertRule(className: string, css: string): void {
    if (!css) return;

    // Find a stylesheet with space
    const targetSheet = this.findTargetStyleSheet();

    // Format the rule
    let rule = `.${className} { ${css} }`;

    // Minify if configured
    if (this.config.minifyCss) {
      rule = this.minifyCss(rule);
    }

    // Insert the rule
    try {
      const sheet = targetSheet.sheet;
      if (sheet) {
        sheet.insertRule(rule, sheet.cssRules.length);
      }
    } catch (error) {
      console.error('Failed to insert CSS rule:', error);
      console.error('Rule:', rule);
    }
  }

  /**
   * Find a stylesheet with space for a new rule
   */
  private findTargetStyleSheet(): HTMLStyleElement {
    // Try to find a sheet with space
    for (const sheet of this.styleSheets) {
      if (!sheet.sheet) continue;
      if (sheet.sheet.cssRules.length < this.config.maxRulesPerSheet) {
        return sheet;
      }
    }

    // All sheets are full, create a new one
    return this.createStyleSheet();
  }

  /**
   * Minify a CSS string
   */
  private minifyCss(css: string): string {
    return css
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*;\s*/g, ';')
      .replace(/;\s*}/g, '}')
      .trim();
  }
}

/**
 * Global instance for shared use
 */
export const globalStyleSheet = typeof window !== 'undefined' ? new OptimizedStyleSheet() : null;

/**
 * Create a new optimized stylesheet
 */
export const createOptimizedStyleSheet = (
  config?: OptimizedStyleSheetConfig
): OptimizedStyleSheet => {
  if (typeof window === 'undefined') {
    throw new Error('OptimizedStyleSheet requires a browser environment');
  }

  return new OptimizedStyleSheet(config);
};
