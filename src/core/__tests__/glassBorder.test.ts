import { FlattenSimpleInterpolation } from 'styled-components';

import { withAlpha } from '../colorUtils';
import { cssWithKebabProps } from '../cssUtils';
import { glassBorder } from '../mixins/glassBorder';

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

describe('glassBorder Mixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a default glass border', () => {
    const result = glassBorder({
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    expect(mockCssWithKebabProps).toHaveBeenCalled();

    // Get the CSS string from our mock
    const cssString = result.__cssString;

    // All borders should be present for default position 'all'
    expect(cssString).toContain('border-top:');
    expect(cssString).toContain('border-right:');
    expect(cssString).toContain('border-bottom:');
    expect(cssString).toContain('border-left:');

    // Should use default values
    expect(cssString).toContain('1px');
    expect(cssString).toContain('solid');
    expect(cssString).toContain('border-radius: 8px');
  });

  test('applies specific border positions', () => {
    const positions = [
      { position: 'top', expected: ['border-top:'] },
      { position: 'right', expected: ['border-right:'] },
      { position: 'bottom', expected: ['border-bottom:'] },
      { position: 'left', expected: ['border-left:'] },
      { position: 'horizontal', expected: ['border-top:', 'border-bottom:'] },
      { position: 'vertical', expected: ['border-right:', 'border-left:'] },
    ];

    for (const { position, expected } of positions) {
      mockCssWithKebabProps.mockClear();

      const result = glassBorder({
        position: position as any,
        themeContext: { isDarkMode: false },
      }) as MockFlattenSimpleInterpolation;

      const cssString = result.__cssString;

      // Check that only the correct borders are included
      for (const border of ['border-top:', 'border-right:', 'border-bottom:', 'border-left:']) {
        if (expected.includes(border)) {
          expect(cssString).toContain(border);
        } else {
          expect(cssString).not.toContain(border);
        }
      }
    }
  });

  test('applies custom width and style', () => {
    const result = glassBorder({
      width: 2,
      style: 'dashed',
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    const cssString = result.__cssString;
    expect(cssString).toContain('2px');
    expect(cssString).toContain('dashed');
  });

  test('handles string width values', () => {
    const result = glassBorder({
      width: '3px',
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    const cssString = result.__cssString;
    expect(cssString).toContain('3px');
  });

  test('applies custom border radius', () => {
    const result = glassBorder({
      radius: 16,
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    const cssString = result.__cssString;
    expect(cssString).toContain('border-radius: 16px');

    mockCssWithKebabProps.mockClear();

    const result2 = glassBorder({
      radius: '2rem',
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    const cssString2 = result2.__cssString;
    expect(cssString2).toContain('border-radius: 2rem');
  });

  test('applies different opacity levels', () => {
    const opacities = [
      { opacity: 'subtle', expected: 0.1 },
      { opacity: 'light', expected: 0.2 },
      { opacity: 'medium', expected: 0.3 },
      { opacity: 'strong', expected: 0.5 },
      { opacity: 0.75, expected: 0.75 },
    ];

    for (const { opacity, expected } of opacities) {
      mockWithAlpha.mockClear();

      glassBorder({
        opacity: opacity as any,
        themeContext: { isDarkMode: false },
      });

      // Check that withAlpha was called with correct opacity
      expect(mockWithAlpha).toHaveBeenCalledWith(expect.any(String), expected);
    }
  });

  test('applies gradient border when specified', () => {
    const result = glassBorder({
      gradient: true,
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    const cssString = result.__cssString;
    expect(cssString).toContain('border-image:');
    expect(cssString).toContain('linear-gradient');
  });

  test('applies glow effect when specified', () => {
    const result = glassBorder({
      glow: true,
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    const cssString = result.__cssString;
    expect(cssString).toContain('box-shadow:');
  });

  test('applies animated glow effect when specified', () => {
    const result = glassBorder({
      glow: true,
      animated: true,
      themeContext: { isDarkMode: false },
    }) as MockFlattenSimpleInterpolation;

    const cssString = result.__cssString;
    expect(cssString).toContain('animation:');
    expect(cssString).toContain('@keyframes glassBorderGlow');
  });

  test('handles custom glow intensity', () => {
    const intensities = [
      { intensity: 'subtle', expected: 0.2 },
      { intensity: 'light', expected: 0.3 },
      { intensity: 'medium', expected: 0.5 },
      { intensity: 'strong', expected: 0.8 },
      { intensity: 0.75, expected: 0.75 },
    ];

    for (const { intensity, expected } of intensities) {
      mockWithAlpha.mockClear();

      glassBorder({
        glow: true,
        glowIntensity: intensity as any,
        themeContext: { isDarkMode: false },
      });

      // Check that withAlpha was called with correct intensity
      expect(mockWithAlpha).toHaveBeenCalledWith(expect.any(String), expected);
    }
  });

  test('applies custom colors', () => {
    glassBorder({
      color: '#FF0000',
      themeContext: { isDarkMode: false },
    });

    // Check that withAlpha was called with correct color
    expect(mockWithAlpha).toHaveBeenCalledWith('#FF0000', expect.any(Number));

    mockWithAlpha.mockClear();

    glassBorder({
      glow: true,
      glowColor: '#00FF00',
      themeContext: { isDarkMode: false },
    });

    // Check that withAlpha was called with glow color
    expect(mockWithAlpha).toHaveBeenCalledWith('#00FF00', expect.any(Number));
  });

  test('handles dark mode differently', () => {
    glassBorder({
      themeContext: { isDarkMode: true },
    });

    // Default border color should be different in dark mode
    expect(mockWithAlpha).toHaveBeenCalledWith('rgba(255, 255, 255, 0.25)', expect.any(Number));

    mockWithAlpha.mockClear();

    glassBorder({
      themeContext: { isDarkMode: false },
    });

    // Default border color should be different in light mode
    expect(mockWithAlpha).toHaveBeenCalledWith('rgba(255, 255, 255, 0.75)', expect.any(Number));
  });
});
