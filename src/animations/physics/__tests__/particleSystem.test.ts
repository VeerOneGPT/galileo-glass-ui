/**
 * Tests for the particle system
 */

import { particleSystem, ParticleSystemOptions } from '../particleSystem';

describe('Particle System', () => {
  describe('Basic functionality', () => {
    test('returns a css template literal', () => {
      const result = particleSystem();
      
      // Validate the result is a template literal
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('toString');
      expect(typeof result.toString).toBe('function');
      
      // Convert to string and check basic properties
      const css = result.toString();
      expect(typeof css).toBe('string');
      expect(css).toContain('position: relative');
    });
    
    test('generates styles with default options', () => {
      const css = particleSystem().toString();
      
      // Check for expected default styles
      expect(css).toContain('position: relative');
      expect(css).toContain('overflow: visible');
      expect(css).toContain('will-change: transform, opacity');
      expect(css).toContain('@keyframes particle');
      
      // Confetti is the default type
      expect(css).toContain('particleconfetti');
    });
  });
  
  describe('Option handling', () => {
    test('respects particleCount option', () => {
      // Count keyframes to verify particle count
      const countKeyframes = (css: string, type = 'confetti'): number => {
        const regex = new RegExp(`@keyframes particle${type}`, 'g');
        const matches = css.match(regex);
        return matches ? matches.length : 0;
      };
      
      const lowCount = particleSystem({ particleCount: 5 }).toString();
      const highCount = particleSystem({ particleCount: 30 }).toString();
      
      expect(countKeyframes(lowCount)).toBe(5);
      expect(countKeyframes(highCount)).toBe(30);
    });
    
    test('handles different particle types', () => {
      const types = ['confetti', 'dust', 'sparkle', 'bubble', 'smoke'] as const;
      
      types.forEach(type => {
        const css = particleSystem({ type, particleCount: 1 }).toString();
        expect(css).toContain(`particle${type}0`);
      });
      
      // Check for specific properties of each type
      expect(particleSystem({ type: 'sparkle', particleCount: 1 }).toString())
        .toContain('clip-path: polygon');
        
      expect(particleSystem({ type: 'bubble', particleCount: 1 }).toString())
        .toContain('border-radius: 50%');
        
      expect(particleSystem({ type: 'dust', particleCount: 1 }).toString())
        .toContain('filter: blur');
    });
    
    test('applies GPU acceleration when requested', () => {
      const withGPU = particleSystem({ gpuAccelerated: true }).toString();
      const withoutGPU = particleSystem({ gpuAccelerated: false }).toString();
      
      expect(withGPU).toContain('will-change: transform, opacity');
      expect(withGPU).toContain('backface-visibility: hidden');
      
      expect(withoutGPU).not.toContain('will-change: transform, opacity');
      expect(withoutGPU).not.toContain('backface-visibility: hidden');
    });
    
    test('reduces particle count in performance mode', () => {
      const countKeyframes = (css: string): number => {
        const regex = new RegExp('@keyframes particleconfetti', 'g');
        const matches = css.match(regex);
        return matches ? matches.length : 0;
      };
      
      const normalMode = particleSystem({ particleCount: 20, performanceMode: false }).toString();
      const performanceMode = particleSystem({ particleCount: 20, performanceMode: true }).toString();
      
      expect(countKeyframes(normalMode)).toBe(20);
      expect(countKeyframes(performanceMode)).toBe(10); // Half of normal
    });
    
    test('respects reducedMotion setting', () => {
      const normalMode = particleSystem({ reducedMotion: false }).toString();
      const reducedMode = particleSystem({ reducedMotion: true }).toString();
      
      // Reduced motion should only have position: relative
      expect(normalMode).toContain('@keyframes');
      expect(reducedMode).not.toContain('@keyframes');
      expect(reducedMode).toContain('position: relative');
      expect(reducedMode.trim().split('\n').filter(line => line.trim() !== '').length).toBeLessThan(3);
    });
    
    test('applies custom CSS when type is custom', () => {
      const customCSS = 'custom-property: value;';
      const result = particleSystem({ 
        type: 'custom', 
        particleCount: 1,
        customCss: customCSS 
      }).toString();
      
      expect(result).toContain(customCSS);
      expect(result).not.toContain('@keyframes');
    });
  });
  
  describe('Animation properties', () => {
    test('applies duration to animations', () => {
      const css = particleSystem({ 
        particleCount: 1, 
        duration: 2000 
      }).toString();
      
      // Should contain animation with approximately the specified duration
      expect(css).toMatch(/animation:.*2\d{3}ms/);
    });
    
    test('creates fading animations when fadeOut is true', () => {
      const withFade = particleSystem({ 
        particleCount: 1, 
        fadeOut: true 
      }).toString();
      
      const withoutFade = particleSystem({ 
        particleCount: 1, 
        fadeOut: false 
      }).toString();
      
      // With fade should have opacity: 0 at the end
      expect(withFade).toMatch(/100%.*opacity: 0/s);
      
      // Without fade should maintain opacity
      expect(withoutFade).not.toMatch(/100%.*opacity: 0/s);
    });
    
    test('applies colors to particles', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      const css = particleSystem({ 
        particleCount: 10, 
        colors: customColors 
      }).toString();
      
      // Should contain at least one of the custom colors
      // (We can't check for all since they're randomly selected)
      expect(
        customColors.some(color => css.includes(color))
      ).toBe(true);
    });
    
    test('applies spread to control particle movement', () => {
      const lowSpread = particleSystem({ 
        particleCount: 1, 
        spread: 10 
      }).toString();
      
      const highSpread = particleSystem({ 
        particleCount: 1, 
        spread: 1000 
      }).toString();
      
      // Extract transform translate values from 100% keyframe
      const extractEndTranslate = (css: string): { x: number, y: number } => {
        const match = css.match(/100%\s*{\s*transform: translate\(([^,]+),\s*([^)]+)\)/);
        if (match) {
          return { 
            x: parseFloat(match[1]), 
            y: parseFloat(match[2]) 
          };
        }
        return { x: 0, y: 0 };
      };
      
      const lowValues = extractEndTranslate(lowSpread);
      const highValues = extractEndTranslate(highSpread);
      
      // High spread should result in larger movement values
      expect(Math.abs(highValues.x)).toBeGreaterThan(Math.abs(lowValues.x));
      expect(Math.abs(highValues.y)).toBeGreaterThan(Math.abs(lowValues.y));
    });
    
    test('applies gravity to particle movement', () => {
      const noGravity = particleSystem({ 
        particleCount: 1, 
        gravity: 0 
      }).toString();
      
      const withGravity = particleSystem({ 
        particleCount: 1, 
        gravity: 1 
      }).toString();
      
      // Extract transform translate values from 100% keyframe
      const extractEndY = (css: string): number => {
        const match = css.match(/100%\s*{\s*transform: translate\([^,]+,\s*([^)]+)\)/);
        return match ? parseFloat(match[1]) : 0;
      };
      
      const noGravityY = extractEndY(noGravity);
      const withGravityY = extractEndY(withGravity);
      
      // With gravity should have higher Y value (move down more)
      expect(withGravityY).toBeGreaterThan(noGravityY);
    });
  });
  
  describe('Edge cases', () => {
    test('handles zero particles gracefully', () => {
      const css = particleSystem({ particleCount: 0 }).toString();
      
      // Should still have base styles but no keyframes
      expect(css).toContain('position: relative');
      expect(css).not.toContain('@keyframes');
    });
    
    test('falls back to confetti for unrecognized types', () => {
      const css = particleSystem({ 
        // @ts-expect-error - Testing invalid type
        type: 'invalid', 
        particleCount: 1 
      }).toString();
      
      // Should use confetti as fallback
      expect(css).toContain('particleconfetti0');
    });
    
    test('handles extreme values for options', () => {
      // Very large particle count
      const largeCount = particleSystem({ particleCount: 1000 }).toString();
      expect(largeCount).toContain('particleconfetti999');
      
      // Very large size
      const largeSize = particleSystem({ 
        particleCount: 1, 
        size: 1000 
      }).toString();
      expect(largeSize).toMatch(/width: \d{3,4}px/);
      
      // Negative values (should handle gracefully)
      const negativeValues = particleSystem({ 
        particleCount: 1, 
        size: -10, 
        spread: -10, 
        gravity: -1 
      }).toString();
      
      // Should still produce some CSS without errors
      expect(negativeValues).toContain('position: relative');
      expect(negativeValues).toContain('@keyframes');
    });
  });
});