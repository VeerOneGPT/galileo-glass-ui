/**
 * Transform Consolidation System
 * 
 * This system is designed to reduce repaints and improve performance by:
 * 1. Consolidating multiple transform operations into a single transform string
 * 2. Applying transforms in an optimized order for hardware acceleration
 * 3. Ensuring transforms are applied in a way that minimizes layout thrashing
 * 4. Providing utilities for common transform operations with optimized defaults
 */

import { domBatcher, BatchPriority } from './DomBatcher';

/**
 * Types of transform operations
 */
export enum TransformType {
  TRANSLATE = 'translate',
  TRANSLATE_X = 'translateX',
  TRANSLATE_Y = 'translateY',
  TRANSLATE_Z = 'translateZ',
  TRANSLATE_3D = 'translate3d',
  SCALE = 'scale',
  SCALE_X = 'scaleX',
  SCALE_Y = 'scaleY',
  SCALE_Z = 'scaleZ',
  SCALE_3D = 'scale3d',
  ROTATE = 'rotate',
  ROTATE_X = 'rotateX',
  ROTATE_Y = 'rotateY',
  ROTATE_Z = 'rotateZ',
  ROTATE_3D = 'rotate3d',
  SKEW = 'skew',
  SKEW_X = 'skewX',
  SKEW_Y = 'skewY',
  MATRIX = 'matrix',
  MATRIX_3D = 'matrix3d',
  PERSPECTIVE = 'perspective'
}

/**
 * Options for transform operations
 */
export interface TransformOptions {
  /**
   * Whether to use hardware acceleration optimizations
   */
  useHardwareAcceleration?: boolean;
  
  /**
   * Whether to use 3D transforms even for 2D operations (enables GPU acceleration)
   */
  force3D?: boolean;
  
  /**
   * Origin point for transforms
   */
  transformOrigin?: string;
  
  /**
   * Whether to apply transforms immediately or batch them
   */
  immediateRender?: boolean;
  
  /**
   * Priority for batched operations
   */
  priority?: BatchPriority;
  
  /**
   * Whether to clear existing transforms before applying new ones
   */
  clearExisting?: boolean;
  
  /**
   * Whether to use force GPU rendering using translateZ(0)
   */
  forceGPU?: boolean;
}

/**
 * A single transform operation
 */
export interface TransformOperation {
  /**
   * Type of transform
   */
  type: TransformType;
  
  /**
   * Values for the transform (e.g., x, y for translate)
   */
  values: number[];
  
  /**
   * Units for the values (e.g., 'px', '%', 'deg')
   */
  units?: string[];
}

/**
 * Consolidated transform state for an element
 */
export interface ElementTransformState {
  /**
   * Element being transformed
   */
  element: HTMLElement;
  
  /**
   * Currently applied transforms
   */
  transforms: Record<TransformType, TransformOperation>;
  
  /**
   * Transform origin
   */
  transformOrigin?: string;
  
  /**
   * Last consolidated transform string
   */
  lastTransformString?: string;
  
  /**
   * Whether hardware acceleration is enabled
   */
  isHardwareAccelerated: boolean;
}

/**
 * System for consolidating transforms to reduce repaints
 */
export class TransformConsolidator {
  private static instance: TransformConsolidator;
  
  // Track transform state for each element
  private elementStates: Map<HTMLElement, ElementTransformState> = new Map();
  
  // Default transform options
  private defaultOptions: Required<TransformOptions> = {
    useHardwareAcceleration: true,
    force3D: true,
    transformOrigin: 'center',
    immediateRender: false,
    priority: BatchPriority.NORMAL,
    clearExisting: false,
    forceGPU: false
  };
  
  // Optimized transform order for hardware acceleration
  private readonly optimizedTransformOrder: TransformType[] = [
    TransformType.PERSPECTIVE,
    TransformType.TRANSLATE_Z,
    TransformType.TRANSLATE_3D,
    TransformType.TRANSLATE_X,
    TransformType.TRANSLATE_Y,
    TransformType.TRANSLATE,
    TransformType.ROTATE_X,
    TransformType.ROTATE_Y,
    TransformType.ROTATE_Z,
    TransformType.ROTATE_3D,
    TransformType.ROTATE,
    TransformType.SKEW_X,
    TransformType.SKEW_Y,
    TransformType.SKEW,
    TransformType.SCALE_X,
    TransformType.SCALE_Y,
    TransformType.SCALE_Z,
    TransformType.SCALE_3D,
    TransformType.SCALE,
    TransformType.MATRIX,
    TransformType.MATRIX_3D
  ];
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): TransformConsolidator {
    if (!TransformConsolidator.instance) {
      TransformConsolidator.instance = new TransformConsolidator();
    }
    return TransformConsolidator.instance;
  }
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}
  
  /**
   * Set transform options
   */
  public setOptions(options: TransformOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
  
  /**
   * Get or create the transform state for an element
   */
  private getElementState(element: HTMLElement): ElementTransformState {
    if (!this.elementStates.has(element)) {
      // Initialize with empty transforms
      this.elementStates.set(element, {
        element,
        transforms: {} as Record<TransformType, TransformOperation>,
        isHardwareAccelerated: this.defaultOptions.useHardwareAcceleration || this.defaultOptions.force3D
      });
      
      // Parse existing transforms if any
      this.parseExistingTransforms(element);
    }
    
    return this.elementStates.get(element)!;
  }
  
  /**
   * Parse existing transforms from an element
   */
  private parseExistingTransforms(element: HTMLElement): void {
    const state = this.elementStates.get(element);
    if (!state) return;
    
    const currentTransform = element.style.transform || 
                             getComputedStyle(element).transform;
    
    if (currentTransform && currentTransform !== 'none') {
      state.lastTransformString = currentTransform;
      
      // Parse the transform string to extract operations
      const transformRegex = /([\w]+)\(([^)]+)\)/g;
      let match;
      
      while ((match = transformRegex.exec(currentTransform)) !== null) {
        const transformType = match[1] as TransformType;
        const valueString = match[2];
        
        // Parse values and units
        const valueRegex = /(-?[\d.]+)([a-z%]*)/g;
        const values: number[] = [];
        const units: string[] = [];
        
        let valueMatch;
        while ((valueMatch = valueRegex.exec(valueString)) !== null) {
          values.push(parseFloat(valueMatch[1]));
          units.push(valueMatch[2] || '');
        }
        
        // Store the transform operation
        state.transforms[transformType] = {
          type: transformType,
          values,
          units
        };
      }
    }
  }
  
  /**
   * Set a transform operation for an element
   */
  public setTransform(
    element: HTMLElement,
    type: TransformType,
    values: number | number[],
    units?: string | string[],
    options: TransformOptions = {}
  ): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const state = this.getElementState(element);
    
    // Handle single value
    const valuesArray = Array.isArray(values) ? values : [values];
    
    // Handle units
    let unitsArray: string[] = [];
    if (units) {
      unitsArray = Array.isArray(units) ? units : valuesArray.map(() => units);
    } else {
      // Default units based on transform type
      unitsArray = this.getDefaultUnits(type, valuesArray.length);
    }
    
    // Set transform origin if provided
    if (mergedOptions.transformOrigin) {
      state.transformOrigin = mergedOptions.transformOrigin;
    }
    
    // Clear existing transforms if requested
    if (mergedOptions.clearExisting) {
      state.transforms = {} as Record<TransformType, TransformOperation>;
    }
    
    // Store the transform
    state.transforms[type] = {
      type,
      values: valuesArray,
      units: unitsArray
    };
    
    // Force GPU acceleration if requested
    if (mergedOptions.forceGPU && !state.transforms[TransformType.TRANSLATE_Z]) {
      state.transforms[TransformType.TRANSLATE_Z] = {
        type: TransformType.TRANSLATE_Z,
        values: [0],
        units: ['px']
      };
    }
    
    // Update the hardware acceleration flag
    state.isHardwareAccelerated = mergedOptions.useHardwareAcceleration || 
                                  mergedOptions.force3D || 
                                  mergedOptions.forceGPU;
    
    // Apply the transform
    if (mergedOptions.immediateRender) {
      this.applyTransforms(element);
    } else {
      this.scheduleTransformUpdate(element, mergedOptions.priority);
    }
  }
  
  /**
   * Get default units for a transform type
   */
  private getDefaultUnits(type: TransformType, valueCount: number): string[] {
    const units: string[] = [];
    
    for (let i = 0; i < valueCount; i++) {
      switch (type) {
        case TransformType.TRANSLATE:
        case TransformType.TRANSLATE_X:
        case TransformType.TRANSLATE_Y:
        case TransformType.TRANSLATE_Z:
        case TransformType.TRANSLATE_3D:
        case TransformType.PERSPECTIVE:
          units.push('px');
          break;
        case TransformType.ROTATE:
        case TransformType.ROTATE_X:
        case TransformType.ROTATE_Y:
        case TransformType.ROTATE_Z:
        case TransformType.SKEW:
        case TransformType.SKEW_X:
        case TransformType.SKEW_Y:
          units.push('deg');
          break;
        case TransformType.SCALE:
        case TransformType.SCALE_X:
        case TransformType.SCALE_Y:
        case TransformType.SCALE_Z:
        case TransformType.SCALE_3D:
        case TransformType.MATRIX:
        case TransformType.MATRIX_3D:
        case TransformType.ROTATE_3D:
          units.push('');
          break;
      }
    }
    
    return units;
  }
  
  /**
   * Schedule a transform update
   */
  private scheduleTransformUpdate(
    element: HTMLElement,
    priority: BatchPriority = BatchPriority.NORMAL
  ): void {
    domBatcher.transform(
      element,
      this.buildTransformString(element),
      priority
    );
    
    // Also update transform-origin if needed
    const state = this.elementStates.get(element);
    if (state && state.transformOrigin) {
      domBatcher.style(
        element,
        'transformOrigin',
        state.transformOrigin,
        priority
      );
    }
  }
  
  /**
   * Apply transforms immediately
   */
  public applyTransforms(element: HTMLElement): void {
    const transformString = this.buildTransformString(element);
    element.style.transform = transformString;
    
    // Apply transform origin if needed
    const state = this.elementStates.get(element);
    if (state && state.transformOrigin) {
      element.style.transformOrigin = state.transformOrigin;
    }
  }
  
  /**
   * Build a consolidated transform string
   */
  private buildTransformString(element: HTMLElement): string {
    const state = this.elementStates.get(element);
    if (!state) return '';
    
    const transformParts: string[] = [];
    
    // Add transforms in the optimized order
    for (const type of this.optimizedTransformOrder) {
      const transform = state.transforms[type];
      if (transform) {
        const valueStrings = transform.values.map((value, index) => {
          const unit = transform.units?.[index] || '';
          return `${value}${unit}`;
        });
        
        transformParts.push(`${transform.type}(${valueStrings.join(', ')})`);
      }
    }
    
    // Convert 2D transforms to 3D if hardware acceleration is enabled
    if (state.isHardwareAccelerated && !transformParts.some(t => 
        t.includes('3d') || t.includes('Z') || t.includes('perspective')
    )) {
      // Add translateZ(0) to force hardware acceleration
      transformParts.push('translateZ(0)');
    }
    
    const transformString = transformParts.join(' ');
    state.lastTransformString = transformString;
    
    return transformString;
  }
  
  /**
   * Reset transforms for an element
   */
  public resetTransforms(element: HTMLElement, options: TransformOptions = {}): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // Clear transform state
    this.elementStates.delete(element);
    
    // Apply empty transform
    if (mergedOptions.immediateRender) {
      element.style.transform = '';
      element.style.transformOrigin = '';
    } else {
      domBatcher.transform(element, '', mergedOptions.priority);
      domBatcher.style(element, 'transformOrigin', '', mergedOptions.priority);
    }
  }
  
  /**
   * Get the current transform state for an element
   */
  public getTransformState(element: HTMLElement): ElementTransformState | undefined {
    return this.elementStates.get(element);
  }
  
  /**
   * Flush all pending transforms
   */
  public flush(): void {
    domBatcher.flush();
  }
  
  /**
   * Translate an element (2D)
   */
  public translate(
    element: HTMLElement,
    x: number,
    y: number,
    units = 'px',
    options?: TransformOptions
  ): void {
    this.setTransform(
      element,
      TransformType.TRANSLATE,
      [x, y],
      [units, units],
      options
    );
  }
  
  /**
   * Translate an element in 3D
   */
  public translate3d(
    element: HTMLElement,
    x: number,
    y: number,
    z: number,
    units = 'px',
    options?: TransformOptions
  ): void {
    this.setTransform(
      element,
      TransformType.TRANSLATE_3D,
      [x, y, z],
      [units, units, units],
      options
    );
  }
  
  /**
   * Scale an element (2D)
   */
  public scale(
    element: HTMLElement,
    x: number,
    y: number = x,
    options?: TransformOptions
  ): void {
    this.setTransform(
      element,
      TransformType.SCALE,
      [x, y],
      ['', ''],
      options
    );
  }
  
  /**
   * Scale an element in 3D
   */
  public scale3d(
    element: HTMLElement,
    x: number,
    y: number = x,
    z = 1,
    options?: TransformOptions
  ): void {
    this.setTransform(
      element,
      TransformType.SCALE_3D,
      [x, y, z],
      ['', '', ''],
      options
    );
  }
  
  /**
   * Rotate an element
   */
  public rotate(
    element: HTMLElement,
    angle: number,
    units = 'deg',
    options?: TransformOptions
  ): void {
    this.setTransform(
      element,
      TransformType.ROTATE,
      [angle],
      [units],
      options
    );
  }
  
  /**
   * Rotate an element in 3D
   */
  public rotate3d(
    element: HTMLElement,
    x: number,
    y: number,
    z: number,
    angle: number,
    units = 'deg',
    options?: TransformOptions
  ): void {
    this.setTransform(
      element,
      TransformType.ROTATE_3D,
      [x, y, z, angle],
      ['', '', '', units],
      options
    );
  }
  
  /**
   * Set perspective
   */
  public perspective(
    element: HTMLElement,
    distance: number,
    units = 'px',
    options?: TransformOptions
  ): void {
    this.setTransform(
      element,
      TransformType.PERSPECTIVE,
      [distance],
      [units],
      { ...options, useHardwareAcceleration: true }
    );
  }
  
  /**
   * Apply matrix transform
   */
  public matrix(
    element: HTMLElement,
    a: number,
    b: number,
    c: number,
    d: number,
    tx: number,
    ty: number,
    options?: TransformOptions
  ): void {
    this.setTransform(
      element,
      TransformType.MATRIX,
      [a, b, c, d, tx, ty],
      ['', '', '', '', '', ''],
      options
    );
  }
  
  /**
   * Apply common transform presets
   */
  public applyPreset(
    element: HTMLElement,
    preset: 'fadeIn' | 'fadeOut' | 'slideIn' | 'slideOut' | 'zoomIn' | 'zoomOut' | 'flipHorizontal' | 'flipVertical',
    options?: TransformOptions
  ): void {
    switch (preset) {
      case 'fadeIn':
        element.style.opacity = '1';
        this.scale(element, 1, 1, options);
        break;
      case 'fadeOut':
        element.style.opacity = '0';
        this.scale(element, 0.95, 0.95, options);
        break;
      case 'slideIn':
        this.translate(element, 0, 0, 'px', options);
        break;
      case 'slideOut':
        this.translate(element, 100, 0, '%', options);
        break;
      case 'zoomIn':
        this.scale(element, 1, 1, options);
        break;
      case 'zoomOut':
        this.scale(element, 0, 0, options);
        break;
      case 'flipHorizontal':
        this.rotate3d(element, 0, 1, 0, 180, 'deg', options);
        break;
      case 'flipVertical':
        this.rotate3d(element, 1, 0, 0, 180, 'deg', options);
        break;
    }
  }
}

// Create a global instance for easy import
export const transformConsolidator = TransformConsolidator.getInstance();

// Export default for convenience
export default transformConsolidator;