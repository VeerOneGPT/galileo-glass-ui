/**
 * Style Caching System
 * 
 * Provides efficient style caching to minimize style calculations and DOM updates
 * for improved rendering performance of glass UI components.
 */

/**
 * Style cache entry
 */
interface StyleCacheEntry {
  /** CSS rules as a string */
  cssText: string;
  
  /** When this entry was created */
  timestamp: number;
  
  /** How many times this style has been accessed */
  accessCount: number;
  
  /** Hash of the props used to generate this style */
  propsHash: string;
  
  /** Component type this style belongs to */
  componentType: string;
  
  /** Whether this style is for a glass component */
  isGlass: boolean;
}

/**
 * Style cache statistics
 */
interface StyleCacheStats {
  /** Total number of entries in the cache */
  totalEntries: number;
  
  /** Number of hits (successfully retrieved from cache) */
  cacheHits: number;
  
  /** Number of misses (styles that had to be generated) */
  cacheMisses: number;
  
  /** Hit rate percentage */
  hitRate: number;
  
  /** Number of times the cache was cleared */
  clearCount: number;
  
  /** Number of entries evicted due to size limits */
  evictionCount: number;
  
  /** Current memory usage in bytes (approximate) */
  memoryUsage: number;
  
  /** Number of entries by component type */
  entriesByComponent: Record<string, number>;
}

/**
 * Style cache configuration
 */
interface StyleCacheConfig {
  /** Maximum number of entries to store */
  maxEntries?: number;
  
  /** Whether to automatically prune old entries */
  autoPrune?: boolean;
  
  /** How often to prune in milliseconds */
  pruneInterval?: number;
  
  /** Maximum age of entries in milliseconds */
  maxAge?: number;
  
  /** Whether to track detailed statistics */
  trackStats?: boolean;
  
  /** Whether to enable component-specific cache limits */
  useComponentLimits?: boolean;
  
  /** Maximum entries per component type */
  maxEntriesPerComponent?: number;
  
  /** Debug mode */
  debug?: boolean;
}

/**
 * Style cache key generation options
 */
interface KeyGenOptions {
  /** Properties to include in key generation */
  include?: string[];
  
  /** Properties to exclude from key generation */
  exclude?: string[];
  
  /** Whether to sort properties alphabetically */
  sortProps?: boolean;
  
  /** Custom key prefix */
  keyPrefix?: string;
}

/**
 * Style Cache System
 * 
 * Optimizes rendering performance by caching generated CSS styles
 * to avoid redundant style calculations.
 */
export class StyleCache {
  private cache: Map<string, StyleCacheEntry> = new Map();
  private config: Required<StyleCacheConfig>;
  private stats: StyleCacheStats;
  private pruneTimerId: NodeJS.Timeout | null = null;
  
  /**
   * Create a new style cache
   */
  constructor(config: StyleCacheConfig = {}) {
    this.config = {
      maxEntries: config.maxEntries ?? 1000,
      autoPrune: config.autoPrune ?? true,
      pruneInterval: config.pruneInterval ?? 60000, // 1 minute
      maxAge: config.maxAge ?? 3600000, // 1 hour
      trackStats: config.trackStats ?? true,
      useComponentLimits: config.useComponentLimits ?? true,
      maxEntriesPerComponent: config.maxEntriesPerComponent ?? 100,
      debug: config.debug ?? false
    };
    
    this.stats = {
      totalEntries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      clearCount: 0,
      evictionCount: 0,
      memoryUsage: 0,
      entriesByComponent: {}
    };
    
    if (this.config.autoPrune) {
      this.startAutoPrune();
    }
  }
  
  /**
   * Get a style from cache, or generate and cache if not found
   */
  public getOrSet(
    key: string,
    generator: () => string,
    componentType: string = 'unknown',
    isGlass: boolean = false,
    props: Record<string, any> = {}
  ): string {
    // Check if style exists in cache
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      entry.accessCount++;
      
      if (this.config.trackStats) {
        this.stats.cacheHits++;
        this.updateHitRate();
      }
      
      return entry.cssText;
    }
    
    // Style not in cache, generate it
    if (this.config.trackStats) {
      this.stats.cacheMisses++;
      this.updateHitRate();
    }
    
    // Generate the style
    const cssText = generator();
    
    // Cache the generated style
    const propsHash = this.hashProps(props);
    
    this.cache.set(key, {
      cssText,
      timestamp: Date.now(),
      accessCount: 1,
      propsHash,
      componentType,
      isGlass
    });
    
    if (this.config.trackStats) {
      this.stats.totalEntries = this.cache.size;
      this.stats.memoryUsage = this.estimateMemoryUsage();
      
      // Track by component type
      this.stats.entriesByComponent[componentType] = 
        (this.stats.entriesByComponent[componentType] || 0) + 1;
    }
    
    // Check if cache is oversized
    this.enforceMaxEntries();
    
    if (this.config.useComponentLimits) {
      this.enforceComponentLimits(componentType);
    }
    
    return cssText;
  }
  
  /**
   * Check if a style is cached
   */
  public has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Get a style from cache
   */
  public get(key: string): string | null {
    if (!this.cache.has(key)) return null;
    
    const entry = this.cache.get(key)!;
    entry.accessCount++;
    
    if (this.config.trackStats) {
      this.stats.cacheHits++;
      this.updateHitRate();
    }
    
    return entry.cssText;
  }
  
  /**
   * Set a style in cache
   */
  public set(
    key: string, 
    cssText: string, 
    componentType: string = 'unknown', 
    isGlass: boolean = false,
    props: Record<string, any> = {}
  ): void {
    const propsHash = this.hashProps(props);
    
    this.cache.set(key, {
      cssText,
      timestamp: Date.now(),
      accessCount: 0,
      propsHash,
      componentType,
      isGlass
    });
    
    if (this.config.trackStats) {
      this.stats.totalEntries = this.cache.size;
      this.stats.memoryUsage = this.estimateMemoryUsage();
      
      // Track by component type
      this.stats.entriesByComponent[componentType] = 
        (this.stats.entriesByComponent[componentType] || 0) + 1;
    }
    
    // Check if cache is oversized
    this.enforceMaxEntries();
    
    if (this.config.useComponentLimits) {
      this.enforceComponentLimits(componentType);
    }
  }
  
  /**
   * Remove a style from cache
   */
  public remove(key: string): boolean {
    if (!this.cache.has(key)) return false;
    
    const entry = this.cache.get(key)!;
    const deleted = this.cache.delete(key);
    
    if (deleted && this.config.trackStats) {
      this.stats.totalEntries = this.cache.size;
      this.stats.memoryUsage = this.estimateMemoryUsage();
      
      // Update component counts
      if (this.stats.entriesByComponent[entry.componentType]) {
        this.stats.entriesByComponent[entry.componentType]--;
      }
    }
    
    return deleted;
  }
  
  /**
   * Generate a cache key from component props
   */
  public createKey(
    componentType: string,
    props: Record<string, any>,
    options: KeyGenOptions = {}
  ): string {
    const {
      include,
      exclude,
      sortProps = true,
      keyPrefix = ''
    } = options;
    
    // Filter props if needed
    let filteredProps: Record<string, any> = { ...props };
    
    if (include) {
      filteredProps = {};
      include.forEach(prop => {
        if (prop in props) {
          filteredProps[prop] = props[prop];
        }
      });
    }
    
    if (exclude) {
      exclude.forEach(prop => {
        delete filteredProps[prop];
      });
    }
    
    // Handle complex objects by stringifying
    const processedProps: Record<string, string> = {};
    
    Object.entries(filteredProps).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        processedProps[key] = JSON.stringify(value);
      } else {
        processedProps[key] = String(value);
      }
    });
    
    // Create key parts
    let keyParts: string[] = [];
    
    if (sortProps) {
      keyParts = Object.keys(processedProps)
        .sort()
        .map(key => `${key}:${processedProps[key]}`);
    } else {
      keyParts = Object.entries(processedProps)
        .map(([key, value]) => `${key}:${value}`);
    }
    
    // Build the full key
    const prefix = keyPrefix ? `${keyPrefix}:` : '';
    return `${prefix}${componentType}:${keyParts.join('|')}`;
  }
  
  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
    
    if (this.config.trackStats) {
      this.stats.clearCount++;
      this.stats.totalEntries = 0;
      this.stats.memoryUsage = 0;
      this.stats.entriesByComponent = {};
    }
  }
  
  /**
   * Get current cache statistics
   */
  public getStats(): StyleCacheStats {
    return { ...this.stats };
  }
  
  /**
   * Get all cached entries for a component type
   */
  public getEntriesByComponent(componentType: string): string[] {
    const entries: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.componentType === componentType) {
        entries.push(key);
      }
    });
    
    return entries;
  }
  
  /**
   * Get all cached glass styles
   */
  public getGlassEntries(): string[] {
    const entries: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.isGlass) {
        entries.push(key);
      }
    });
    
    return entries;
  }
  
  /**
   * Prune old or rarely used entries
   */
  public prune(maxAge: number = this.config.maxAge): number {
    const now = Date.now();
    let pruneCount = 0;
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > maxAge) {
        this.remove(key);
        pruneCount++;
      }
    });
    
    if (this.config.debug && pruneCount > 0) {
      console.log(`StyleCache: Pruned ${pruneCount} old entries`);
    }
    
    return pruneCount;
  }
  
  /**
   * Start automatic pruning of old entries
   */
  public startAutoPrune(): void {
    if (this.pruneTimerId) {
      clearInterval(this.pruneTimerId);
    }
    
    this.pruneTimerId = setInterval(() => {
      this.prune();
    }, this.config.pruneInterval);
  }
  
  /**
   * Stop automatic pruning
   */
  public stopAutoPrune(): void {
    if (this.pruneTimerId) {
      clearInterval(this.pruneTimerId);
      this.pruneTimerId = null;
    }
  }
  
  /**
   * Estimate memory usage of the cache
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    this.cache.forEach((entry) => {
      // Estimate size of each property in bytes
      const entrySizeEstimate = 
        entry.cssText.length * 2 + // String characters (2 bytes each in JS)
        8 + // timestamp (number = 8 bytes)
        8 + // accessCount (number = 8 bytes)
        entry.propsHash.length * 2 + // String characters
        entry.componentType.length * 2 + // String characters
        4; // Boolean (isGlass) + object overhead
      
      totalSize += entrySizeEstimate;
    });
    
    return totalSize;
  }
  
  /**
   * Enforce maximum entries limit
   */
  private enforceMaxEntries(): void {
    if (this.cache.size <= this.config.maxEntries) return;
    
    // Sort by age and access count to find least valuable entries
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        entry,
        // Score is based on recency and access count
        // Higher score = more valuable to keep
        score: (entry.accessCount + 1) * (1 / (Date.now() - entry.timestamp + 1))
      }))
      .sort((a, b) => a.score - b.score); // Ascending, to remove lowest scores first
    
    // Remove oldest entries until we're under the limit
    const entriesToRemove = entries.slice(0, this.cache.size - this.config.maxEntries);
    
    entriesToRemove.forEach(({ key, entry }) => {
      this.cache.delete(key);
      
      if (this.config.trackStats) {
        this.stats.evictionCount++;
        
        // Update component counts
        if (this.stats.entriesByComponent[entry.componentType]) {
          this.stats.entriesByComponent[entry.componentType]--;
        }
      }
    });
    
    if (this.config.trackStats) {
      this.stats.totalEntries = this.cache.size;
      this.stats.memoryUsage = this.estimateMemoryUsage();
    }
    
    if (this.config.debug && entriesToRemove.length > 0) {
      console.log(`StyleCache: Evicted ${entriesToRemove.length} entries due to size limit`);
    }
  }
  
  /**
   * Enforce component-specific limits
   */
  private enforceComponentLimits(componentType: string): void {
    if (!this.config.useComponentLimits) return;
    
    // Count entries for this component
    let componentEntries: [string, StyleCacheEntry][] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.componentType === componentType) {
        componentEntries.push([key, entry]);
      }
    });
    
    // Check if we need to remove entries
    if (componentEntries.length <= this.config.maxEntriesPerComponent) return;
    
    // Sort by age and access count
    componentEntries.sort((a, b) => {
      const scoreA = (a[1].accessCount + 1) * (1 / (Date.now() - a[1].timestamp + 1));
      const scoreB = (b[1].accessCount + 1) * (1 / (Date.now() - b[1].timestamp + 1));
      return scoreA - scoreB; // Ascending, to remove lowest scores first
    });
    
    // Remove excess entries
    const entriesToRemove = componentEntries.slice(
      0, 
      componentEntries.length - this.config.maxEntriesPerComponent
    );
    
    entriesToRemove.forEach(([key]) => {
      this.cache.delete(key);
      
      if (this.config.trackStats) {
        this.stats.evictionCount++;
        
        // Update component counts
        if (this.stats.entriesByComponent[componentType]) {
          this.stats.entriesByComponent[componentType]--;
        }
      }
    });
    
    if (this.config.trackStats) {
      this.stats.totalEntries = this.cache.size;
      this.stats.memoryUsage = this.estimateMemoryUsage();
    }
  }
  
  /**
   * Create a hash of props for comparison
   */
  private hashProps(props: Record<string, any>): string {
    try {
      // Generate a simple hash for props
      const propsJson = JSON.stringify(props);
      
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < propsJson.length; i++) {
        const char = propsJson.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return hash.toString(36);
    } catch (e) {
      return 'error-hash';
    }
  }
  
  /**
   * Update the hit rate statistic
   */
  private updateHitRate(): void {
    const totalAccesses = this.stats.cacheHits + this.stats.cacheMisses;
    this.stats.hitRate = totalAccesses > 0 ? 
      Math.round((this.stats.cacheHits / totalAccesses) * 100) : 0;
  }
}

/**
 * Global style cache for shared use
 */
export const globalStyleCache = new StyleCache({
  maxEntries: 2000,
  autoPrune: true,
  pruneInterval: 300000, // 5 minutes
  maxAge: 3600000 // 1 hour
});

/**
 * Create a new style cache with custom configuration
 */
export const createStyleCache = (config?: StyleCacheConfig): StyleCache => {
  return new StyleCache(config);
};

/**
 * Create and memoize a style function
 */
export function memoizeStyle<T extends Record<string, any>>(
  styleGenerator: (props: T) => string,
  options: {
    componentType: string;
    isGlass?: boolean;
    cache?: StyleCache;
    keyOptions?: KeyGenOptions;
  }
): (props: T) => string {
  const {
    componentType,
    isGlass = false,
    cache = globalStyleCache,
    keyOptions = {}
  } = options;
  
  // Return memoized function
  return (props: T): string => {
    // Generate cache key
    const cacheKey = cache.createKey(componentType, props, keyOptions);
    
    // Get or generate style
    return cache.getOrSet(
      cacheKey,
      () => styleGenerator(props),
      componentType,
      isGlass,
      props
    );
  };
}