/**
 * Fixed tests for the particle system
 */

import { particleSystem, ParticleSystemOptions } from '../particleSystem';

describe('Particle System (Fixed)', () => {
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
      
      // Check for keyframes without relying on specific naming
      expect(css).toContain('@keyframes particle');
    });
  });
  
  describe('Option handling', () => {
    test('respects particleCount option', () => {
      // Count keyframes as a rough indicator of particle count
      const countKeyframes = (css: string): number => {
        const regex = new RegExp('@keyframes particle', 'g');
        const matches = css.match(regex);
        return matches ? matches.length : 0;
      };
      
      const lowCount = particleSystem({ particleCount: 5 }).toString();
      const highCount = particleSystem({ particleCount: 30 }).toString();
      
      // Should have approximately the requested number of particles
      expect(countKeyframes(lowCount)).toBeLessThanOrEqual(5);
      expect(countKeyframes(highCount)).toBeLessThanOrEqual(30);
      
      // Verify the relative counts are as expected
      expect(countKeyframes(highCount)).toBeGreaterThan(countKeyframes(lowCount));
    });
    
    test('handles different particle types', () => {
      const types = ['confetti', 'dust', 'sparkle', 'bubble', 'smoke'] as const;
      
      types.forEach(type => {
        const css = particleSystem({ type, particleCount: 1 }).toString();
        
        // Each type should generate a keyframe with its name
        expect(css).toContain(`particle${type}`);
        
        // Each type should have different characteristic styles
        switch(type) {
          case 'sparkle':
            expect(css).toContain('clip-path: polygon');
            break;
          case 'bubble':
            expect(css).toContain('border-radius: 50%');
            expect(css).toContain('border:');
            break;
          case 'dust':
            expect(css).toContain('filter: blur');
            break;
          case 'smoke':
            expect(css).toContain('mix-blend-mode: screen');
            break;
          case 'confetti':
            // Confetti has varied border-radius
            expect(css).toContain('border-radius:');
            break;
        }
      });
    });
    
    test('applies GPU acceleration when requested', () => {
      const withGPU = particleSystem({ gpuAccelerated: true }).toString();
      const withoutGPU = particleSystem({ gpuAccelerated: false }).toString();
      
      // GPU accelerated styles
      expect(withGPU).toContain('will-change: transform, opacity');
      expect(withGPU).toContain('backface-visibility: hidden');
      
      // Non-GPU accelerated should omit these
      expect(withoutGPU).not.toContain('will-change: transform, opacity');
      expect(withoutGPU).not.toContain('backface-visibility: hidden');
    });
    
    test('reduces particle count in performance mode', () => {
      // Helper to extract keyframe count
      const countKeyframes = (css: string): number => {
        const regex = new RegExp('@keyframes particle', 'g');
        const matches = css.match(regex);
        return matches ? matches.length : 0;
      };
      
      const normalCount = 20;
      const normalMode = particleSystem({ 
        particleCount: normalCount, 
        performanceMode: false 
      }).toString();
      
      const performanceMode = particleSystem({ 
        particleCount: normalCount, 
        performanceMode: true 
      }).toString();
      
      // Performance mode should have approximately half the particles
      const normalKeyframes = countKeyframes(normalMode);
      const perfKeyframes = countKeyframes(performanceMode);
      
      expect(perfKeyframes).toBeLessThan(normalKeyframes);
      
      // Should be approximately half, but use a range to avoid brittle tests
      const ratio = perfKeyframes / normalKeyframes;
      expect(ratio).toBeGreaterThanOrEqual(0.4);
      expect(ratio).toBeLessThanOrEqual(0.6);
    });
    
    test('respects reducedMotion setting', () => {
      const normalMode = particleSystem({ reducedMotion: false }).toString();
      const reducedMode = particleSystem({ reducedMotion: true }).toString();
      
      // Normal mode should have animations
      expect(normalMode).toContain('@keyframes');
      
      // Reduced motion should only have minimal styles
      expect(reducedMode).not.toContain('@keyframes');
      expect(reducedMode).toContain('position: relative');
      
      // Reduced mode should be much shorter
      const reducedLines = reducedMode.trim().split('\n')
        .filter(line => line.trim() !== '').length;
      expect(reducedLines).toBeLessThan(3);
    });
    
    test('applies custom CSS when type is custom', () => {
      const customCSS = 'custom-property: value;';
      const result = particleSystem({ 
        type: 'custom', 
        particleCount: 1,
        customCss: customCSS 
      }).toString();
      
      // Should include custom CSS
      expect(result).toContain(customCSS);
      
      // Should not include animations
      expect(result).not.toContain('@keyframes');
    });
  });
  
  describe('Animation properties', () => {
    test('applies duration to animations', () => {
      const duration = 2000;
      const css = particleSystem({ 
        particleCount: 1, 
        duration: duration 
      }).toString();
      
      // Extract animation duration using regex
      const durationPattern = /animation:.*?(\d+)ms/;
      const match = css.match(durationPattern);
      
      // Animation duration should be approximately the specified amount
      if (match && match[1]) {
        const extractedDuration = parseInt(match[1], 10);
        
        // Duration should be close to specified value, but might have random variation
        // Use a 30% tolerance to account for implementation details
        const minDuration = duration * 0.7;
        const maxDuration = duration * 1.3;
        
        expect(extractedDuration).toBeGreaterThanOrEqual(minDuration);
        expect(extractedDuration).toBeLessThanOrEqual(maxDuration);
      } else {
        // If no match found, fail the test
        fail('Could not extract animation duration from CSS');
      }
    });
    
    test('creates fading animations when fadeOut is true', () => {
      // Create with fadeOut enabled
      const withFade = particleSystem({ 
        particleCount: 1, 
        fadeOut: true 
      }).toString();
      
      // Create with fadeOut disabled
      const withoutFade = particleSystem({ 
        particleCount: 1, 
        fadeOut: false 
      }).toString();
      
      // With fade should have opacity: 0 at the end of keyframes
      expect(withFade).toMatch(/100%.*opacity: 0/s);
      
      // Without fade should not have opacity: 0 at the end
      // It should either be opacity: 1 or not specify opacity in the final frame
      expect(withoutFade).not.toMatch(/100%.*opacity: 0/s);
    });
    
    test('applies colors to particles', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      const css = particleSystem({ 
        particleCount: 10, 
        colors: customColors 
      }).toString();
      
      // At least one of the custom colors should be used
      // (Can't check for all since they're randomly selected)
      const hasAtLeastOneColor = customColors.some(color => css.includes(color));
      expect(hasAtLeastOneColor).toBe(true);
    });
    
    test('applies spread to control particle movement', () => {
      // Helper to extract translation values
      const extractTranslate = (css: string, keyframe: string): { x: number, y: number } | null => {
        const pattern = new RegExp(`${keyframe}\\s*{[^}]*transform:\\s*translate\\(([^,]+),\\s*([^)]+)\\)`);
        const match = css.match(pattern);
        if (match) {
          return { 
            x: parseFloat(match[1]), 
            y: parseFloat(match[2]) 
          };
        }
        return null;
      };
      
      // Create particles with different spread values
      const lowSpread = 10;
      const highSpread = 1000;
      
      const lowSpreadCSS = particleSystem({ 
        particleCount: 1, 
        spread: lowSpread 
      }).toString();
      
      const highSpreadCSS = particleSystem({ 
        particleCount: 1, 
        spread: highSpread 
      }).toString();
      
      // Extract final positions from keyframes
      const lowValues = extractTranslate(lowSpreadCSS, '100%');
      const highValues = extractTranslate(highSpreadCSS, '100%');
      
      // Ensure we extracted values
      expect(lowValues).not.toBeNull();
      expect(highValues).not.toBeNull();
      
      if (lowValues && highValues) {
        // High spread should result in larger movement values
        const lowMagnitude = Math.sqrt(lowValues.x * lowValues.x + lowValues.y * lowValues.y);
        const highMagnitude = Math.sqrt(highValues.x * highValues.x + highValues.y * highValues.y);
        
        // High spread should move particles farther
        expect(highMagnitude).toBeGreaterThan(lowMagnitude);
        
        // Verify rough relationship between spread values and actual movement
        // (We can't expect exact ratio due to random factors in generation)
        const spreadRatio = highSpread / lowSpread;
        const magnitudeRatio = highMagnitude / lowMagnitude;
        
        // Magnitude ratio should be roughly proportional to spread ratio
        // within a reasonable tolerance (e.g., 0.1x to 10x of expected)
        expect(magnitudeRatio).toBeGreaterThan(spreadRatio * 0.1);
        expect(magnitudeRatio).toBeLessThan(spreadRatio * 10);
      }
    });
    
    test('applies gravity to particle movement', () => {
      // Helper to extract Y translation value
      const extractEndY = (css: string): number | null => {
        const pattern = /100%\s*{[^}]*transform:\s*translate\([^,]+,\s*([^)]+)\)/;
        const match = css.match(pattern);
        return match ? parseFloat(match[1]) : null;
      };
      
      // Create particles with different gravity settings
      const noGravityCSS = particleSystem({ 
        particleCount: 1, 
        gravity: 0 
      }).toString();
      
      const withGravityCSS = particleSystem({ 
        particleCount: 1, 
        gravity: 1 
      }).toString();
      
      // Extract final Y positions
      const noGravityY = extractEndY(noGravityCSS);
      const withGravityY = extractEndY(withGravityCSS);
      
      // Ensure we extracted values
      expect(noGravityY).not.toBeNull();
      expect(withGravityY).not.toBeNull();
      
      if (noGravityY !== null && withGravityY !== null) {
        // With gravity should have higher Y value (move down more)
        expect(withGravityY).toBeGreaterThan(noGravityY);
      }
    });
  });
  
  describe('Edge cases', () => {
    test('handles zero particles gracefully', () => {
      const css = particleSystem({ particleCount: 0 }).toString();
      
      // Should still have base styles but no keyframes
      expect(css).toContain('position: relative');
      expect(css).not.toContain('@keyframes');
    });
    
    test('falls back to default type for unrecognized types', () => {
      const css = particleSystem({ 
        // @ts-expect-error - Testing invalid type
        type: 'invalid', 
        particleCount: 1 
      }).toString();
      
      // Should still generate some CSS
      expect(css).toContain('position: relative');
      expect(css).toContain('@keyframes');
      
      // Should not crash or return empty string
      expect(css.length).toBeGreaterThan(100);
    });
    
    test('handles extreme values for options', () => {
      // Very large particle count should still work
      const largeCount = particleSystem({ particleCount: 1000 }).toString();
      expect(largeCount).toContain('position: relative');
      expect(largeCount).toContain('@keyframes');
      
      // Large size should work
      const largeSize = particleSystem({ 
        particleCount: 1, 
        size: 1000 
      }).toString();
      expect(largeSize).toContain('position: relative');
      expect(largeSize).toMatch(/width: \d{3,}px/);
      
      // Negative values should be handled gracefully
      const negativeValues = particleSystem({ 
        particleCount: 1, 
        size: -10, 
        spread: -10, 
        gravity: -1 
      }).toString();
      
      // Should still produce valid CSS without errors
      expect(negativeValues).toContain('position: relative');
      expect(negativeValues).toContain('@keyframes');
    });
  });
}); 