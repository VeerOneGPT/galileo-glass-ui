/**
 * Staggered Animation Utilities
 *
 * Provides utilities for creating staggered animations across multiple elements,
 * with fine-grained control over timing, order, and distribution patterns.
 */

import { 
  AnimationPreset
} from '../core/types';
import { animationEventBus } from './AnimationEventSystem';
import { animationOrchestrator, AnimationEventType } from './Orchestrator';

/**
 * Distribution pattern for staggered animations
 */
export enum DistributionPattern {
  /** Linear from first to last item */
  LINEAR = 'linear',
  
  /** Linear from last to first item */
  REVERSED = 'reversed',
  
  /** Start animation from the middle and expand outward */
  FROM_CENTER = 'from-center',
  
  /** Start animation from the edges and move inward */
  FROM_EDGES = 'from-edges',
  
  /** Random start times (but predictable with seed) */
  RANDOM = 'random',
  
  /** Start in even indices first, then odd */
  EVEN_ODD = 'even-odd',
  
  /** Start in odd indices first, then even */
  ODD_EVEN = 'odd-even',
  
  /** Start with prime-indexed elements first */
  PRIME = 'prime',
  
  /** Custom distribution pattern */
  CUSTOM = 'custom',
}

/**
 * Direction for staggered animations
 */
export enum StaggerDirection {
  /** Top to bottom */
  TOP_DOWN = 'top-down',
  
  /** Bottom to top */
  BOTTOM_UP = 'bottom-up',
  
  /** Left to right */
  LEFT_RIGHT = 'left-right',
  
  /** Right to left */
  RIGHT_LEFT = 'right-left',
  
  /** Clockwise from top-left */
  CLOCKWISE = 'clockwise',
  
  /** Counter-clockwise from top-left */
  COUNTER_CLOCKWISE = 'counter-clockwise',
  
  /** Inward from edges */
  INWARD = 'inward',
  
  /** Outward from center */
  OUTWARD = 'outward',
  
  /** Custom direction */
  CUSTOM = 'custom',
}

/**
 * Grouping strategy for staggered animations
 */
export enum GroupingStrategy {
  /** No grouping, each item animates individually */
  NONE = 'none',
  
  /** Group by rows */
  ROWS = 'rows',
  
  /** Group by columns */
  COLUMNS = 'columns',
  
  /** Group by arbitrary categories */
  CATEGORY = 'category',
  
  /** Group by distance from a point */
  DISTANCE = 'distance',
  
  /** Custom grouping strategy */
  CUSTOM = 'custom',
}

/**
 * Easing function types for distribution
 */
export enum DistributionEasing {
  /** Linear distribution (equal spacing) */
  LINEAR = 'linear',
  
  /** Quadratic ease-in (slow start, faster end) */
  EASE_IN = 'ease-in',
  
  /** Quadratic ease-out (faster start, slow end) */
  EASE_OUT = 'ease-out',
  
  /** Quadratic ease-in-out (slow start, fast middle, slow end) */
  EASE_IN_OUT = 'ease-in-out',
  
  /** Cubic ease-in (even slower start) */
  CUBIC_IN = 'cubic-in',
  
  /** Cubic ease-out (even slower end) */
  CUBIC_OUT = 'cubic-out',
  
  /** Cubic ease-in-out */
  CUBIC_IN_OUT = 'cubic-in-out',
  
  /** Exponential distribution (very fast, then very slow) */
  EXPONENTIAL = 'exponential',
  
  /** Custom easing function */
  CUSTOM = 'custom',
}

/**
 * Element category for grouping
 */
export interface ElementCategory {
  /** Category ID */
  id: string;
  
  /** Category name */
  name: string;
  
  /** Animation delay for this category */
  delay?: number;
  
  /** Animation order (lower numbers animate first) */
  order?: number;
  
  /** Custom category data */
  data?: unknown;
}

/**
 * Element position for spatial distribution
 */
export interface ElementPosition {
  /** X coordinate */
  x: number;
  
  /** Y coordinate */
  y: number;
  
  /** Z coordinate (optional) */
  z?: number;
  
  /** Row index (for grid layouts) */
  row?: number;
  
  /** Column index (for grid layouts) */
  col?: number;
  
  /** Depth index (for 3D grids) */
  depth?: number;
}

/**
 * Staggered animation target element
 */
export interface StaggerTarget {
  /** Element ID or reference */
  element: string | HTMLElement;
  
  /** Position in layout (for spatial distributions) */
  position?: ElementPosition;
  
  /** Element category for grouping */
  category?: string;
  
  /** Custom delay override for this element */
  delay?: number;
  
  /** Custom duration override for this element */
  duration?: number;
  
  /** Animation order override (lower numbers animate first) */
  order?: number;
  
  /** Whether this element should be included */
  include?: boolean;
  
  /** Custom element data */
  data?: unknown;
}

/**
 * Configuration for staggered animation
 */
export interface StaggeredAnimationConfig {
  /** Animation target elements */
  targets: StaggerTarget[];
  
  /** Animation to apply */
  animation: AnimationPreset;
  
  /** Base duration for each animation */
  duration?: number;
  
  /** Delay between consecutive animations (ms) */
  staggerDelay?: number;
  
  /** Base delay before starting the sequence (ms) */
  startDelay?: number;
  
  /** Maximum total duration for the entire sequence (ms) */
  maxTotalDuration?: number;
  
  /** Distribution pattern to use */
  pattern?: DistributionPattern;
  
  /** Direction for spatial distributions */
  direction?: StaggerDirection;
  
  /** Grouping strategy */
  grouping?: GroupingStrategy;
  
  /** Element categories for category grouping */
  categories?: ElementCategory[];
  
  /** Distribution easing function */
  easing?: DistributionEasing;
  
  /** Custom easing function for distribution */
  customEasing?: (progress: number) => number;
  
  /** Custom distribution function */
  customDistribution?: (elements: StaggerTarget[]) => StaggerTarget[];
  
  /** Custom delay calculator */
  customDelayCalculator?: (element: StaggerTarget, index: number, total: number) => number;
  
  /** Reference point for distance calculations */
  referencePoint?: ElementPosition;
  
  /** Whether to automatically play the animation */
  autoPlay?: boolean;
  
  /** Debug mode for logging */
  debug?: boolean;
}

/**
 * Result for stagger calculation
 */
export interface StaggerResult {
  /** Calculated delays for each element */
  delays: Map<string | HTMLElement, number>;
  
  /** Calculated durations for each element */
  durations: Map<string | HTMLElement, number>;
  
  /** Total duration of the sequence */
  totalDuration: number;
  
  /** Order of animation execution */
  order: Array<string | HTMLElement>;
  
  /** Play the staggered animation */
  play: () => Promise<void>;
  
  /** Cancel the staggered animation */
  cancel: () => void;
}

/**
 * Calculates prime numbers up to n for prime distribution
 * @param n Upper limit
 * @returns Array of prime numbers
 */
function getPrimes(n: number): number[] {
  const sieve = Array(n + 1).fill(true);
  sieve[0] = sieve[1] = false;
  
  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = false;
      }
    }
  }
  
  return sieve.map((isPrime, index) => isPrime ? index : -1).filter(idx => idx !== -1);
}

/**
 * Get easing function from distribution easing type
 * @param easing Distribution easing type
 * @param customEasing Custom easing function
 * @returns Easing function
 */
function getEasingFunction(
  easing: DistributionEasing = DistributionEasing.LINEAR,
  customEasing?: (progress: number) => number
): (progress: number) => number {
  if (easing === DistributionEasing.CUSTOM && customEasing) {
    return customEasing;
  }
  
  switch (easing) {
    case DistributionEasing.LINEAR:
      return t => t;
      
    case DistributionEasing.EASE_IN:
      return t => t * t;
      
    case DistributionEasing.EASE_OUT:
      return t => t * (2 - t);
      
    case DistributionEasing.EASE_IN_OUT:
      return t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
    case DistributionEasing.CUBIC_IN:
      return t => t * t * t;
      
    case DistributionEasing.CUBIC_OUT:
      return t => (--t) * t * t + 1;
      
    case DistributionEasing.CUBIC_IN_OUT:
      return t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      
    case DistributionEasing.EXPONENTIAL:
      return t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
      
    default:
      return t => t;
  }
}

/**
 * Calculate element order based on distribution pattern
 * @param targets Target elements
 * @param pattern Distribution pattern
 * @param direction Direction for spatial distributions
 * @param referencePoint Reference point for spatial calculations
 * @returns Ordered array of target elements
 */
function calculateElementOrder(
  targets: StaggerTarget[],
  pattern: DistributionPattern = DistributionPattern.LINEAR,
  direction: StaggerDirection = StaggerDirection.TOP_DOWN,
  referencePoint?: ElementPosition
): StaggerTarget[] {
  // Create a copy of targets for ordering
  let orderedTargets = [...targets];
  
  // Filter out elements with include=false
  orderedTargets = orderedTargets.filter(target => target.include !== false);
  
  // Sort by explicitly defined order first (if provided)
  orderedTargets.sort((a, b) => {
    // If both have explicit order, use that
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    
    // If only one has explicit order, it comes first
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    
    // Both use default ordering
    return 0;
  });
  
  // Now apply the specified pattern
  switch (pattern) {
    case DistributionPattern.LINEAR:
      // Already sorted by order
      break;
      
    case DistributionPattern.REVERSED:
      orderedTargets.reverse();
      break;
      
    case DistributionPattern.FROM_CENTER: {
      const middle = Math.floor(orderedTargets.length / 2);
      const result: StaggerTarget[] = [];
      
      for (let i = 0; i < orderedTargets.length; i++) {
        if (i % 2 === 0) {
          result.push(orderedTargets[middle + Math.floor(i / 2)]);
        } else {
          result.push(orderedTargets[middle - Math.ceil(i / 2)]);
        }
      }
      
      orderedTargets = result.filter(Boolean);
      break;
    }
      
    case DistributionPattern.FROM_EDGES: {
      const result: StaggerTarget[] = [];
      const halfLength = Math.ceil(orderedTargets.length / 2);
      
      for (let i = 0; i < halfLength; i++) {
        // Add from beginning
        if (i < orderedTargets.length) {
          result.push(orderedTargets[i]);
        }
        
        // Add from end (if not the same as beginning in odd-length arrays)
        const endIndex = orderedTargets.length - 1 - i;
        if (endIndex > i) {
          result.push(orderedTargets[endIndex]);
        }
      }
      
      orderedTargets = result;
      break;
    }
      
    case DistributionPattern.RANDOM: {
      // Fisher-Yates shuffle algorithm
      for (let i = orderedTargets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [orderedTargets[i], orderedTargets[j]] = [orderedTargets[j], orderedTargets[i]];
      }
      break;
    }
      
    case DistributionPattern.EVEN_ODD: {
      const evens = orderedTargets.filter((_, idx) => idx % 2 === 0);
      const odds = orderedTargets.filter((_, idx) => idx % 2 === 1);
      orderedTargets = [...evens, ...odds];
      break;
    }
      
    case DistributionPattern.ODD_EVEN: {
      const odds = orderedTargets.filter((_, idx) => idx % 2 === 1);
      const evens = orderedTargets.filter((_, idx) => idx % 2 === 0);
      orderedTargets = [...odds, ...evens];
      break;
    }
      
    case DistributionPattern.PRIME: {
      const primes = getPrimes(orderedTargets.length);
      const primeSet = new Set(primes);
      const primeIndices = orderedTargets.filter((_, idx) => primeSet.has(idx));
      const nonPrimeIndices = orderedTargets.filter((_, idx) => !primeSet.has(idx));
      orderedTargets = [...primeIndices, ...nonPrimeIndices];
      break;
    }
      
    case DistributionPattern.CUSTOM:
      // No default implementation, rely on custom sorting by client code
      break;
  }
  
  // Apply spatial ordering for relevant directions if elements have positions
  const hasPositions = orderedTargets.some(target => target.position);
  if (hasPositions && direction !== StaggerDirection.CUSTOM) {
    // Filter targets that have positions
    const withPositions = orderedTargets.filter(t => t.position);
    const withoutPositions = orderedTargets.filter(t => !t.position);
    
    // Choose reference point
    const refPoint = referencePoint || { x: 0, y: 0, z: 0 };
    
    switch (direction) {
      case StaggerDirection.TOP_DOWN:
        withPositions.sort((a, b) => 
          (a.position?.y ?? 0) - (b.position?.y ?? 0)
        );
        break;
        
      case StaggerDirection.BOTTOM_UP:
        withPositions.sort((a, b) => 
          (b.position?.y ?? 0) - (a.position?.y ?? 0)
        );
        break;
        
      case StaggerDirection.LEFT_RIGHT:
        withPositions.sort((a, b) => 
          (a.position?.x ?? 0) - (b.position?.x ?? 0)
        );
        break;
        
      case StaggerDirection.RIGHT_LEFT:
        withPositions.sort((a, b) => 
          (b.position?.x ?? 0) - (a.position?.x ?? 0)
        );
        break;
        
      case StaggerDirection.CLOCKWISE: {
        // Sort clockwise based on angle around reference point
        withPositions.sort((a, b) => {
          const aX = (a.position?.x ?? 0) - refPoint.x;
          const aY = (a.position?.y ?? 0) - refPoint.y;
          const bX = (b.position?.x ?? 0) - refPoint.x;
          const bY = (b.position?.y ?? 0) - refPoint.y;
          
          const angleA = Math.atan2(aY, aX);
          const angleB = Math.atan2(bY, bX);
          
          return angleA - angleB;
        });
        break;
      }
        
      case StaggerDirection.COUNTER_CLOCKWISE: {
        // Sort counter-clockwise based on angle around reference point
        withPositions.sort((a, b) => {
          const aX = (a.position?.x ?? 0) - refPoint.x;
          const aY = (a.position?.y ?? 0) - refPoint.y;
          const bX = (b.position?.x ?? 0) - refPoint.x;
          const bY = (b.position?.y ?? 0) - refPoint.y;
          
          const angleA = Math.atan2(aY, aX);
          const angleB = Math.atan2(bY, bX);
          
          return angleB - angleA;
        });
        break;
      }
        
      case StaggerDirection.INWARD: {
        // Sort by distance from reference point (furthest first)
        withPositions.sort((a, b) => {
          const aX = (a.position?.x ?? 0) - refPoint.x;
          const aY = (a.position?.y ?? 0) - refPoint.y;
          const aZ = (a.position?.z ?? 0) - (refPoint.z || 0);
          
          const bX = (b.position?.x ?? 0) - refPoint.x;
          const bY = (b.position?.y ?? 0) - refPoint.y;
          const bZ = (b.position?.z || 0) - (refPoint.z || 0);
          
          const distA = Math.sqrt(aX * aX + aY * aY + aZ * aZ);
          const distB = Math.sqrt(bX * bX + bY * bY + bZ * bZ);
          
          return distB - distA;
        });
        break;
      }
        
      case StaggerDirection.OUTWARD: {
        // Sort by distance from reference point (closest first)
        withPositions.sort((a, b) => {
          const aX = (a.position?.x ?? 0) - refPoint.x;
          const aY = (a.position?.y ?? 0) - refPoint.y;
          const aZ = (a.position?.z ?? 0) - (refPoint.z || 0);
          
          const bX = (b.position?.x ?? 0) - refPoint.x;
          const bY = (b.position?.y ?? 0) - refPoint.y;
          const bZ = (b.position?.z || 0) - (refPoint.z || 0);
          
          const distA = Math.sqrt(aX * aX + aY * aY + aZ * aZ);
          const distB = Math.sqrt(bX * bX + bY * bY + bZ * bZ);
          
          return distA - distB;
        });
        break;
      }
    }
    
    // Combine sorted positioned elements with any non-positioned elements
    orderedTargets = [...withPositions, ...withoutPositions];
  }
  
  return orderedTargets;
}

/**
 * Apply grouping strategy to elements
 * @param targets Target elements
 * @param grouping Grouping strategy
 * @param categories Element categories
 * @returns Grouped and ordered elements
 */
function applyGrouping(
  targets: StaggerTarget[],
  grouping: GroupingStrategy = GroupingStrategy.NONE,
  categories?: ElementCategory[]
): StaggerTarget[] {
  if (grouping === GroupingStrategy.NONE) {
    return targets;
  }
  
  let groupedTargets: StaggerTarget[] = [];
  
  switch (grouping) {
    case GroupingStrategy.ROWS: {
      // Group by row index
      const rows = new Map<number, StaggerTarget[]>();
      
      // Group elements by row
      targets.forEach(target => {
        if (target.position && target.position.row !== undefined) {
          const row = target.position.row;
          if (!rows.has(row)) {
            rows.set(row, []);
          }
          rows.get(row)?.push(target);
        } else {
          // Add items without row position at the end
          if (!rows.has(-1)) {
            rows.set(-1, []);
          }
          rows.get(-1)?.push(target);
        }
      });
      
      // Sort rows by index
      const sortedRows = Array.from(rows.entries()).sort((a, b) => a[0] - b[0]);
      
      // Flatten the groups
      groupedTargets = sortedRows.flatMap(([_, items]) => items);
      break;
    }
      
    case GroupingStrategy.COLUMNS: {
      // Group by column index
      const columns = new Map<number, StaggerTarget[]>();
      
      // Group elements by column
      targets.forEach(target => {
        if (target.position && target.position.col !== undefined) {
          const col = target.position.col;
          if (!columns.has(col)) {
            columns.set(col, []);
          }
          columns.get(col)?.push(target);
        } else {
          // Add items without column position at the end
          if (!columns.has(-1)) {
            columns.set(-1, []);
          }
          columns.get(-1)?.push(target);
        }
      });
      
      // Sort columns by index
      const sortedColumns = Array.from(columns.entries()).sort((a, b) => a[0] - b[0]);
      
      // Flatten the groups
      groupedTargets = sortedColumns.flatMap(([_, items]) => items);
      break;
    }
      
    case GroupingStrategy.CATEGORY: {
      // Group by element category
      const categoryGroups = new Map<string, StaggerTarget[]>();
      const categoryOrders = new Map<string, number>();
      
      // Set up category orders
      if (categories) {
        categories.forEach(category => {
          categoryGroups.set(category.id, []);
          categoryOrders.set(category.id, category.order || 0);
        });
      }
      
      // Group elements by category
      targets.forEach(target => {
        if (target.category) {
          if (!categoryGroups.has(target.category)) {
            categoryGroups.set(target.category, []);
            categoryOrders.set(target.category, 999); // High number for undefined categories
          }
          categoryGroups.get(target.category)?.push(target);
        } else {
          // Add items without category at the end
          if (!categoryGroups.has('__uncategorized')) {
            categoryGroups.set('__uncategorized', []);
            categoryOrders.set('__uncategorized', 1000);
          }
          categoryGroups.get('__uncategorized')?.push(target);
        }
      });
      
      // Sort categories by order
      const sortedCategories = Array.from(categoryGroups.entries())
        .sort((a, b) => (categoryOrders.get(a[0]) || 0) - (categoryOrders.get(b[0]) || 0));
      
      // Flatten the groups
      groupedTargets = sortedCategories.flatMap(([_, items]) => items);
      break;
    }
      
    case GroupingStrategy.DISTANCE: {
      // Group elements by distance from reference point
      const distanceGroups = new Map<number, StaggerTarget[]>();
      
      // Calculate distance group for each element
      targets.forEach(target => {
        if (target.position) {
          // Calculate distance (rounded to nearest 100 for grouping)
          const x = target.position.x;
          const y = target.position.y;
          const z = target.position.z || 0;
          
          const distance = Math.sqrt(x * x + y * y + z * z);
          const group = Math.floor(distance / 100) * 100;
          
          if (!distanceGroups.has(group)) {
            distanceGroups.set(group, []);
          }
          distanceGroups.get(group)?.push(target);
        } else {
          // Add items without position in a separate group
          if (!distanceGroups.has(-1)) {
            distanceGroups.set(-1, []);
          }
          distanceGroups.get(-1)?.push(target);
        }
      });
      
      // Sort groups by distance
      const sortedGroups = Array.from(distanceGroups.entries()).sort((a, b) => a[0] - b[0]);
      
      // Flatten the groups
      groupedTargets = sortedGroups.flatMap(([_, items]) => items);
      break;
    }
      
    case GroupingStrategy.CUSTOM:
      // No default implementation, rely on custom grouping by client code
      groupedTargets = targets;
      break;
  }
  
  return groupedTargets;
}

/**
 * Calculate delays for staggered animation
 * @param targets Ordered target elements
 * @param config Animation configuration
 * @returns Delay map for each element
 */
function calculateDelays(
  targets: StaggerTarget[],
  config: StaggeredAnimationConfig
): Map<string | HTMLElement, number> {
  const {
    staggerDelay = 50,
    startDelay = 0,
    maxTotalDuration,
    customDelayCalculator,
    easing = DistributionEasing.LINEAR,
    customEasing,
  } = config;
  
  const delays = new Map<string | HTMLElement, number>();
  const easingFn = getEasingFunction(easing, customEasing);
  
  // Calculate delays for each element
  targets.forEach((target, index) => {
    if (customDelayCalculator) {
      // Use custom delay calculation
      const delay = customDelayCalculator(target, index, targets.length);
      delays.set(target.element, startDelay + delay);
    } else {
      // Calculate progress through the sequence (0-1)
      const progress = index / (targets.length - 1 || 1);
      
      // Apply easing to the progress
      const easedProgress = easingFn(progress);
      
      // Calculate delay based on eased progress
      let delay: number;
      
      if (maxTotalDuration) {
        // If max total duration is specified, distribute delays proportionally
        delay = startDelay + easedProgress * (maxTotalDuration - (config.duration || 300));
      } else {
        // Otherwise use fixed stagger delay
        delay = startDelay + easedProgress * staggerDelay * (targets.length - 1);
      }
      
      // Add element-specific delay if specified
      if (target.delay !== undefined) {
        delay += target.delay;
      }
      
      delays.set(target.element, delay);
    }
  });
  
  return delays;
}

/**
 * Calculate durations for staggered animation
 * @param targets Ordered target elements
 * @param config Animation configuration
 * @returns Duration map for each element
 */
function calculateDurations(
  targets: StaggerTarget[],
  config: StaggeredAnimationConfig
): Map<string | HTMLElement, number> {
  const { duration = 300 } = config;
  const durations = new Map<string | HTMLElement, number>();
  
  // Calculate durations for each element
  targets.forEach(target => {
    // Use element-specific duration if provided, otherwise use config duration
    durations.set(target.element, target.duration !== undefined ? target.duration : duration);
  });
  
  return durations;
}

/**
 * Create a staggered animation configuration
 * @param config Staggered animation configuration
 * @returns Stagger result with calculated delays and methods
 */
export function createStaggeredAnimation(config: StaggeredAnimationConfig): StaggerResult {
  const {
    targets,
    animation,
    pattern = DistributionPattern.LINEAR,
    direction = StaggerDirection.TOP_DOWN,
    grouping = GroupingStrategy.NONE,
    categories,
    referencePoint,
    customDistribution,
    debug = false,
  } = config;
  
  // Step 1: Order elements based on distribution pattern
  let orderedTargets = calculateElementOrder(targets, pattern, direction, referencePoint);
  
  // Step 2: Apply grouping strategy if specified
  orderedTargets = applyGrouping(orderedTargets, grouping, categories);
  
  // Step 3: Apply custom distribution if provided
  if (customDistribution) {
    orderedTargets = customDistribution(orderedTargets);
  }
  
  // Step 4: Calculate delays for each element
  const delays = calculateDelays(orderedTargets, config);
  
  // Step 5: Calculate durations for each element
  const durations = calculateDurations(orderedTargets, config);
  
  // Calculate total duration of the sequence
  let totalDuration = 0;
  
  orderedTargets.forEach(target => {
    const delay = delays.get(target.element) || 0;
    const duration = durations.get(target.element) || 300;
    const endTime = delay + duration;
    
    if (endTime > totalDuration) {
      totalDuration = endTime;
    }
  });
  
  // Debug logging
  if (debug) {
    console.log('Staggered Animation:');
    console.log('- Total targets:', targets.length);
    console.log('- Pattern:', pattern);
    console.log('- Direction:', direction);
    console.log('- Grouping:', grouping);
    console.log('- Total duration:', totalDuration);
    
    orderedTargets.forEach((target, index) => {
      const delay = delays.get(target.element) || 0;
      const duration = durations.get(target.element) || 300;
      
      console.log(`Target ${index}:`, {
        element: typeof target.element === 'string' ? target.element : 'HTMLElement',
        delay,
        duration,
        position: target.position,
        category: target.category,
      });
    });
  }
  
  // Create animation IDs for tracking
  const animationIds = new Map<string | HTMLElement, string>();
  
  orderedTargets.forEach((target, index) => {
    const elementId = typeof target.element === 'string' 
      ? target.element 
      : `element-${index}`;
    
    animationIds.set(target.element, `stagger-${elementId}-${Date.now()}-${index}`);
  });
  
  // Return result object
  const result: StaggerResult = {
    delays,
    durations,
    totalDuration,
    order: orderedTargets.map(target => target.element),
    
    // Play method
    play: async () => {
      const promises: Promise<void>[] = [];
      
      // Create and play animations for each target
      orderedTargets.forEach(target => {
        const delay = delays.get(target.element) || 0;
        const duration = durations.get(target.element) || 300;
        const animationId = animationIds.get(target.element) || `stagger-${Date.now()}`;
        
        // Resolve target element
        let element: HTMLElement | null = null;
        
        if (typeof target.element === 'string') {
          element = document.querySelector(target.element);
        } else {
          element = target.element;
        }
        
        if (!element) {
          if (debug) {
            console.warn(`Element not found: ${target.element}`);
          }
          return;
        }
        
        // Create animation promise
        const promise = new Promise<void>(resolve => {
          // Create animation sequence
          animationOrchestrator.createSequence(animationId, {
            targets: [
              {
                target: element,
                animation,
                delay,
                duration,
                waitForCompletion: true,
              }
            ],
            autoPlay: true,
          });
          
          // Listen for completion
          const completeListener = (event: { type: AnimationEventType; target: string; animation: string; timestamp: number; }) => {
            // Check if the event target matches the element string selector or the generic 'element' identifier
            const targetMatches = (typeof target.element === 'string' && event.target === target.element) || 
                                (target.element instanceof HTMLElement && event.target === 'element');

            if (targetMatches && event.animation === animationId) {
              animationEventBus.off('complete', completeListener);
              resolve();
            }
          };
          
          animationEventBus.on('complete', completeListener);
          
          // Add a timeout fallback to resolve in case the complete event is missed
          setTimeout(() => {
            animationEventBus.off('complete', completeListener);
            resolve();
          }, delay + duration + 100);
        });
        
        promises.push(promise);
      });
      
      // Wait for all animations to complete
      await Promise.all(promises);
    },
    
    // Cancel method
    cancel: () => {
      // Stop all animations
      animationIds.forEach(animationId => {
        animationOrchestrator.stop(animationId);
      });
    }
  };
  
  // Auto-play if specified
  if (config.autoPlay) {
    result.play();
  }
  
  return result;
}

/**
 * Staggered animation utility class
 */
export class StaggeredAnimator {
  /** Animation configurations */
  private configs: Map<string, StaggeredAnimationConfig> = new Map();
  
  /** Stagger results */
  private results: Map<string, StaggerResult> = new Map();
  
  /** Debug mode */
  private debug = false;
  
  /**
   * Create a new staggered animator
   * @param debug Whether to enable debug mode
   */
  constructor(debug = false) {
    this.debug = debug;
  }
  
  /**
   * Create a staggered animation
   * @param id Unique ID for this animation
   * @param config Animation configuration
   * @returns Stagger result
   */
  createAnimation(id: string, config: StaggeredAnimationConfig): StaggerResult {
    // Save configuration
    this.configs.set(id, {
      ...config,
      debug: this.debug,
    });
    
    // Create animation
    const result = createStaggeredAnimation({
      ...config,
      debug: this.debug,
    });
    
    // Save result
    this.results.set(id, result);
    
    return result;
  }
  
  /**
   * Play a staggered animation
   * @param id Animation ID
   * @returns Promise that resolves when animation completes
   */
  async play(id: string): Promise<void> {
    const result = this.results.get(id);
    
    if (!result) {
      if (this.debug) {
        console.warn(`Animation not found: ${id}`);
      }
      return;
    }
    
    return result.play();
  }
  
  /**
   * Cancel a staggered animation
   * @param id Animation ID
   */
  cancel(id: string): void {
    const result = this.results.get(id);
    
    if (result) {
      result.cancel();
    }
  }
  
  /**
   * Get animation result
   * @param id Animation ID
   * @returns Stagger result or undefined
   */
  getResult(id: string): StaggerResult | undefined {
    return this.results.get(id);
  }
  
  /**
   * Get animation configuration
   * @param id Animation ID
   * @returns Animation configuration or undefined
   */
  getConfig(id: string): StaggeredAnimationConfig | undefined {
    return this.configs.get(id);
  }
  
  /**
   * Remove an animation
   * @param id Animation ID
   * @returns True if animation was removed
   */
  removeAnimation(id: string): boolean {
    const result = this.results.get(id);
    
    if (result) {
      result.cancel();
      this.results.delete(id);
      this.configs.delete(id);
      return true;
    }
    
    return false;
  }
  
  /**
   * Clear all animations
   */
  clear(): void {
    // Cancel all animations
    this.results.forEach(result => {
      result.cancel();
    });
    
    // Clear maps
    this.results.clear();
    this.configs.clear();
  }
  
  /**
   * Set debug mode
   * @param enabled Whether debug mode is enabled
   * @returns This animator for chaining
   */
  setDebugMode(enabled: boolean): StaggeredAnimator {
    this.debug = enabled;
    return this;
  }
}

/**
 * Global staggered animator instance
 */
export const staggeredAnimator = new StaggeredAnimator();