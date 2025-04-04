import React, { ReactNode, CSSProperties } from 'react';
import { DefaultTheme } from 'styled-components';
import type { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';

/**
 * Props for the GlassNavigation component
 */
export interface GlassNavigationProps {
  /** Nav items to display */
  items: NavigationItem[];
  /** Current active item */
  activeItem?: string;
  /** Callback when an item is clicked */
  onItemClick?: (id: string) => void;
  /** Callback when the menu is toggled (mobile) */
  onMenuToggle?: (isOpen: boolean) => void;
  /** Position of the navigation */
  position?: 'top' | 'left' | 'right' | 'bottom';
  /** Style variant */
  variant?: 'standard' | 'minimal' | 'prominent';
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Logo or brand component */
  logo?: ReactNode;
  /** Additional actions to display (e.g., search, profile) */
  actions?: ReactNode;
  /** Whether to show a divider */
  showDivider?: boolean;
  /** Glass effect intensity (0-1) */
  glassIntensity?: number;
  /** Whether the nav is sticky */
  sticky?: boolean;
  /** Maximum width of the navigation container */
  maxWidth?: string | number;
  /** Theme object */
  theme?: DefaultTheme;
  /** Whether to use compact design */
  compact?: boolean;
  /** Whether to use centered layout */
  centered?: boolean;
  /** Custom z-index */
  zIndex?: number;
  /** Custom width (for side navigation) */
  width?: string | number;
  /** Initial state for collapsible items */
  initialExpandedItems?: string[];
  /** Whether the navigation is collapsible */
  collapsible?: boolean;
  /** Initial collapsed state for collapsible navigation */
  initialCollapsed?: boolean;
}

/**
 * Navigation item structure
 */
export interface NavigationItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Link target */
  href?: string;
  /** Navigation icon */
  icon?: ReactNode;
  /** Whether the item is currently active */
  active?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Nested child items */
  children?: NavigationItem[];
  /** Access level required for this item */
  accessLevel?: string;
  /** Badge to display (notification count, etc.) */
  badge?: string | number;
  /** Custom onClick handler */
  onClick?: () => void;
  /** Whether to open link in new window */
  external?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Tooltip text */
  tooltip?: string;
  /** Element to render instead of standard item */
  customElement?: ReactNode;
}

/**
 * Props for the ResponsiveNavigation component
 */
export interface ResponsiveNavigationProps extends GlassNavigationProps {
  /** Breakpoint at which to switch to mobile navigation */
  mobileBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Mobile menu label */
  mobileMenuLabel?: string;
  /** Whether to use a drawer for mobile navigation */
  useDrawer?: boolean;
  /** Custom mobile menu icon */
  menuIcon?: ReactNode;
  /** Whether to collapse to a minimal version before switching to mobile */
  useMinimalBefore?: boolean;
  /** Whether to show the logo in mobile view */
  showLogoInMobile?: boolean;
  /** Mobile menu position */
  mobileMenuPosition?: 'left' | 'right' | 'top' | 'bottom' | 'full';
  /** Mobile backdrop opacity */
  mobileBackdropOpacity?: number;
  /** Whether to use a header in drawer mode */
  drawerWithHeader?: boolean;
  /** Custom drawer width */
  drawerWidth?: string | number;
}

/**
 * PageTransition Props
 */
export interface PageTransitionProps {
  /** Children to render */
  children?: ReactNode;

  /** Transition mode */
  mode?: 'fade' | 'slide' | 'zoom' | 'flip' | 'glass-fade' | 'glass-reveal' | 'physics' | 'zSpace';

  /** Unique key to trigger transition (e.g., route path) */
  locationKey?: string | number;

  /** Duration in milliseconds */
  duration?: number;

  /** If true, disable transitions */
  disabled?: boolean;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: CSSProperties;

  /** Perspective for 3D transitions */
  perspective?: number;

  /** Direction for slide/reveal transitions */
  direction?: 'up' | 'down' | 'left' | 'right';
  
  /** Configuration for physics transitions */
  physicsConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;

  /** Callback when transition starts */
  onStart?: () => void;

  /** Callback when transition completes */
  onComplete?: () => void;

  /** Intensity for glass transitions (0-1) */
  glassTransitionIntensity?: number;

  /** If true, respects reduced motion preferences */
  respectReducedMotion?: boolean;

  /** Additional props */
  [key: string]: any;
}

/**
 * Props for the ZSpaceAppLayout component
 */
export interface ZSpaceAppLayoutProps {
  /** The main content */
  children: ReactNode;
  /** The navigation component */
  navigation?: ReactNode;
  /** The sidebar component */
  sidebar?: ReactNode;
  /** The header component */
  header?: ReactNode;
  /** The footer component */
  footer?: ReactNode;
  /** Whether the layout has a fixed header */
  fixedHeader?: boolean;
  /** Whether the layout has a fixed footer */
  fixedFooter?: boolean;
  /** Whether the layout has a fixed sidebar */
  fixedSidebar?: boolean;
  /** Sidebar width */
  sidebarWidth?: string | number;
  /** Header height */
  headerHeight?: string | number;
  /** Footer height */
  footerHeight?: string | number;
  /** Whether the sidebar is initially collapsed */
  initialSidebarCollapsed?: boolean;
  /** Breakpoint below which the sidebar automatically collapses. Defaults to 'md' (960px). */
  sidebarBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Z-space layers configuration */
  zLayers?: {
    background?: number;
    sidebar?: number;
    header?: number;
    content?: number;
    footer?: number;
    navigation?: number;
    overlay?: number;
  };
  /** Maximum content width */
  maxContentWidth?: string | number;
  /** Content padding */
  contentPadding?: string | number;
  /** Background component */
  backgroundComponent?: ReactNode;
  /** Whether to use glass effects */
  useGlassEffects?: boolean;
  /** Glass effect intensity */
  glassIntensity?: number;
  /** Theme object */
  theme?: DefaultTheme;
  /** Custom sidebar collapse toggle */
  sidebarToggle?: ReactNode;
  /** Whether to enable z-space animations */
  enableZSpaceAnimations?: boolean;
  /** Z-space animation intensity */
  zSpaceAnimationIntensity?: number;
}
