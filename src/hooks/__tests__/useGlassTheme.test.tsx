import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// Custom renderHook implementation that works with React 18
function renderHook<Result, Props>(
  renderCallback: (props: Props) => Result,
  options: { wrapper?: React.ComponentType<any> } = {}
) {
  const result = { current: {} as Result };

  const TestComponent = () => {
    result.current = renderCallback({} as Props);
    return null;
  };

  const DefaultWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const WrapperComponent = options.wrapper
    ? () => {
        const Wrapper = options.wrapper as React.ComponentType<{ children: React.ReactNode }>;
        return (
          <Wrapper>
            <TestComponent />
          </Wrapper>
        );
      }
    : () => (
        <DefaultWrapper>
          <TestComponent />
        </DefaultWrapper>
      );

  const { rerender, unmount } = render(<WrapperComponent />);

  return {
    result,
    rerender: () => rerender(<WrapperComponent />),
    unmount,
  };
}
import {
  GlassThemeContext,
  useGlassTheme,
  useThemeColor,
  useThemeColors,
  useThemeSpacing,
  useSpacing,
  useGlassEffectValues,
  useIsDarkMode,
  ColorMode,
  ThemeVariant,
  ThemeOptions,
} from '../useGlassTheme';

// Create a mock theme for testing
const mockTheme: ThemeOptions = {
  colorMode: 'light',
  themeVariant: 'default',
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },
    border: '#E5E7EB',
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  spacing: {
    unit: 8,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  effects: {
    borderRadius: {
      xs: '2px',
      sm: '4px',
      md: '8px',
      lg: '16px',
      xl: '24px',
    },
    boxShadow: {
      none: 'none',
      xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
      sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
      md: '0 4px 8px rgba(0, 0, 0, 0.12)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
      xl: '0 16px 32px rgba(0, 0, 0, 0.18)',
    },
    transition: {
      shortest: '0.1s',
      shorter: '0.2s',
      short: '0.3s',
      standard: '0.4s',
      complex: '0.5s',
    },
    glassEffects: {
      blur: {
        light: '5px',
        standard: '10px',
        strong: '20px',
      },
      opacity: {
        light: 0.1,
        medium: 0.2,
        heavy: 0.3,
      },
      glow: {
        light: '0 0 10px rgba(255, 255, 255, 0.1)',
        medium: '0 0 20px rgba(255, 255, 255, 0.15)',
        strong: '0 0 30px rgba(255, 255, 255, 0.2)',
      },
    },
  },
};

// Create a wrapper component that provides the theme context
const createWrapper = (
  initialColorMode: ColorMode = 'light',
  initialThemeVariant: ThemeVariant = 'default',
  initialDarkMode = false
) => {
  const setColorMode = jest.fn();
  const setThemeVariant = jest.fn();

  return ({ children }: { children: React.ReactNode }) => (
    <GlassThemeContext.Provider
      value={{
        colorMode: initialColorMode,
        themeVariant: initialThemeVariant,
        theme: mockTheme,
        setColorMode,
        setThemeVariant,
        isDarkMode: initialDarkMode,
      }}
    >
      {children}
    </GlassThemeContext.Provider>
  );
};

describe('useGlassTheme', () => {
  test('returns theme context', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGlassTheme(), { wrapper });

    expect(result.current.colorMode).toBe('light');
    expect(result.current.themeVariant).toBe('default');
    expect(result.current.theme).toEqual(mockTheme);
    expect(typeof result.current.setColorMode).toBe('function');
    expect(typeof result.current.setThemeVariant).toBe('function');
    expect(result.current.isDarkMode).toBe(false);
  });

  test('returns a default theme when used outside a GlassThemeProvider', () => {
    // In the current implementation, useGlassTheme doesn't throw an error
    // but returns a default theme context
    const { result } = renderHook(() => useGlassTheme());

    // Check that we have a theme object
    expect(result.current).toBeDefined();
    expect(result.current.theme).toBeDefined();
    expect(result.current.colorMode).toBeDefined();
  });
});

describe('useThemeColor', () => {
  test('returns the correct color value', () => {
    const wrapper = createWrapper();

    // Test simple color keys
    const { result: primaryResult } = renderHook(() => useThemeColor('primary'), { wrapper });
    expect(primaryResult.current).toBe('#6366F1');

    const { result: secondaryResult } = renderHook(() => useThemeColor('secondary'), { wrapper });
    expect(secondaryResult.current).toBe('#8B5CF6');

    const { result: errorResult } = renderHook(() => useThemeColor('error'), { wrapper });
    expect(errorResult.current).toBe('#EF4444');

    // Test nested text properties
    const { result: textPrimaryResult } = renderHook(() => useThemeColor('text.primary'), {
      wrapper,
    });
    expect(textPrimaryResult.current).toBe('#1F2937');

    const { result: textSecondaryResult } = renderHook(() => useThemeColor('text.secondary'), {
      wrapper,
    });
    expect(textSecondaryResult.current).toBe('#4B5563');
  });
});

describe('useThemeColors', () => {
  test('returns all theme colors', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useThemeColors(), { wrapper });

    expect(result.current).toEqual(mockTheme.colors);
  });
});

describe('useThemeSpacing', () => {
  test('returns theme spacing configuration', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useThemeSpacing(), { wrapper });

    expect(result.current).toEqual(mockTheme.spacing);
  });
});

describe('useSpacing', () => {
  test('returns spacing values for named scales', () => {
    const wrapper = createWrapper();

    const { result: xsResult } = renderHook(() => useSpacing('xs'), { wrapper });
    expect(xsResult.current).toBe(4);

    const { result: smResult } = renderHook(() => useSpacing('sm'), { wrapper });
    expect(smResult.current).toBe(8);

    const { result: mdResult } = renderHook(() => useSpacing('md'), { wrapper });
    expect(mdResult.current).toBe(16);

    const { result: lgResult } = renderHook(() => useSpacing('lg'), { wrapper });
    expect(lgResult.current).toBe(24);

    const { result: xlResult } = renderHook(() => useSpacing('xl'), { wrapper });
    expect(xlResult.current).toBe(32);
  });

  test('returns calculated spacing for numeric scales', () => {
    const wrapper = createWrapper();

    const { result: scale1 } = renderHook(() => useSpacing(1), { wrapper });
    expect(scale1.current).toBe(8); // 1 * unit(8)

    const { result: scale2 } = renderHook(() => useSpacing(2), { wrapper });
    expect(scale2.current).toBe(16); // 2 * unit(8)

    const { result: scale3 } = renderHook(() => useSpacing(3), { wrapper });
    expect(scale3.current).toBe(24); // 3 * unit(8)

    const { result: scale4 } = renderHook(() => useSpacing(4), { wrapper });
    expect(scale4.current).toBe(32); // 4 * unit(8)
  });
});

describe('useGlassEffectValues', () => {
  test('returns glass effect values from theme', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGlassEffectValues(), { wrapper });

    expect(result.current).toEqual(mockTheme.effects.glassEffects);
    expect(result.current.blur.standard).toBe('10px');
    expect(result.current.opacity.medium).toBe(0.2);
    expect(result.current.glow.strong).toBe('0 0 30px rgba(255, 255, 255, 0.2)');
  });
});

describe('useIsDarkMode', () => {
  test('returns isDarkMode value', () => {
    const lightWrapper = createWrapper('light', 'default', false);
    const { result: lightResult } = renderHook(() => useIsDarkMode(), { wrapper: lightWrapper });
    expect(lightResult.current).toBe(false);

    const darkWrapper = createWrapper('dark', 'default', true);
    const { result: darkResult } = renderHook(() => useIsDarkMode(), { wrapper: darkWrapper });
    expect(darkResult.current).toBe(true);
  });
});
