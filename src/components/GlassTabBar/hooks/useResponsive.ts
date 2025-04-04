/**
 * useResponsive Hook
 * 
 * Handles responsive configuration for tab bar based on screen size
 */
import { useState, useEffect, useCallback } from 'react';
import { ResponsiveTabConfig } from '../types';

interface UseResponsiveProps {
  responsiveOrientation?: {
    base: 'horizontal' | 'vertical';
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    belowBreakpoint: 'horizontal' | 'vertical';
  };
  orientation: 'horizontal' | 'vertical';
  responsiveConfig?: {
    base?: ResponsiveTabConfig;
    small?: ResponsiveTabConfig;
    medium?: ResponsiveTabConfig;
    large?: ResponsiveTabConfig;
  };
  showLabels: boolean;
  iconPosition: 'top' | 'left' | 'right';
  verticalDisplayMode: 'compact' | 'expanded' | 'icon-only';
  fullWidth: boolean;
  width?: string | number;
  height?: string | number;
}

interface ResponsiveResult {
  effectiveOrientation: 'horizontal' | 'vertical';
  screenSize: 'small' | 'medium' | 'large';
  effectiveShowLabels: boolean;
  effectiveIconPosition: 'top' | 'left' | 'right';
  effectiveVerticalDisplayMode: 'compact' | 'expanded' | 'icon-only';
  effectiveFullWidth: boolean;
  effectiveWidth?: string | number;
  effectiveHeight?: string | number;
  maxVisibleTabs?: number;
}

// Map from breakpoint names to actual pixel values
const breakpointMap = {
  xs: 480,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1600
};

export default function useResponsive({
  responsiveOrientation,
  orientation,
  responsiveConfig,
  showLabels,
  iconPosition,
  verticalDisplayMode,
  fullWidth,
  width,
  height
}: UseResponsiveProps): ResponsiveResult {
  const [actualOrientation, setActualOrientation] = useState(orientation);
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [effectiveShowLabels, setEffectiveShowLabels] = useState(showLabels);
  const [effectiveIconPosition, setEffectiveIconPosition] = useState(iconPosition);
  const [effectiveVerticalDisplayMode, setEffectiveVerticalDisplayMode] = useState(verticalDisplayMode);
  const [effectiveFullWidth, setEffectiveFullWidth] = useState(fullWidth);
  const [effectiveWidth, setEffectiveWidth] = useState(width);
  const [effectiveHeight, setEffectiveHeight] = useState(height);
  const [maxVisibleTabs, setMaxVisibleTabs] = useState<number | undefined>(undefined);
  
  const determineScreenSize = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      return 'small';
    } else if (width >= 768 && width < 1200) {
      return 'medium';
    } else {
      return 'large';
    }
  }, []);
  
  const updateResponsiveConfig = useCallback((size: 'small' | 'medium' | 'large') => {
    // Start with base config
    let newShowLabels = showLabels;
    let newIconPosition = iconPosition;
    let newVerticalDisplayMode = verticalDisplayMode;
    let newFullWidth = fullWidth;
    let newWidth = width;
    let newHeight = height;
    let newMaxVisibleTabs = undefined;
    
    // Apply base responsive config first
    if (responsiveConfig?.base) {
      if (responsiveConfig.base.showLabels !== undefined) newShowLabels = responsiveConfig.base.showLabels;
      if (responsiveConfig.base.iconPosition) newIconPosition = responsiveConfig.base.iconPosition;
      if (responsiveConfig.base.verticalDisplayMode) newVerticalDisplayMode = responsiveConfig.base.verticalDisplayMode;
      if (responsiveConfig.base.fullWidth !== undefined) newFullWidth = responsiveConfig.base.fullWidth;
      if (responsiveConfig.base.width !== undefined) newWidth = responsiveConfig.base.width;
      if (responsiveConfig.base.height !== undefined) newHeight = responsiveConfig.base.height;
      if (responsiveConfig.base.maxVisibleTabs !== undefined) newMaxVisibleTabs = responsiveConfig.base.maxVisibleTabs;
    }
    
    // Now apply size-specific overrides
    const sizeConfig = responsiveConfig?.[size];
    if (sizeConfig) {
      if (sizeConfig.showLabels !== undefined) newShowLabels = sizeConfig.showLabels;
      if (sizeConfig.iconPosition) newIconPosition = sizeConfig.iconPosition;
      if (sizeConfig.verticalDisplayMode) newVerticalDisplayMode = sizeConfig.verticalDisplayMode;
      if (sizeConfig.fullWidth !== undefined) newFullWidth = sizeConfig.fullWidth;
      if (sizeConfig.width !== undefined) newWidth = sizeConfig.width;
      if (sizeConfig.height !== undefined) newHeight = sizeConfig.height;
      if (sizeConfig.maxVisibleTabs !== undefined) newMaxVisibleTabs = sizeConfig.maxVisibleTabs;
    }
    
    // Apply special rules for small screens if no specific config
    if (size === 'small' && !sizeConfig) {
      // Default behavior for small screens without explicit config
      if (actualOrientation === 'horizontal') {
        // On horizontal orientation, we might want to automatically hide labels if there are icons
        // In a real implementation, we would check if tabs have icons here
        if (responsiveConfig?.base?.showLabels === undefined) {
          // Leave as is since we don't know if there are icons
          // newShowLabels = false;
        }
      } else {
        // On vertical orientation, we might want to switch to compact mode
        if (responsiveConfig?.base?.verticalDisplayMode === undefined) {
          newVerticalDisplayMode = 'compact';
        }
      }
    }
    
    // Update all the effective values
    setEffectiveShowLabels(newShowLabels);
    setEffectiveIconPosition(newIconPosition);
    setEffectiveVerticalDisplayMode(newVerticalDisplayMode);
    setEffectiveFullWidth(newFullWidth);
    setEffectiveWidth(newWidth);
    setEffectiveHeight(newHeight);
    setMaxVisibleTabs(newMaxVisibleTabs);
  }, [
    actualOrientation,
    fullWidth,
    height,
    iconPosition,
    responsiveConfig,
    showLabels,
    verticalDisplayMode,
    width
  ]);
  
  // Handle responsive orientation changes
  useEffect(() => {
    if (!responsiveOrientation) {
      setActualOrientation(orientation);
      return;
    }
    
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const breakpointWidth = breakpointMap[responsiveOrientation.breakpoint];
      
      if (windowWidth < breakpointWidth) {
        setActualOrientation(responsiveOrientation.belowBreakpoint);
      } else {
        setActualOrientation(responsiveOrientation.base);
      }
    };
    
    // Initial check
    handleResize();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [orientation, responsiveOrientation]);
  
  // Handle screen size detection and responsive config
  useEffect(() => {
    const handleResize = () => {
      const newSize = determineScreenSize();
      if (newSize !== screenSize) {
        setScreenSize(newSize);
        updateResponsiveConfig(newSize);
      }
    };
    
    // Initial setup
    const initialSize = determineScreenSize();
    setScreenSize(initialSize);
    updateResponsiveConfig(initialSize);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [determineScreenSize, screenSize, updateResponsiveConfig]);
  
  return {
    effectiveOrientation: actualOrientation,
    screenSize,
    effectiveShowLabels,
    effectiveIconPosition,
    effectiveVerticalDisplayMode,
    effectiveFullWidth,
    effectiveWidth,
    effectiveHeight,
    maxVisibleTabs
  };
}