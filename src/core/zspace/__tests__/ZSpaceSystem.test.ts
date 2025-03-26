/**
 * Tests for ZSpaceSystem
 */
import {
  ZLayer,
  ZDepth,
  ZLayerDescription,
  DefaultZSpaceContext,
  zLayer,
  zDepth,
  zPerspective,
} from '../ZSpaceSystem';

describe('ZSpaceSystem', () => {
  describe('ZLayer enum', () => {
    test('has expected layer values', () => {
      // Test a sample of the values
      expect(ZLayer.Background).toBe(0);
      expect(ZLayer.Content).toBe(100);
      expect(ZLayer.Surface).toBe(300);
      expect(ZLayer.Modal).toBe(800);
      expect(ZLayer.TopLayer).toBe(9000);
    });
  });

  describe('ZDepth enum', () => {
    test('has expected depth values', () => {
      // Test a sample of the values
      expect(ZDepth.Background).toBe(-300);
      expect(ZDepth.Content).toBe(-100);
      expect(ZDepth.Surface).toBe(0);
      expect(ZDepth.Floating).toBe(100);
      expect(ZDepth.Top).toBe(300);
    });
  });

  describe('ZLayerDescription', () => {
    test('provides descriptions for all ZLayer values', () => {
      // Check that all ZLayer values have descriptions
      Object.values(ZLayer)
        .filter(value => typeof value === 'number')
        .forEach(layer => {
          const description = ZLayerDescription[layer as ZLayer];
          expect(description).toBeDefined();
          expect(typeof description).toBe('string');
          expect(description.length).toBeGreaterThan(0);
        });
    });
  });

  describe('DefaultZSpaceContext', () => {
    test('provides default context values', () => {
      expect(DefaultZSpaceContext.baseZIndex).toBe(0);
      expect(DefaultZSpaceContext.perspectiveDepth).toBe(1000);
      expect(DefaultZSpaceContext.animationsEnabled).toBe(true);
    });

    test('getZIndex returns the correct value', () => {
      expect(DefaultZSpaceContext.getZIndex(ZLayer.Modal)).toBe(800);
      expect(DefaultZSpaceContext.getZIndex(123)).toBe(123);
    });

    test('getZDepth returns the correct value', () => {
      expect(DefaultZSpaceContext.getZDepth(ZDepth.Floating)).toBe(100);
      expect(DefaultZSpaceContext.getZDepth(50)).toBe(50);
    });

    test('getTransformCSS returns the correct CSS', () => {
      expect(DefaultZSpaceContext.getTransformCSS(ZDepth.Floating)).toBe('translateZ(100px)');
      expect(DefaultZSpaceContext.getTransformCSS(50)).toBe('translateZ(50px)');
    });
  });

  describe('Utility Functions', () => {
    test('zLayer generates correct CSS for z-index', () => {
      const css = zLayer(ZLayer.Modal);
      expect(css).toContain('z-index: 800');
    });

    test('zLayer with depth generates CSS for z-index and transform', () => {
      const css = zLayer(ZLayer.Modal, ZDepth.Floating);
      expect(css).toContain('z-index: 800');
      expect(css).toContain('transform: translateZ(100px)');
    });

    test('zLayer accepts custom context', () => {
      const customContext = {
        ...DefaultZSpaceContext,
        getZIndex: () => 999,
      };
      const css = zLayer(ZLayer.Modal, undefined, customContext);
      expect(css).toContain('z-index: 999');
    });

    test('zDepth generates correct CSS for transform', () => {
      const css = zDepth(ZDepth.Floating);
      expect(css).toContain('transform: translateZ(100px)');
    });

    test('zDepth with extra transform appends to transform', () => {
      const css = zDepth(ZDepth.Floating, 'scale(1.2)');
      expect(css).toContain('transform: translateZ(100px) scale(1.2)');
    });

    test('zPerspective generates correct CSS for perspective', () => {
      const css = zPerspective();
      expect(css).toContain('perspective: 1000px');
      expect(css).toContain('perspective-origin: center center');
    });

    test('zPerspective accepts custom depth', () => {
      const css = zPerspective(2000);
      expect(css).toContain('perspective: 2000px');
    });
  });
});
