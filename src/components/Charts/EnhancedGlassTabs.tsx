/**
 * EnhancedGlassTabs Component
 *
 * High-contrast, accessibility-focused tab component for chart navigation
 * with glass morphism styling.
 */
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { asCoreThemeContext } from '../../utils/themeHelpers';
import { useTheme } from '../../theme';

import { useMagneticButton } from '../../animations/hooks';
import { cssWithKebabProps } from '../../core/cssUtils';
import { glassSurface } from '../../core/mixins/glassSurface';
import { 
  glassGlow, 
  GlowEffectProps 
} from '../../core/mixins/glowEffects';
import { interactiveGlass } from '../../core/mixins/interactions/interactiveGlass';
import { createThemeContext } from '../../core/themeUtils';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * TabItem interface
 */
export interface TabItem {
  /**
   * Unique ID for the tab
   */
  id: string;

  /**
   * Display label for the tab
   */
  label: string;

  /**
   * Optional badge count to display
   */
  badgeCount?: number;

  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;

  /**
   * Optional icon component
   */
  icon?: React.ReactNode;
}

/**
 * EnhancedGlassTabs props interface
 */
export interface EnhancedGlassTabsProps {
  /**
   * Array of tab items
   */
  tabs: TabItem[];

  /**
   * Currently active tab ID
   */
  activeTab?: string;

  /**
   * Callback when tab changes
   */
  onChange?: (tabId: string) => void;

  /**
   * Visual variant of the tabs
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'text';

  /**
   * Size of the tabs
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Color scheme for the tabs
   */
  color?: 'primary' | 'secondary' | 'accent' | 'light' | 'dark';

  /**
   * Whether to use high contrast mode
   */
  highContrast?: boolean;

  /**
   * Animation behavior of the indicator
   */
  indicatorAnimation?: 'slide' | 'fade' | 'none';

  /**
   * Whether to stretch tabs to fill width
   */
  fullWidth?: boolean;

  /**
   * Default tab to select if none provided
   */
  defaultTab?: string;

  /**
   * Whether to apply physics motion effects
   */
  physicsEnabled?: boolean;

  /**
   * Whether to show the active indicator
   */
  showIndicator?: boolean;

  /**
   * Text alignment within tabs
   */
  textAlign?: 'center' | 'left' | 'right';

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: React.CSSProperties;
}

// Ref interface
export interface EnhancedGlassTabsRef {
  /** Gets the main tabs container DOM element */
  getContainerElement: () => HTMLDivElement | null;
  /** Programmatically sets the active tab */
  setActiveTab: (tabId: string) => void;
  /** Gets the ID of the currently active tab */
  getActiveTab: () => string;
  /** Get the DOM element for a specific tab button */
  getTabElement: (tabId: string) => HTMLButtonElement | null;
}

/**
 * StyledTabsContainer component
 */
const StyledTabsContainer = styled.div<{
  variant: 'default' | 'elevated' | 'outlined' | 'text';
  color: EnhancedGlassTabsProps['color'];
  size: EnhancedGlassTabsProps['size'];
  highContrast: boolean;
  theme: any;
}>`
  display: flex;
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: 8px;

  ${props =>
    props.variant !== 'text' &&
    glassSurface({
      elevation: props.variant === 'elevated' ? 2 : 1,
      blurStrength: props.highContrast ? 'minimal' : 'light',
      borderOpacity: props.variant === 'outlined' ? 'medium' : 'subtle',
      themeContext: asCoreThemeContext(createThemeContext(props.theme)),
    })}

  ${props =>
    props.variant === 'text' &&
    `
    background: transparent;
  `}
`;

/**
 * StyledTabsList component
 */
const StyledTabsList = styled.div<{
  fullWidth: boolean;
}>`
  display: flex;
  width: 100%;
  position: relative;

  & > * {
    flex: ${props => (props.fullWidth ? 1 : 'none')};
  }
`;

/**
 * Get colors for the tabs
 */
const getTabColors = (
  color: EnhancedGlassTabsProps['color'],
  isDarkMode: boolean,
  highContrast: boolean
) => {
  const baseColors = {
    primary: { light: '#4B66EA', dark: '#6366F1' },
    secondary: { light: '#8B5CF6', dark: '#A855F7' },
    accent: { light: '#EC4899', dark: '#F472B6' },
    light: { light: '#F9FAFB', dark: '#F3F4F6' },
    dark: { light: '#1F2937', dark: '#111827' },
  };

  const selectedColor = baseColors[color || 'primary'][isDarkMode ? 'dark' : 'light'];

  return {
    activeColor: selectedColor,
    activeBg: isDarkMode ? `${selectedColor}22` : `${selectedColor}11`,
    activeText: highContrast ? (isDarkMode ? '#FFFFFF' : '#000000') : selectedColor,
    inactiveText: isDarkMode
      ? highContrast
        ? 'rgba(255, 255, 255, 0.8)'
        : 'rgba(255, 255, 255, 0.6)'
      : highContrast
      ? 'rgba(0, 0, 0, 0.8)'
      : 'rgba(0, 0, 0, 0.6)',
    hoverBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    disabledText: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
  };
};

/**
 * StyledTab component
 */
const StyledTab = styled.button<{
  active: boolean;
  disabled: boolean;
  color: EnhancedGlassTabsProps['color'];
  variant: EnhancedGlassTabsProps['variant'];
  size: EnhancedGlassTabsProps['size'];
  highContrast: boolean;
  textAlign: 'center' | 'left' | 'right';
  theme: any;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: ${props => {
    switch (props.textAlign) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      default:
        return 'center';
    }
  }};
  gap: 8px;
  white-space: nowrap;
  border: none;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return '8px 16px';
      case 'large':
        return '16px 24px';
      default:
        return '12px 20px';
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return '14px';
      case 'large':
        return '16px';
      default:
        return '15px';
    }
  }};
  font-weight: ${props => (props.active ? 600 : 500)};
  outline: none;
  background: transparent;
  transition: background-color 0.2s ease, color 0.2s ease;

  ${props => {
    const colors = getTabColors(props.color, props.theme.isDarkMode, props.highContrast);

    return cssWithKebabProps`
      color: ${
        props.disabled
          ? colors.disabledText
          : props.active
          ? colors.activeText
          : colors.inactiveText
      };
      
      backgroundColor: ${props.active ? colors.activeBg : 'transparent'};
      
      &:hover:not(:disabled) {
        backgroundColor: ${!props.active ? colors.hoverBg : colors.activeBg};
        color: ${colors.activeText};
      }
      
      &:focus-visible {
        boxShadow: 0 0 0 2px ${colors.activeColor}40;
      }
    `;
  }}

  ${props =>
    !props.disabled &&
    !props.active &&
    interactiveGlass({
      hoverEffect: 'brighten',
      themeContext: asCoreThemeContext(createThemeContext(props.theme)),
    })}
  
  ${props =>
    props.active &&
    props.variant !== 'text' &&
    glassGlow({
      glowIntensity: 'subtle',
      glowColor: props.color || 'primary',
      themeContext: asCoreThemeContext(createThemeContext(props.theme)),
    })}
`;

/**
 * StyledTabIndicator component
 */
const StyledTabIndicator = styled.div<{
  left: number;
  width: number;
  height: number;
  bottom: number;
  color: EnhancedGlassTabsProps['color'];
  animation: 'slide' | 'fade' | 'none';
  highContrast: boolean;
  theme: any;
}>`
  position: absolute;
  bottom: ${props => props.bottom}px;
  height: ${props => props.height}px;
  background-color: ${props => {
    const colors = getTabColors(props.color, props.theme.isDarkMode, props.highContrast);
    return colors.activeColor;
  }};
  border-radius: ${props => props.height / 2}px;

  ${props =>
    props.animation === 'slide' &&
    `
    transition: left 0.3s ease, width 0.3s ease;
    left: ${props.left}px;
    width: ${props.width}px;
  `}

  ${props =>
    props.animation === 'fade' &&
    `
    transition: opacity 0.2s ease;
    left: ${props.left}px;
    width: ${props.width}px;
    opacity: 1;
  `}
  
  ${props =>
    props.animation === 'none' &&
    `
    left: ${props.left}px;
    width: ${props.width}px;
  `}
  
  ${props =>
    glassGlow({
      intensity: 'subtle',
      color: props.color || 'primary',
      themeContext: asCoreThemeContext(createThemeContext(props.theme)),
    })}
`;

/**
 * StyledBadge component
 */
const StyledBadge = styled.span<{
  color: EnhancedGlassTabsProps['color'];
  theme: any;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  background-color: ${props => {
    const colors = getTabColors(props.color, props.theme.isDarkMode, true);
    return colors.activeColor;
  }};
  color: white;
`;

// Add this helper function to ensure we have a properly typed theme
const ensureValidTheme = (themeInput: any): DefaultTheme => {
  // If the theme is already a valid DefaultTheme, return it
  if (
    themeInput && 
    typeof themeInput === 'object' && 
    'isDarkMode' in themeInput && 
    'colorMode' in themeInput && 
    'themeVariant' in themeInput && 
    'colors' in themeInput && 
    'zIndex' in themeInput
  ) {
    return themeInput as DefaultTheme;
  }
  
  // Otherwise, create a new theme object
  return {
    isDarkMode: false,
    colorMode: 'light',
    themeVariant: 'nebula',
    colors: {
      nebula: {
        accentPrimary: '#6366F1',
        accentSecondary: '#8B5CF6',
        accentTertiary: '#EC4899',
        stateCritical: '#EF4444',
        stateOptimal: '#10B981',
        stateAttention: '#F59E0B',
        stateInformational: '#3B82F6',
        neutralBackground: '#F9FAFB',
        neutralForeground: '#1F2937',
        neutralBorder: '#E5E7EB',
        neutralSurface: '#FFFFFF'
      },
      glass: {
        light: {
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          highlight: 'rgba(255, 255, 255, 0.3)',
          shadow: 'rgba(0, 0, 0, 0.1)',
          glow: 'rgba(255, 255, 255, 0.2)'
        },
        dark: {
          background: 'rgba(0, 0, 0, 0.2)',
          border: 'rgba(255, 255, 255, 0.1)',
          highlight: 'rgba(255, 255, 255, 0.1)',
          shadow: 'rgba(0, 0, 0, 0.3)',
          glow: 'rgba(255, 255, 255, 0.1)'
        },
        tints: {
          primary: 'rgba(99, 102, 241, 0.1)',
          secondary: 'rgba(139, 92, 246, 0.1)'
        }
      }
    },
    zIndex: {
      hide: -1,
      auto: 'auto',
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      skipLink: 1600,
      toast: 1700,
      tooltip: 1800,
      glacial: 9999
    }
  };
};

/**
 * EnhancedGlassTabs Component
 */
export const EnhancedGlassTabs = forwardRef<EnhancedGlassTabsRef, EnhancedGlassTabsProps>(({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'medium',
  color = 'primary',
  highContrast = false,
  indicatorAnimation = 'slide',
  fullWidth = false,
  defaultTab,
  physicsEnabled = true,
  showIndicator = true,
  textAlign = 'center',
  className,
  style,
}, ref) => {
  // Get theme from context and ensure it's valid
  const providedTheme = useTheme();
  const theme = ensureValidTheme(providedTheme);
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Refs for tab elements
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  // Ref for the container element
  const containerRef = useRef<HTMLDivElement>(null);

  // State for currently active tab
  const [currentTab, setCurrentTab] = useState(
    activeTab || defaultTab || (tabs.length > 0 ? tabs[0].id : '')
  );

  // State for indicator position
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    height: number;
    bottom: number;
  }>({
    left: 0,
    width: 0,
    height: 2,
    bottom: 0,
  });

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (currentTab !== tabId) {
      setCurrentTab(tabId);
      if (onChange) {
        onChange(tabId);
      }
    }
  };

  // --- Imperative Handle (Moved After Handlers) ---
  useImperativeHandle(ref, () => ({
    getContainerElement: () => containerRef.current,
    setActiveTab: (tabId) => {
      if (tabs.some(tab => tab.id === tabId)) {
        handleTabChange(tabId);
      }
    },
    getActiveTab: () => currentTab,
    getTabElement: (tabId) => tabRefs.current[tabId] || null,
  }), [
    containerRef, 
    currentTab, 
    tabs, 
    handleTabChange, // Dependency
    tabRefs // Dependency
  ]);

  // Update active tab when controlled prop changes
  useEffect(() => {
    if (activeTab !== undefined && activeTab !== currentTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  // Update indicator position when active tab changes
  useEffect(() => {
    // Function to update the indicator position based on current tab
    const updateIndicatorPosition = () => {
      const activeTabElement = tabRefs.current[currentTab];
      if (activeTabElement && containerRef.current) {
        const { left, width } = activeTabElement.getBoundingClientRect();
        const containerLeft = containerRef.current.getBoundingClientRect().left || 0;
        const relativeLeft = left - containerLeft;

        const finalHeight = size === 'small' ? 2 : size === 'large' ? 4 : 3;
        const finalBottom = 0;

        setIndicatorStyle({
          left: relativeLeft,
          width,
          height: finalHeight,
          bottom: finalBottom,
        });
      }
    };

    // Run once immediately
    updateIndicatorPosition();

    // Set up resize observer to update indicator on tab resize
    const resizeObserver = new ResizeObserver(() => {
      updateIndicatorPosition();
    });

    // Observe the container and current tab element
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    const activeTabElement = tabRefs.current[currentTab];
    if (activeTabElement) {
      resizeObserver.observe(activeTabElement);
    }

    // Add window resize listener
    window.addEventListener('resize', updateIndicatorPosition);

    // Clean up
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateIndicatorPosition);
    };
  }, [currentTab, size]); // Only re-run when tab or size changes

  return (
    <StyledTabsContainer
      ref={containerRef}
      variant={variant}
      color={color}
      size={size}
      highContrast={highContrast}
      className={className}
      style={style}
      theme={theme}
    >
      <StyledTabsList fullWidth={fullWidth}>
        {tabs.map(tab => {
          // Use a stable function reference by wrapping in anonymous function
          return (
            <StyledTab
              key={tab.id}
              ref={(element) => {
                // Store the ref without triggering updates
                tabRefs.current[tab.id] = element;
              }}
              active={currentTab === tab.id}
              disabled={!!tab.disabled}
              color={color}
              variant={variant}
              size={size}
              highContrast={highContrast}
              textAlign={textAlign}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              aria-selected={currentTab === tab.id}
              role="tab"
              tabIndex={tab.disabled ? -1 : 0}
              theme={theme}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <StyledBadge color={color} theme={theme}>
                  {tab.badgeCount > 99 ? '99+' : tab.badgeCount}
                </StyledBadge>
              )}
            </StyledTab>
          );
        })}
      </StyledTabsList>

      {showIndicator && currentTab && (
        <StyledTabIndicator
          left={indicatorStyle.left}
          width={indicatorStyle.width}
          height={indicatorStyle.height}
          bottom={indicatorStyle.bottom}
          color={color}
          animation={prefersReducedMotion ? 'none' : indicatorAnimation}
          highContrast={highContrast}
          theme={theme}
        />
      )}
    </StyledTabsContainer>
  );
});

// Add displayName
EnhancedGlassTabs.displayName = 'EnhancedGlassTabs';

export default EnhancedGlassTabs;
