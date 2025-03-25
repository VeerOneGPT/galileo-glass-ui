import { glassSurface } from '../mixins/glassSurface';
import { css } from 'styled-components';
import { cssWithKebabProps } from '../cssUtils';

// Mock dependencies
jest.mock('styled-components', () => ({
  css: jest.fn((...args) => args),
}));

jest.mock('../cssUtils', () => ({
  cssWithKebabProps: jest.fn((...args) => args),
}));

jest.mock('../colorUtils', () => ({
  withAlpha: jest.fn((color, alpha) => `${color}-${alpha}`),
}));

describe('glassSurface Mixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should create glass surface CSS with default options', () => {
    glassSurface({
      themeContext: { isDarkMode: false }
    });
    
    expect(cssWithKebabProps).toHaveBeenCalledWith(
      expect.any(Array),
      ...expect.any(Array)
    );
    
    // Check arguments passed to cssWithKebabProps
    const args = cssWithKebabProps.mock.calls[0][0];
    const interpolations = cssWithKebabProps.mock.calls[0].slice(1);
    
    // Check CSS properties
    expect(args[0]).toContain('background-color:');
    expect(args[0]).toContain('backdrop-filter: blur');
    expect(args[0]).toContain('-webkit-backdrop-filter: blur');
    expect(args[0]).toContain('border: 1px solid');
    expect(args[0]).toContain('box-shadow: 0');
    expect(args[0]).toContain('border-radius: 8px');
    expect(args[0]).toContain('transition: all 0.2s ease-in-out');
    
    // Default blur strength should be 'standard' (12px)
    expect(args[0]).toContain('backdrop-filter: blur(12px)');
    expect(args[0]).toContain('-webkit-backdrop-filter: blur(12px)');
  });
  
  test('should apply different blur strength values', () => {
    const blurOptions = [
      { input: 'minimal', expected: '4px' },
      { input: 'light', expected: '8px' },
      { input: 'standard', expected: '12px' },
      { input: 'enhanced', expected: '20px' },
      { input: '15px', expected: '15px' },
      { input: 25, expected: '25px' }
    ];
    
    blurOptions.forEach(option => {
      cssWithKebabProps.mockClear();
      
      glassSurface({
        blurStrength: option.input as any,
        themeContext: { isDarkMode: false }
      });
      
      const args = cssWithKebabProps.mock.calls[0][0];
      
      expect(args[0]).toContain(`backdrop-filter: blur(${option.expected})`);
      expect(args[0]).toContain(`-webkit-backdrop-filter: blur(${option.expected})`);
    });
  });
  
  test('should apply different elevation values', () => {
    const elevationOptions = [
      { input: 0, expected: '0 0px 0px' },
      { input: 1, expected: '0 2px 4px' },
      { input: 3, expected: '0 6px 12px' },
      { input: 5, expected: '0 10px 20px' },
      { input: 'low', expected: '0 2px 4px' },
      { input: 'medium', expected: '0 4px 8px' },
      { input: 'high', expected: '0 6px 12px' }
    ];
    
    elevationOptions.forEach(option => {
      cssWithKebabProps.mockClear();
      
      glassSurface({
        elevation: option.input as any,
        themeContext: { isDarkMode: false }
      });
      
      const args = cssWithKebabProps.mock.calls[0][0];
      
      // Check if shadow string contains the expected pattern
      const shadowPattern = option.expected;
      const containsPattern = args[0].includes(shadowPattern);
      
      expect(containsPattern).toBeTruthy();
    });
  });
  
  test('should apply dark mode styles', () => {
    // Test with dark mode
    glassSurface({
      themeContext: { isDarkMode: true }
    });
    
    const darkArgs = cssWithKebabProps.mock.calls[0][0];
    
    // Dark mode should use dark background color
    expect(darkArgs[0]).toContain('background-color: rgba(15, 23, 42,');
    
    // Dark mode border should have different opacity
    expect(darkArgs[0]).toContain('border: 1px solid rgba(255, 255, 255,');
    
    // Reset and test with light mode
    cssWithKebabProps.mockClear();
    glassSurface({
      themeContext: { isDarkMode: false }
    });
    
    const lightArgs = cssWithKebabProps.mock.calls[0][0];
    
    // Light mode should use light background color
    expect(lightArgs[0]).toContain('background-color: rgba(255, 255, 255,');
  });
  
  test('should apply different background opacity values', () => {
    const opacityOptions = [
      { input: 'subtle', expected: 0.1 },
      { input: 'light', expected: 0.2 },
      { input: 'medium', expected: 0.4 },
      { input: 'strong', expected: 0.6 },
      { input: 0.75, expected: 0.75 }
    ];
    
    opacityOptions.forEach(option => {
      cssWithKebabProps.mockClear();
      
      glassSurface({
        backgroundOpacity: option.input as any,
        themeContext: { isDarkMode: false }
      });
      
      const args = cssWithKebabProps.mock.calls[0][0];
      
      // Should include the correct background opacity
      expect(args[0]).toContain(`background-color: rgba(255, 255, 255, ${option.expected})`);
    });
  });
  
  test('should apply different border opacity values', () => {
    const borderOptions = [
      { input: 'none', expected: 0 },
      { input: 'subtle', expected: 0.1 },
      { input: 'light', expected: 0.2 },
      { input: 'medium', expected: 0.3 },
      { input: 'strong', expected: 0.4 },
      { input: 0.5, expected: 0.5 }
    ];
    
    borderOptions.forEach(option => {
      cssWithKebabProps.mockClear();
      
      glassSurface({
        borderOpacity: option.input as any,
        themeContext: { isDarkMode: false }
      });
      
      const args = cssWithKebabProps.mock.calls[0][0];
      
      // Should include the correct border opacity
      // In light mode, we add 0.3 to the opacity
      const adjustedOpacity = option.expected + 0.3;
      expect(args[0]).toContain(`border: 1px solid rgba(255, 255, 255, ${adjustedOpacity})`);
    });
  });
});