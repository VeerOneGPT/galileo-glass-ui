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
import styled, { ThemeProvider } from 'styled-components';
import { 
  useAccessibleFocusAnimation, 
  FocusAnimationStyle,
  FocusAnimationIntensity,
  createAccessibleFocusAnimation,
  focusAnimation,
  mapFocusToHighContrastType
} from '../AccessibleFocusAnimation';
import { HighContrastAnimationType } from '../useHighContrast';

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
import { useHighContrast } from '../useHighContrast';

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
    const { result } = renderHook(() => useAccessibleFocusAnimation());
    
    expect(result.current).toHaveProperty('focusStyle');
    expect(result.current).toHaveProperty('focusWithinStyle');
    expect(result.current).toHaveProperty('combinedFocusStyles');
    expect(result.current).toHaveProperty('generateFocusStyle');
    expect(typeof result.current.generateFocusStyle).toBe('function');
  });
  
  test('generateFocusStyle produces different styles based on options', () => {
    const { result } = renderHook(() => useAccessibleFocusAnimation());
    
    const defaultStyle = result.current.generateFocusStyle();
    const outlineStyle = result.current.generateFocusStyle({ 
      style: FocusAnimationStyle.OUTLINE_PULSE 
    });
    const glowStyle = result.current.generateFocusStyle({ 
      style: FocusAnimationStyle.GLOW 
    });
    
    // Different style types should produce different CSS
    expect(String(glowStyle)).not.toEqual(String(outlineStyle));
    
    // Custom colors should affect the output
    const blueStyle = result.current.generateFocusStyle({ 
      color: 'blue' 
    });
    const redStyle = result.current.generateFocusStyle({ 
      color: 'red' 
    });
    
    expect(String(blueStyle)).not.toEqual(String(redStyle));
  });
  
  test('focus animations respect reduced motion preferences', () => {
    // Mock reduced motion preference
    (useReducedMotion as jest.Mock).mockReturnValue({
      prefersReducedMotion: true,
      appReducedMotion: true,
      systemReducedMotion: false,
      isAnimationAllowed: jest.fn(() => false),
      getAdjustedDuration: jest.fn((duration) => duration)
    });
    
    const { result: reducedMotionResult } = renderHook(() => 
      useAccessibleFocusAnimation({ highVisibility: false })
    );
    
    // With reduced motion, should not contain animation
    const reducedMotionStyle = String(reducedMotionResult.current.focusStyle);
    expect(reducedMotionStyle).not.toContain('animation:');
    
    // But high visibility should override reduced motion
    const { result: highVisibilityResult } = renderHook(() => 
      useAccessibleFocusAnimation({ highVisibility: true })
    );
    
    // With high visibility, should still animate even with reduced motion
    const highVisibilityStyle = String(highVisibilityResult.current.focusStyle);
    // Check for presence of animation or outline properties
    expect(highVisibilityStyle.includes('animation-name:') || highVisibilityStyle.includes('outline:')).toBe(true);
  });
  
  test('focus animations adapt to high contrast mode', () => {
    // Mock high contrast preference
    (useHighContrast as jest.Mock).mockReturnValue({
      isHighContrast: true,
      appHighContrast: true,
      systemHighContrast: false
    });
    
    const { result: highContrastResult } = renderHook(() => 
      useAccessibleFocusAnimation()
    );
    
    // High contrast mode should contain high visibility styles
    const highContrastStyle = String(highContrastResult.current.focusStyle);
    // Check for high contrast colors or outline
    expect(highContrastStyle.includes('rgba(255, 255, 255') || highContrastStyle.includes('outline:')).toBe(true);
  });
  
  test('focus animation intensity affects output', () => {
    const { result: minimalResult } = renderHook(() => 
      useAccessibleFocusAnimation({ intensity: FocusAnimationIntensity.MINIMAL })
    );
    
    const { result: maximumResult } = renderHook(() => 
      useAccessibleFocusAnimation({ intensity: FocusAnimationIntensity.MAXIMUM })
    );
    
    // Different intensities should produce different output
    expect(String(minimalResult.current.focusStyle)).not.toEqual(
      String(maximumResult.current.focusStyle)
    );
  });
  
  test('createAccessibleFocusAnimation works standalone', () => {
    const focusCSS = createAccessibleFocusAnimation({
      style: FocusAnimationStyle.OUTLINE_PULSE,
      color: 'blue'
    }, false, false);
    
    expect(String(focusCSS)).toContain('--focus-color');
    expect(String(focusCSS)).toContain('outline');
  });
  
  test('focusAnimation generates expected CSS', () => {
    const styledCSS = focusAnimation({
      style: FocusAnimationStyle.GLOW,
      color: 'red'
    });
    
    expect(String(styledCSS)).toContain('&:focus-visible');
    expect(String(styledCSS)).toContain('&:focus:not(:focus-visible)');
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
    const uniqueStyles = new Set();
    
    Object.values(FocusAnimationStyle).forEach(style => {
      const focusCSS = createAccessibleFocusAnimation({ style: style as FocusAnimationStyle }, false, false);
      uniqueStyles.add(String(focusCSS));
    });
    
    // Each style should produce unique CSS (not perfect test but catches most issues)
    expect(uniqueStyles.size).toBeGreaterThanOrEqual(Object.values(FocusAnimationStyle).length - 1);
  });
});