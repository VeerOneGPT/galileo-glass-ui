/**
 * Tests for optimized styles
 */
import { getGPUAccelerationStyles, getOptimizedTransforms } from '../optimizedStyles';

describe('getGPUAccelerationStyles', () => {
  test('should return style object with GPU acceleration properties', () => {
    const styles = getGPUAccelerationStyles();
    
    expect(styles).toHaveProperty('transform', 'translateZ(0)');
    expect(styles).toHaveProperty('backfaceVisibility', 'hidden');
    expect(styles).toHaveProperty('willChange', 'transform, opacity');
  });
});

describe('getOptimizedTransforms', () => {
  test('should handle empty transforms', () => {
    const styles = getOptimizedTransforms({});
    
    expect(styles).toHaveProperty('transform', '');
    expect(styles).toHaveProperty('willChange', 'transform');
  });
  
  test('should create transform string with single transform', () => {
    const styles = getOptimizedTransforms({ translateX: 10 });
    
    expect(styles).toHaveProperty('transform', 'translateX(10px)');
    expect(styles).toHaveProperty('willChange', 'transform');
  });
  
  test('should create transform string with multiple transforms', () => {
    const styles = getOptimizedTransforms({
      translateX: 10,
      translateY: 20,
      scale: 1.5,
      rotate: 45
    });
    
    expect(styles.transform).toBe('translateX(10px) translateY(20px) scale(1.5) rotate(45deg)');
    expect(styles.willChange).toBe('transform');
  });
  
  test('should handle string values', () => {
    const styles = getOptimizedTransforms({
      translateX: '10px',
      scale: '1.5'
    });
    
    expect(styles.transform).toBe('translateX(10px) scale(1.5)');
  });
  
  test('should handle 3D transforms', () => {
    const styles = getOptimizedTransforms({
      translateX: 10,
      translateY: 20,
      translateZ: 5,
      rotateX: 30,
      rotateY: 45
    });
    
    expect(styles.transform).toBe('translateX(10px) translateY(20px) translateZ(5px) rotateX(30deg) rotateY(45deg)');
  });
  
  test('should handle scale variations', () => {
    const styles = getOptimizedTransforms({
      scaleX: 1.2,
      scaleY: 0.8
    });
    
    expect(styles.transform).toBe('scaleX(1.2) scaleY(0.8)');
  });
});