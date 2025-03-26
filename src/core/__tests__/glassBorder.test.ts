import { withAlpha } from '../colorUtils';
import { cssWithKebabProps } from '../cssUtils';
import { glassBorder } from '../mixins/glassBorder';

// Create proper mock types
const mockCssWithKebabProps = cssWithKebabProps as jest.MockedFunction<typeof cssWithKebabProps>;
const mockWithAlpha = withAlpha as jest.MockedFunction<typeof withAlpha>;

// Mock dependencies
jest.mock('../cssUtils', () => ({
  cssWithKebabProps: jest.fn((...args) => args),
}));

jest.mock('../colorUtils', () => ({
  withAlpha: jest.fn((color, alpha) => `${color}-${alpha}`),
}));

describe('glassBorder Mixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a default glass border', () => {
    glassBorder({
      themeContext: { isDarkMode: false },
    });

    expect(mockCssWithKebabProps).toHaveBeenCalledWith(expect.any(Array), ...expect.any(Array));

    // Check arguments passed to cssWithKebabProps
    const args = mockCssWithKebabProps.mock.calls[0][0];

    // All borders should be present for default position 'all'
    expect(args[0]).toContain('border-top:');
    expect(args[0]).toContain('border-right:');
    expect(args[0]).toContain('border-bottom:');
    expect(args[0]).toContain('border-left:');

    // Should use default values
    expect(args[0]).toContain('1px');
    expect(args[0]).toContain('solid');
    expect(args[0]).toContain('border-radius: 8px');
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

      glassBorder({
        position: position as any,
        themeContext: { isDarkMode: false },
      });

      const args = mockCssWithKebabProps.mock.calls[0][0];

      // Check that only the correct borders are included
      for (const border of ['border-top:', 'border-right:', 'border-bottom:', 'border-left:']) {
        if (expected.includes(border)) {
          expect(args[0]).toContain(border);
        } else {
          expect(args[0]).not.toContain(border);
        }
      }
    }
  });

  test('applies custom width and style', () => {
    glassBorder({
      width: 2,
      style: 'dashed',
      themeContext: { isDarkMode: false },
    });

    const args = mockCssWithKebabProps.mock.calls[0][0];
    expect(args[0]).toContain('2px');
    expect(args[0]).toContain('dashed');
  });

  test('handles string width values', () => {
    glassBorder({
      width: '3px',
      themeContext: { isDarkMode: false },
    });

    const args = mockCssWithKebabProps.mock.calls[0][0];
    expect(args[0]).toContain('3px');
  });

  test('applies custom border radius', () => {
    glassBorder({
      radius: 16,
      themeContext: { isDarkMode: false },
    });

    const args = mockCssWithKebabProps.mock.calls[0][0];
    expect(args[0]).toContain('border-radius: 16px');

    mockCssWithKebabProps.mockClear();

    glassBorder({
      radius: '2rem',
      themeContext: { isDarkMode: false },
    });

    const args2 = mockCssWithKebabProps.mock.calls[0][0];
    expect(args2[0]).toContain('border-radius: 2rem');
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
    glassBorder({
      gradient: true,
      themeContext: { isDarkMode: false },
    });

    const args = mockCssWithKebabProps.mock.calls[0][0];
    expect(args[0]).toContain('border-image:');
    expect(args[0]).toContain('linear-gradient');
  });

  test('applies glow effect when specified', () => {
    glassBorder({
      glow: true,
      themeContext: { isDarkMode: false },
    });

    const args = mockCssWithKebabProps.mock.calls[0][0];
    expect(args[0]).toContain('box-shadow:');
  });

  test('applies animated glow effect when specified', () => {
    glassBorder({
      glow: true,
      animated: true,
      themeContext: { isDarkMode: false },
    });

    const args = mockCssWithKebabProps.mock.calls[0][0];
    expect(args[0]).toContain('animation:');
    expect(args[0]).toContain('@keyframes glassBorderGlow');
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
