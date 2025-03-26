/**
 * Tests for StyleCache
 */
import { StyleCache, memoizeStyle } from '../styleCache';

describe('StyleCache', () => {
  let cache: StyleCache;

  beforeEach(() => {
    // Create a fresh cache instance before each test
    cache = new StyleCache({
      maxEntries: 10,
      autoPrune: false, // Disable auto-pruning for tests
      trackStats: true,
    });
  });

  test('should store and retrieve values', () => {
    // Set a value
    cache.set('test-key', 'test-css', 'Button');

    // Get the value
    const value = cache.get('test-key');

    expect(value).toBe('test-css');
  });

  test('should use getOrSet to create new entries', () => {
    // Generate function
    const generator = jest.fn(() => 'generated-css');

    // First call should invoke generator
    const firstResult = cache.getOrSet('test-key', generator, 'Button');

    expect(firstResult).toBe('generated-css');
    expect(generator).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const secondResult = cache.getOrSet('test-key', generator, 'Button');

    expect(secondResult).toBe('generated-css');
    expect(generator).toHaveBeenCalledTimes(1); // Still only called once
  });

  test('should track cache statistics', () => {
    // Set values
    cache.set('key1', 'css1', 'Button');
    cache.set('key2', 'css2', 'Card');

    // Get a value (hit)
    cache.get('key1');

    // Use getOrSet for a miss
    const generator = jest.fn(() => 'new-css');
    cache.getOrSet('new-key', generator, 'Button');

    // Check stats
    const stats = cache.getStats();

    expect(stats.totalEntries).toBe(3);
    expect(stats.cacheHits).toBe(1);
    expect(stats.cacheMisses).toBe(1);
    expect(stats.hitRate).toBe(50); // 50%
  });

  test('should enforce max entries limit', () => {
    // Fill cache with items
    for (let i = 0; i < 15; i++) {
      cache.set(`key${i}`, `css${i}`, 'Button');
    }

    // Should have enforced the limit
    const stats = cache.getStats();
    expect(stats.totalEntries).toBe(10); // maxEntries from constructor
    expect(stats.evictionCount).toBe(5); // 15 entries - 10 max = 5 evicted
  });

  test('should generate cache keys from props', () => {
    const props = {
      variant: 'primary',
      size: 'medium',
      color: 'blue',
      disabled: false,
    };

    const key = cache.createKey('Button', props);

    // Key should be a string
    expect(typeof key).toBe('string');

    // Key should include component type
    expect(key).toContain('Button');

    // Key should include prop values
    expect(key).toContain('primary');
    expect(key).toContain('medium');
    expect(key).toContain('blue');
    expect(key).toContain('false');
  });

  test('should prune old entries', () => {
    // Set a timestamp mock to control "age" of entries
    const realDateNow = Date.now;

    try {
      // Mock Date.now to return a fixed time
      let mockedTime = 1000;
      Date.now = jest.fn(() => mockedTime);

      // Add entries at time 1000
      cache.set('old1', 'old-css1', 'Button');
      cache.set('old2', 'old-css2', 'Button');

      // Advance time by 2000ms
      mockedTime += 2000;

      // Add new entries
      cache.set('new1', 'new-css1', 'Button');
      cache.set('new2', 'new-css2', 'Button');

      // Prune entries older than 1500ms
      const prunedCount = cache.prune(1500);

      // Should have pruned the old entries
      expect(prunedCount).toBe(2);
      expect(cache.has('old1')).toBe(false);
      expect(cache.has('old2')).toBe(false);
      expect(cache.has('new1')).toBe(true);
      expect(cache.has('new2')).toBe(true);
    } finally {
      // Restore the original Date.now
      Date.now = realDateNow;
    }
  });

  test('should enforce per-component limits', () => {
    // Create a cache with component limits
    const componentCache = new StyleCache({
      maxEntriesPerComponent: 3,
      useComponentLimits: true,
      trackStats: true,
    });

    // Add Button entries
    componentCache.set('button1', 'css1', 'Button');
    componentCache.set('button2', 'css2', 'Button');
    componentCache.set('button3', 'css3', 'Button');
    componentCache.set('button4', 'css4', 'Button');
    componentCache.set('button5', 'css5', 'Button');

    // Add Card entries
    componentCache.set('card1', 'css1', 'Card');
    componentCache.set('card2', 'css2', 'Card');

    // Should have enforced the component limit for Button
    const buttonEntries = componentCache.getEntriesByComponent('Button');
    expect(buttonEntries.length).toBe(3);

    // Should not have affected Card entries
    const cardEntries = componentCache.getEntriesByComponent('Card');
    expect(cardEntries.length).toBe(2);
  });

  test('should track glass styles', () => {
    // Add mixed entries
    cache.set('button1', 'css1', 'Button', false);
    cache.set('button2', 'css2', 'Button', true); // Glass style
    cache.set('card1', 'css3', 'Card', false);
    cache.set('card2', 'css4', 'Card', true); // Glass style

    // Get glass entries
    const glassEntries = cache.getGlassEntries();

    expect(glassEntries.length).toBe(2);
    expect(glassEntries).toContain('button2');
    expect(glassEntries).toContain('card2');
  });

  test('should clear all entries', () => {
    // Add entries
    cache.set('key1', 'css1', 'Button');
    cache.set('key2', 'css2', 'Card');

    // Clear cache
    cache.clear();

    // Cache should be empty
    expect(cache.getStats().totalEntries).toBe(0);
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(false);
  });
});

describe('memoizeStyle', () => {
  test('should create a memoized style function', () => {
    // Create a cache for testing
    const cache = new StyleCache();

    // Mock style generator
    const styleGenerator = jest.fn(props => {
      return `color: ${props.color}; size: ${props.size};`;
    });

    // Create memoized function
    const memoizedStyleFn = memoizeStyle(styleGenerator, {
      componentType: 'Button',
      cache,
    });

    // Call with same props multiple times
    const props = { color: 'blue', size: 'medium' };

    memoizedStyleFn(props);
    memoizedStyleFn(props);
    memoizedStyleFn(props);

    // Generator should only be called once
    expect(styleGenerator).toHaveBeenCalledTimes(1);

    // Different props should call generator again
    memoizedStyleFn({ color: 'red', size: 'large' });

    expect(styleGenerator).toHaveBeenCalledTimes(2);
  });

  test('should use cached result for functionally equivalent props', () => {
    // Create a cache for testing
    const cache = new StyleCache();

    // Mock style generator
    const styleGenerator = jest.fn(props => {
      return `margin: ${props.margin};`;
    });

    // Create memoized function
    const memoizedStyleFn = memoizeStyle(styleGenerator, {
      componentType: 'Box',
      cache,
    });

    // First props object
    const props1 = { margin: 10 };
    memoizedStyleFn(props1);

    // New object with same values
    const props2 = { margin: 10 };
    memoizedStyleFn(props2);

    // Generator should only be called once
    expect(styleGenerator).toHaveBeenCalledTimes(1);
  });

  test('should handle custom key options', () => {
    // Create a cache for testing
    const cache = new StyleCache();

    // Mock style generator
    const styleGenerator = jest.fn(props => {
      return `color: ${props.color}; padding: ${props.padding};`;
    });

    // Create memoized function that only includes color in the key
    const memoizedStyleFn = memoizeStyle(styleGenerator, {
      componentType: 'Button',
      cache,
      keyOptions: {
        include: ['color'], // Only include color in the key
      },
    });

    // First set of props
    memoizedStyleFn({ color: 'blue', padding: '10px' });

    // Different padding, same color
    memoizedStyleFn({ color: 'blue', padding: '20px' });

    // Generator should only be called once since we only key on color
    expect(styleGenerator).toHaveBeenCalledTimes(1);

    // Different color should call generator again
    memoizedStyleFn({ color: 'red', padding: '10px' });

    expect(styleGenerator).toHaveBeenCalledTimes(2);
  });
});
