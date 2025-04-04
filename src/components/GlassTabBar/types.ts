/**
 * GlassTabBar Types
 */
import React from 'react';

/**
 * Badge animation styles
 */
export type BadgeAnimationType = 'pulse' | 'bounce' | 'shake' | 'fade' | 'count' | 'glow' | 'none';

/**
 * Badge animation options
 */
export interface BadgeAnimationOptions {
  /** Animation type to use */
  type: BadgeAnimationType;
  /** Whether the animation should loop continuously */
  loop?: boolean;
  /** Custom animation duration in ms */
  duration?: number;
  /** Delay before animation starts in ms */
  delay?: number;
  /** Number of times to play the animation (if not looping) */
  count?: number;
  /** Custom badge styling */
  style?: {
    /** Background color of the badge */
    backgroundColor?: string;
    /** Text color of the badge */
    color?: string;
    /** Border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: string;
    /** Badge opacity */
    opacity?: number;
    /** Glow color for glow animation */
    glowColor?: string;
    /** Glow intensity for glow animation (0.0-1.0) */
    glowIntensity?: number;
    /** Badge scale */
    scale?: number;
    /** Shadow for badge */
    boxShadow?: string;
  };
}

/**
 * Tab item interface
 */
export interface TabItem {
  /** Tab unique identifier */
  id?: string;
  /** Tab label text */
  label: string;
  /** Tab value */
  value: string | number;
  /** Optional icon for the tab */
  icon?: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Badge count or content */
  badge?: number | string;
  /** Controls how the badge animation behaves */
  badgeAnimation?: BadgeAnimationType | BadgeAnimationOptions;
  /** Whether the badge is hidden initially */
  badgeHidden?: boolean;
  /** Custom styling for this tab */
  style?: React.CSSProperties;
  /** Additional classes for this tab */
  className?: string;
}

/**
 * Interface for custom tab style options
 */
export interface TabStyleOptions {
  /** Font family for tab text */
  fontFamily?: string;
  /** Font size for tab text */
  fontSize?: string;
  /** Font weight for tab text */
  fontWeight?: string | number;
  /** Padding for tabs */
  padding?: string;
  /** Border radius for tabs */
  borderRadius?: string | number;
  /** Custom background color for active tab */
  activeBackgroundColor?: string;
  /** Custom text color for active tab */
  activeTextColor?: string;
  /** Custom background color for inactive tabs */
  inactiveBackgroundColor?: string;
  /** Custom text color for inactive tabs */
  inactiveTextColor?: string;
  /** Custom hover background color */
  hoverBackgroundColor?: string;
  /** Custom hover text color */
  hoverTextColor?: string;
  /** Custom active border color */
  activeBorderColor?: string;
  /** Custom shadow for active tab */
  activeShadow?: string;
  /** Gap between tabs */
  tabGap?: string | number;
  /** Transition duration for hover/active states */
  transitionDuration?: string;
  /** Custom styles for selector indicator */
  selectorStyle?: {
    /** Background color */
    backgroundColor?: string;
    /** Shadow */
    boxShadow?: string;
    /** Border radius */
    borderRadius?: string | number;
    /** Border */
    border?: string;
  };
}

export interface GlassTabBarProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Currently active tab index */
  activeTab: number;
  /** Callback when active tab changes */
  onChange: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>, index: number) => void;
  /** Tab bar layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Tab bar style variant */
  variant?: 'default' | 'pills' | 'buttons' | 'underlined' | 'enclosed';
  /** Glass styling variant */
  glassVariant?: 'clear' | 'frosted' | 'tinted';
  /** Glass blur strength */
  blurStrength?: 'light' | 'standard' | 'strong';
  /** Animation style for the selector */
  animationStyle?: 'spring' | 'magnetic' | 'inertial' | 'none';
  /** Spring physics parameters */
  physics?: {
    /** Spring tension/stiffness */
    tension?: number;
    /** Spring friction/damping */
    friction?: number;
    /** Spring mass */
    mass?: number;
  };
  /** Alignment of tabs */
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  /** Whether tabs should take full width */
  fullWidth?: boolean;
  /** Enable scrolling for many tabs */
  scrollable?: boolean;
  /** Add label under icon for vertical tabs */
  showLabels?: boolean;
  /** Add box shadow to tab bar */
  elevated?: boolean;
  /** Enable background for tab bar */
  background?: boolean;
  /** Custom tab bar width */
  width?: string | number;
  /** Custom tab bar height */
  height?: string | number;
  /** Border radius for tab bar */
  borderRadius?: string | number;
  /** Additional CSS class */
  className?: string;
  /** Additional style */
  style?: React.CSSProperties;
  /** Callback when tab is right-clicked */
  onContextMenu?: (event: React.MouseEvent, index: number) => void;
  /** Optional render prop for custom tab content */
  renderTab?: (tab: TabItem, index: number, isActive: boolean) => React.ReactNode;
  /** Icon position for tabs with both icons and labels (vertical orientation only) */
  iconPosition?: 'top' | 'left' | 'right';
  /** Display mode for vertical tabs */
  verticalDisplayMode?: 'compact' | 'expanded' | 'icon-only';
  /** Placement of the tab bar in a parent container */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Advanced orientation mode for responsive behavior */
  responsiveOrientation?: {
    /** Base orientation */
    base: 'horizontal' | 'vertical';
    /** Breakpoint to switch orientation at */
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** The orientation to use below the breakpoint */
    belowBreakpoint: 'horizontal' | 'vertical';
  };
  /** Responsive behavior configuration for different screen sizes */
  responsiveConfig?: {
    /** Base display properties for all screen sizes */
    base?: ResponsiveTabConfig;
    /** Specific overrides for small screens (< 768px) */
    small?: ResponsiveTabConfig;
    /** Specific overrides for medium screens (768px - 1199px) */
    medium?: ResponsiveTabConfig;
    /** Specific overrides for large screens (≥ 1200px) */
    large?: ResponsiveTabConfig;
  };
  /** Whether to automatically collapse tabs that don't fit */
  collapseTabs?: boolean;
  /** Custom renderer for collapsed tabs menu */
  renderCollapsedMenu?: (
    collapsedTabs: TabItem[],
    activeTab: number,
    onSelect: (index: number) => void
  ) => React.ReactNode;
  /** Enable keyboard navigation with arrow keys */
  keyboardNavigation?: boolean;
  /** Tab index for keyboard accessibility */
  tabIndex?: number;
  /** ARIA label for the tab list */
  ariaLabel?: string;
  /** Custom styles for tabs */
  tabStyle?: TabStyleOptions;
  /** Custom class applied to all tabs */
  tabClassName?: string;
  /** Custom class applied to the active tab */
  activeTabClassName?: string;
  /** Default badge animation for all tabs */
  defaultBadgeAnimation?: BadgeAnimationType | BadgeAnimationOptions;
  /** Custom badge style options */
  badgeStyle?: BadgeStyleOptions;
}

/**
 * Responsive configuration for tabs
 */
export interface ResponsiveTabConfig {
  /** Whether to show labels */
  showLabels?: boolean;
  /** Display mode for vertical tabs */
  verticalDisplayMode?: 'compact' | 'expanded' | 'icon-only';
  /** Icon position */
  iconPosition?: 'top' | 'left' | 'right';
  /** Whether tabs should take full width */
  fullWidth?: boolean;
  /** Maximum number of visible tabs before collapsing */
  maxVisibleTabs?: number;
  /** Width of the tab bar */
  width?: string | number;
  /** Height of the tab bar */
  height?: string | number;
}

/**
 * Badge style options
 */
export interface BadgeStyleOptions {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  size?: string | number;
  padding?: string;
  fontSize?: string;
  fontWeight?: string | number;
  boxShadow?: string;
  margin?: string;
}

/**
 * ScrollPosition interface for tracking scroll coordinates
 */
export interface ScrollPosition {
  x: number;
  y: number;
}

export interface TabMagneticData {
  isHoveringTab: boolean;
  closestTabIndex: number | null;
  magneticForce: number;
  selectionProgress: number;
  lastInteractionTime: number;
}

export interface MagneticSelectionConfig {
  hoverRadius: number;
  strongAttractionRadius: number;
  activationThreshold: number;
  baseAttractionForce: number;
  maxAttractionForce: number;
  selectionInertia: number;
  magneticDamping: number;
  springTension: number;
  springFriction: number;
  autoSelectDelay: number;
  minHoverTime: number;
}

export interface ScrollAnimationRef {
  rafId: number | null;
  velocity: { x: number; y: number };
  timestamp: number;
  active: boolean;
}

export interface SpringRef {
  width: number;
  height: number;
  left: number;
  top: number;
  config?: {
    tension: number;
    friction: number;
    mass: number;
    restVelocity?: number;
    precision?: number;
  };
}

export interface CollapsedMenuProps {
  tabs: TabItem[];
  activeTab: number;
  onSelect: (index: number) => void;
  open: boolean;
  onClose: () => void;
  color: string;
  orientation: string;
  variant: string;
  glassVariant: string;
}

export interface TabItemProps {
  $active: boolean;
  $orientation: string;
  $variant: string;
  $color: string;
  $fullWidth: boolean;
  $alignment: string;
  $glassVariant: string;
  $magneticProgress?: number;
  $animationStyle?: string;
  $iconPosition?: string;
  $tabStyle?: TabStyleOptions;
}

export interface TabSelectorProps {
  $variant: string;
  $orientation: string;
  $color: string;
  $glowEffect: boolean;
  $animationStyle: string;
  $selectionProgress?: number;
  $tabStyle?: TabStyleOptions;
}

export interface TabBadgeProps {
  value: number | string;
  color: string;
  animation?: BadgeAnimationType | BadgeAnimationOptions;
  hidden?: boolean;
  $borderRadius?: string;
  $size?: string | number;
  $padding?: string;
  $fontSize?: string;
  $fontWeight?: string | number;
  $boxShadow?: string;
  $margin?: string;
  $backgroundColor?: string;
  $textColor?: string;
  $borderColor?: string;
  $borderWidth?: string;
  $opacity?: number;
  $scale?: number;
}

export interface TabIconProps {
  $showLabel: boolean;
  $orientation?: string;
  $iconPosition?: string;
}

/**
 * TabBarRef interface - methods and properties exposed via forwarded ref
 */
export interface TabBarRef {
  /** Get the container element of the tab bar */
  getContainerElement: () => HTMLDivElement | null;
  
  /** Get the DOM elements of all tab buttons */
  getTabElements: () => (HTMLButtonElement | null)[];
  
  /** Get the DOM element of a specific tab button by index */
  getTabElement: (index: number) => HTMLButtonElement | null;
  
  /** Programmatically select a tab by index */
  selectTab: (index: number) => void;
  
  /** Scroll to bring a specific tab into view */
  scrollToTab: (index: number, smooth?: boolean) => void;
  
  /** Show or hide a badge on a specific tab */
  toggleBadge: (index: number, show: boolean) => void;
  
  /** Update the badge count/content on a specific tab */
  updateBadge: (index: number, value: number | string) => void;
  
  /** Check if scrolling is active */
  isScrolling: () => boolean;
}