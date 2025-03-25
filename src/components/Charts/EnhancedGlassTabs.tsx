/**
 * EnhancedGlassTabs Component
 * 
 * High-contrast, accessibility-focused tab component for chart navigation
 * with glass morphism styling.
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/effects/glowEffects';
import { interactiveGlass } from '../../core/mixins/interactions/interactiveGlass';
import { createThemeContext } from '../../core/themeUtils';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cssWithKebabProps } from '../../core/cssUtils';
import { useMagneticButton } from '../../animations/hooks';

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

/**
 * StyledTabsContainer component
 */
const StyledTabsContainer = styled.div<{
  variant: 'default' | 'elevated' | 'outlined' | 'text';
  highContrast: boolean;
  theme: any;
}>`
  display: flex;
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: 8px;
  
  ${props => props.variant !== 'text' && glassSurface({
    elevation: props.variant === 'elevated' ? 2 : 1,
    blurStrength: props.highContrast ? 'minimal' : 'light',
    borderOpacity: props.variant === 'outlined' ? 'medium' : 'subtle',
    themeContext: createThemeContext(props.theme)
  })}
  
  ${props => props.variant === 'text' && `
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
    flex: ${props => props.fullWidth ? 1 : 'none'};
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
    dark: { light: '#1F2937', dark: '#111827' }
  };
  
  const selectedColor = baseColors[color || 'primary'][isDarkMode ? 'dark' : 'light'];
  
  return {
    activeColor: selectedColor,
    activeBg: isDarkMode 
      ? `${selectedColor}22`
      : `${selectedColor}11`,
    activeText: highContrast
      ? isDarkMode ? '#FFFFFF' : '#000000'
      : selectedColor,
    inactiveText: isDarkMode
      ? highContrast ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)'
      : highContrast ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
    hoverBg: isDarkMode
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)',
    disabledText: isDarkMode
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(0, 0, 0, 0.3)'
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
      case 'left': return 'flex-start';
      case 'right': return 'flex-end';
      default: return 'center';
    }
  }};
  gap: 8px;
  white-space: nowrap;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 16px';
      case 'large': return '16px 24px';
      default: return '12px 20px';
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '14px';
      case 'large': return '16px';
      default: return '15px';
    }
  }};
  font-weight: ${props => props.active ? 600 : 500};
  outline: none;
  background: transparent;
  transition: background-color 0.2s ease, color 0.2s ease;
  
  ${props => {
    const colors = getTabColors(props.color, props.theme.isDarkMode, props.highContrast);
    
    return cssWithKebabProps`
      color: ${props.disabled 
        ? colors.disabledText 
        : props.active 
          ? colors.activeText 
          : colors.inactiveText};
      
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
  
  ${props => !props.disabled && !props.active && interactiveGlass({
    hoverEffect: 'subtle',
    themeContext: createThemeContext(props.theme)
  })}
  
  ${props => props.active && props.variant !== 'text' && glassGlow({
    intensity: 'subtle',
    color: props.color || 'primary',
    themeContext: createThemeContext(props.theme)
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
  
  ${props => props.animation === 'slide' && `
    transition: left 0.3s ease, width 0.3s ease;
    left: ${props.left}px;
    width: ${props.width}px;
  `}
  
  ${props => props.animation === 'fade' && `
    transition: opacity 0.2s ease;
    left: ${props.left}px;
    width: ${props.width}px;
    opacity: 1;
  `}
  
  ${props => props.animation === 'none' && `
    left: ${props.left}px;
    width: ${props.width}px;
  `}
  
  ${props => glassGlow({
    intensity: 'subtle',
    color: props.color || 'primary',
    themeContext: createThemeContext(props.theme)
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

/**
 * EnhancedGlassTabs Component
 */
export const EnhancedGlassTabs: React.FC<EnhancedGlassTabsProps> = ({
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
  style
}) => {
  // State for currently active tab
  const [currentTab, setCurrentTab] = useState(activeTab || defaultTab || (tabs.length > 0 ? tabs[0].id : ''));
  
  // Refs for tab elements
  const [tabRefs, setTabRefs] = useState<Record<string, HTMLButtonElement | null>>({});
  
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
    bottom: 0
  });
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Update active tab when controlled prop changes
  useEffect(() => {
    if (activeTab !== undefined && activeTab !== currentTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);
  
  // Update indicator position when active tab changes
  useEffect(() => {
    const activeTabElement = tabRefs[currentTab];
    if (activeTabElement) {
      const { left, width } = activeTabElement.getBoundingClientRect();
      const containerLeft = activeTabElement.parentElement?.getBoundingClientRect().left || 0;
      
      setIndicatorStyle({
        left: left - containerLeft,
        width,
        height: size === 'small' ? 2 : size === 'large' ? 4 : 3,
        bottom: 0
      });
    }
  }, [currentTab, tabRefs, size]);
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (currentTab !== tabId) {
      setCurrentTab(tabId);
      if (onChange) {
        onChange(tabId);
      }
    }
  };
  
  // Set ref for a tab
  const setTabRef = (tabId: string, ref: HTMLButtonElement | null) => {
    setTabRefs(prev => ({
      ...prev,
      [tabId]: ref
    }));
  };
  
  return (
    <StyledTabsContainer
      variant={variant}
      highContrast={highContrast}
      className={className}
      style={style}
      theme={{}}
    >
      <StyledTabsList fullWidth={fullWidth}>
        {tabs.map(tab => {
          // Use magnetic button effect if enabled
          const magneticProps = physicsEnabled && !prefersReducedMotion
            ? useMagneticButton({
                strength: 0.3,
                maxDisplacement: 5,
                springBack: true,
                tiltEffect: false
              })
            : null;
            
          return (
            <StyledTab
              key={tab.id}
              ref={ref => setTabRef(tab.id, ref)}
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
              {...(magneticProps ? {
                ref: magneticProps.ref,
                ...magneticProps.eventHandlers
              } : {})}
              theme={{}}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <StyledBadge color={color} theme={{}}>
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
          theme={{}}
        />
      )}
    </StyledTabsContainer>
  );
};

export default EnhancedGlassTabs;