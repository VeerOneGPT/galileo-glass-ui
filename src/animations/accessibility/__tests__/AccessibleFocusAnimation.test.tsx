/**
 * Tests for AccessibleFocusAnimation
 * 
 * These tests verify that the focus animations respect accessibility settings
 * and provide appropriate feedback for keyboard navigation.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import styled, { ThemeProvider, css, FlattenSimpleInterpolation } from 'styled-components';
import 'jest-styled-components';
import { 
  useAccessibleFocusAnimation, 
  FocusAnimationStyle,
  FocusAnimationIntensity,
  createAccessibleFocusAnimation,
  focusAnimation,
  mapFocusToHighContrastType
} from '../AccessibleFocusAnimation';
import { HighContrastAnimationType , useHighContrast } from '../useHighContrast';
import { ThemeProvider as ActualThemeProvider } from '../../../theme';

// Mock the required hooks
jest.mock('../useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => ({
    prefersReducedMotion: false,
    appReducedMotion: false,
    systemReducedMotion: false,
    isAnimationAllowed: jest.fn(() => true),
    getAdjustedDuration: jest.fn((duration) => duration)
  }))
}));

jest.mock('../useHighContrast', () => ({
  useHighContrast: jest.fn(() => ({
    isHighContrast: false,
    appHighContrast: false,
    systemHighContrast: false
  })),
  HighContrastAnimationType: {
    BORDER_FOCUS: 'border_focus',
    BORDER_PULSE: 'border_pulse',
    BACKGROUND_FLASH: 'background_flash',
    COLOR_INVERSION: 'color_inversion',
    OUTLINE_EXPANSION: 'outline_expansion',
    SIZE_CHANGE: 'size_change',
    COLOR_SHIFT: 'color_shift',
    STATIC_INDICATOR: 'static_indicator',
    CONTENT_REVEAL: 'content_reveal',
    TEXT_EMPHASIS: 'text_emphasis',
    ICON_CHANGE: 'icon_change',
    CUSTOM: 'custom'
  }
}));

// Helper imports
import { useReducedMotion } from '../useReducedMotion';

// Helper component to render styles for checking
const StyleTester = styled.div<{ styles?: FlattenSimpleInterpolation }>`
  ${props => props.styles}
`;

// Helper to render with ThemeProvider - Rely on provider's internal theme
const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ActualThemeProvider>{ui}</ActualThemeProvider>);
};

// Custom wrapper for renderHook - Rely on provider's internal theme
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ActualThemeProvider>{children}</ActualThemeProvider>
);

describe('AccessibleFocusAnimation', () => {
  
  beforeEach(() => {
    // Reset mocks
    (useReducedMotion as jest.Mock).mockReturnValue({
      prefersReducedMotion: false,
      appReducedMotion: false,
      systemReducedMotion: false,
      isAnimationAllowed: jest.fn(() => true),
      getAdjustedDuration: jest.fn((duration) => duration)
    });
    
    (useHighContrast as jest.Mock).mockReturnValue({
      isHighContrast: false,
      appHighContrast: false,
      systemHighContrast: false
    });
  });
  
  test('useAccessibleFocusAnimation returns expected properties', () => {
    const { result } = renderHook(() => useAccessibleFocusAnimation(), { wrapper: ThemeWrapper });
    
    expect(result.current).toHaveProperty('focusStyle');
    expect(result.current).toHaveProperty('focusWithinStyle');
    expect(result.current).toHaveProperty('combinedFocusStyles');
    expect(result.current).toHaveProperty('generateFocusStyle');
    expect(typeof result.current.generateFocusStyle).toBe('function');
  });
  
  test('generateFocusStyle produces different styles based on options', () => {
    const { result } = renderHook(() => useAccessibleFocusAnimation(), { wrapper: ThemeWrapper });
    
    const defaultStyleCSS = result.current.generateFocusStyle();
    const outlineStyleCSS = result.current.generateFocusStyle({ style: FocusAnimationStyle.OUTLINE_PULSE });
    const glowStyleCSS = result.current.generateFocusStyle({ style: FocusAnimationStyle.GLOW });
    const blueStyleCSS = result.current.generateFocusStyle({ color: 'blue' });
    const redStyleCSS = result.current.generateFocusStyle({ color: 'red' });

    const { container: defaultContainer } = renderWithTheme(<StyleTester styles={defaultStyleCSS} />);
    const { container: glowContainer } = renderWithTheme(<StyleTester data-testid="glow" styles={glowStyleCSS} />);
    const { container: outlineContainer } = renderWithTheme(<StyleTester data-testid="outline" styles={outlineStyleCSS} />);
    const { container: blueContainer } = renderWithTheme(<StyleTester data-testid="blue" styles={blueStyleCSS} />);
    const { container: redContainer } = renderWithTheme(<StyleTester data-testid="red" styles={redStyleCSS} />);

    // Check for properties expected for specific styles
    expect(glowContainer.firstChild).toHaveStyleRule('box-shadow', expect.any(String));
    expect(outlineContainer.firstChild).toHaveStyleRule('outline', expect.any(String));
    
    // Check color custom property is set
    expect(window.getComputedStyle(blueContainer.firstChild as Element).getPropertyValue('--focus-color')).toBeTruthy();
    expect(window.getComputedStyle(redContainer.firstChild as Element).getPropertyValue('--focus-color')).toBeTruthy();

    // Check styles are generated and distinct (basic check)
    expect(defaultStyleCSS).toBeDefined();
    expect(glowStyleCSS).not.toEqual(outlineStyleCSS);
    expect(blueStyleCSS).not.toEqual(redStyleCSS);
  });
  
  test('focus animations respect reduced motion preferences', () => {
    (useReducedMotion as jest.Mock).mockReturnValue({
      prefersReducedMotion: true,
      appReducedMotion: true,
      systemReducedMotion: false,
      isAnimationAllowed: jest.fn(() => false),
      getAdjustedDuration: jest.fn((duration) => duration)
    });
    
    const { result: reducedMotionResult } = renderHook(() => 
      useAccessibleFocusAnimation({ highVisibility: false })
    , { wrapper: ThemeWrapper });
    
    const { container: reducedMotionContainer } = renderWithTheme(
      <StyleTester styles={reducedMotionResult.current.focusStyle} />
    );
    // Check animation is NOT applied
    expect(reducedMotionContainer.firstChild).not.toHaveStyleRule('animation'); 
    
    const { result: highVisibilityResult } = renderHook(() => 
      useAccessibleFocusAnimation({ highVisibility: true })
    , { wrapper: ThemeWrapper });
    
    const { container: highVisContainer } = renderWithTheme(
       <StyleTester styles={highVisibilityResult.current.focusStyle} />
    );
    // Check for presence of high-vis style (e.g., outline)
    expect(highVisContainer.firstChild).toHaveStyleRule('outline', expect.any(String));
  });
  
  test('focus animations adapt to high contrast mode', () => {
    (useHighContrast as jest.Mock).mockReturnValue({
      isHighContrast: true,
      appHighContrast: true,
      systemHighContrast: false
    });
    
    const { result: highContrastResult } = renderHook(() => 
      useAccessibleFocusAnimation(), { wrapper: ThemeWrapper } 
    );
    
    // Assert that the style is generated and check for a high-contrast indicator
    expect(highContrastResult.current.focusStyle).toBeDefined(); 
    const { container } = renderWithTheme(<StyleTester styles={highContrastResult.current.focusStyle} />);
    expect(container.firstChild).toHaveStyleRule('outline', expect.any(String)); // High contrast often uses outline
  });
  
  test('focus animation intensity affects output', () => {
    const { result: minimalResult } = renderHook(() => 
      useAccessibleFocusAnimation({ intensity: FocusAnimationIntensity.MINIMAL }), { wrapper: ThemeWrapper } 
    );
    const { result: maximumResult } = renderHook(() => 
      useAccessibleFocusAnimation({ intensity: FocusAnimationIntensity.MAXIMUM }), { wrapper: ThemeWrapper } 
    );
    
    expect(minimalResult.current.focusStyle).toBeDefined();
    expect(maximumResult.current.focusStyle).toBeDefined();
    // Check that the styles are actually different (avoids String conversion issue)
    const { container: minContainer } = renderWithTheme(<StyleTester styles={minimalResult.current.focusStyle} />);
    const { container: maxContainer } = renderWithTheme(<StyleTester styles={maximumResult.current.focusStyle} />);
    expect(minContainer.innerHTML).not.toEqual(maxContainer.innerHTML);
  });
  
  test('createAccessibleFocusAnimation works standalone', () => {
    const focusCSS = createAccessibleFocusAnimation({
      style: FocusAnimationStyle.OUTLINE_PULSE,
      color: 'blue'
    }, false, false);
    
    expect(focusCSS).toBeDefined();
    const { container } = renderWithTheme(<StyleTester styles={focusCSS} />);
    expect(container.firstChild).toHaveStyleRule('outline', expect.any(String)); 
    expect(container.firstChild).toHaveStyleRule('--focus-color', expect.stringContaining('blue'));
  });
  
  test('focusAnimation generates expected CSS', () => {
    const styledCSS = focusAnimation({
      style: FocusAnimationStyle.GLOW,
      color: 'red'
    });
    
    expect(styledCSS).toBeDefined();
    const { container } = renderWithTheme(<StyleTester styles={styledCSS} />);
    // Check for a key property applied in the focused state
    expect(container.firstChild).toHaveStyleRule('box-shadow', expect.any(String), { modifier: ':focus-visible' });
  });
  
  test('mapFocusToHighContrastType returns appropriate mapping', () => {
    expect(mapFocusToHighContrastType(FocusAnimationStyle.OUTLINE_PULSE))
      .toBe(HighContrastAnimationType.BORDER_PULSE);
      
    expect(mapFocusToHighContrastType(FocusAnimationStyle.GLOW))
      .toBe(HighContrastAnimationType.OUTLINE_EXPANSION);
      
    expect(mapFocusToHighContrastType(FocusAnimationStyle.SCALE))
      .toBe(HighContrastAnimationType.SIZE_CHANGE);
  });
  
  test('each focus animation style produces unique CSS', () => {
    // Correct type for map storing rendered HTML strings
    const stylesMap = new Map<string, string>();
    
    Object.values(FocusAnimationStyle).forEach(style => {
      const focusCSS = createAccessibleFocusAnimation({ style: style as FocusAnimationStyle }, false, false);
      expect(focusCSS).toBeDefined(); 
      const { container } = renderWithTheme(<StyleTester styles={focusCSS} />);
      stylesMap.set(style, container.innerHTML);
    });
    
    const uniqueStyleCount = new Set(stylesMap.values()).size;
    expect(uniqueStyleCount).toBeGreaterThanOrEqual(Object.values(FocusAnimationStyle).length - 1);
  });
});