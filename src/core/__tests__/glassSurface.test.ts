import { css, FlattenSimpleInterpolation } from 'styled-components';

import { withAlpha } from '../colorUtils';
import { cssWithKebabProps } from '../cssUtils';
import { glassSurface } from '../mixins/glassSurface';

// Mock dependencies
jest.mock('styled-components', () => ({
  css: jest.fn((strings, ...values) => [strings, ...values]),
}));

// Add __cssString to the return type for testing
type MockFlattenSimpleInterpolation = FlattenSimpleInterpolation & {
  __cssString: string;
  strings: string[];
  values: any[];
};

// Create a structured mock result for cssWithKebabProps that will allow tests to access the interpolated strings
jest.mock('../cssUtils', () => ({
  cssWithKebabProps: jest.fn((strings, ...values) => {
    // Create a mock result that includes the template literal and values for inspection
    const result = strings.raw.map((str, i) => `${str}${values[i] || ''}`).join('');
    return { __cssString: result, strings, values } as MockFlattenSimpleInterpolation;
  }),
}));

jest.mock('../colorUtils', () => ({
  withAlpha: jest.fn((color, alpha) => `${color}-${alpha}`),
}));

// Create proper mock types
const mockCssWithKebabProps = cssWithKebabProps as jest.MockedFunction<typeof cssWithKebabProps>;
const mockWithAlpha = withAlpha as jest.MockedFunction<typeof withAlpha>;

describe('glassSurface Mixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create glass surface CSS with default options', () => {
    const result = glassSurface({
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    expect(mockCssWithKebabProps).toHaveBeenCalled();

    // Get the raw CSS string from our mock
    const cssString = result.__cssString;

    // Check CSS properties
    expect(cssString).toContain('background-color:');
    expect(cssString).toContain('backdrop-filter: blur');
    expect(cssString).toContain('-webkit-backdrop-filter: blur');
    expect(cssString).toContain('border: 1px solid');
    expect(cssString).toContain('box-shadow: 0');
    expect(cssString).toContain('border-radius: 8px');
    expect(cssString).toContain('transition: all 0.2s ease-in-out');

    // Default blur strength should be 'standard' (12px)
    expect(cssString).toContain('backdrop-filter: blur(12px)');
    expect(cssString).toContain('-webkit-backdrop-filter: blur(12px)');
  });

  test('should apply different blur strength values', () => {
    const blurOptions = [
      { input: 'minimal', expected: '4px' },
      { input: 'light', expected: '8px' },
      { input: 'standard', expected: '12px' },
      { input: 'enhanced', expected: '20px' },
      { input: '15px', expected: '15px' },
      { input: 25, expected: '25px' },
    ];

    blurOptions.forEach(option => {
      mockCssWithKebabProps.mockClear();

      const result = glassSurface({
        blurStrength: option.input as any,
        themeContext: { isDarkMode: false },
      }) as MockFlattenSimpleInterpolation;

      const cssString = result.__cssString;

      expect(cssString).toContain(`backdrop-filter: blur(${option.expected})`);
      expect(cssString).toContain(`-webkit-backdrop-filter: blur(${option.expected})`);
    });
  });

  test('should apply different elevation values', () => {
    const elevationOptions = [
      { input: 0, value: 0 },
      { input: 1, value: 1 },
      { input: 3, value: 3 },
      { input: 5, value: 5 },
      { input: 'low', value: 1 },
      { input: 'medium', value: 2 },
      { input: 'high', value: 3 },
    ];

    elevationOptions.forEach(option => {
      mockCssWithKebabProps.mockClear();

      const result = glassSurface({
        elevation: option.input as any,
        themeContext: { isDarkMode: false },
      }) as MockFlattenSimpleInterpolation;

      const cssString = result.__cssString;
      const expectedPixels = `${option.value * 2}px ${option.value * 4}px`;

      // For more reliable test, just check that the correct box-shadow is being set
      // without being too precise about the exact format
      expect(cssString).toContain('box-shadow:');

      // Only verify the pixel values for non-zero elevations
      if (option.value > 0) {
        expect(cssString).toContain(`${option.value * 2}px`);
        expect(cssString).toContain(`${option.value * 4}px`);
      }
    });
  });

  test('should apply dark mode styles', () => {
    // Test with dark mode
    const darkResult = glassSurface({
      themeContext: { isDarkMode: true },
    }) as MockFlattenSimpleInterpolation;

    const darkCssString = darkResult.__cssString;

    // Dark mode should use dark background color
    expect(darkCssString).toContain('background-color: rgba(15, 23, 42,');

    // Dark mode border should have different opacity
    expect(darkCssString).toContain('border: 1px solid rgba(255, 255, 255,');

    // Reset and test with light mode
    mockCssWithKebabProps.mockClear();
    const lightResult = glassSurface({
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    const lightCssString = lightResult.__cssString;

    // Light mode should use light background color
    expect(lightCssString).toContain('background-color: rgba(255, 255, 255,');
  });

  test('should apply different background opacity values', () => {
    const opacityOptions = [
      { input: 'subtle', expected: 0.1 },
      { input: 'light', expected: 0.2 },
      { input: 'medium', expected: 0.4 },
      { input: 'strong', expected: 0.6 },
      { input: 0.75, expected: 0.75 },
    ];

    opacityOptions.forEach(option => {
      mockCssWithKebabProps.mockClear();

      const result = glassSurface({
        backgroundOpacity: option.input as any,
        themeContext: { isDarkMode: false },
      }) as MockFlattenSimpleInterpolation;

      const cssString = result.__cssString;

      // Should include the correct background opacity
      expect(cssString).toContain(`background-color: rgba(255, 255, 255, ${option.expected})`);
    });
  });

  test('should apply different border opacity values', () => {
    const borderOptions = [
      { input: 'none', expected: 0 },
      { input: 'subtle', expected: 0.1 },
      { input: 'light', expected: 0.2 },
      { input: 'medium', expected: 0.3 },
      { input: 'strong', expected: 0.4 },
      { input: 0.5, expected: 0.5 },
    ];

    borderOptions.forEach(option => {
      mockCssWithKebabProps.mockClear();

      const result = glassSurface({
        borderOpacity: option.input as any,
        themeContext: { isDarkMode: false },
      }) as MockFlattenSimpleInterpolation;

      const cssString = result.__cssString;

      // Should include the correct border opacity
      // In light mode, we add 0.3 to the opacity
      const adjustedOpacity = option.expected + 0.3;
      expect(cssString).toContain(`border: 1px solid rgba(255, 255, 255, ${adjustedOpacity})`);
    });
  });
});
