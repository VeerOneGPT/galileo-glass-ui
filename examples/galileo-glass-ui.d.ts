/**
 * Type declarations for Galileo Glass UI examples
 * 
 * This file provides TypeScript declarations for the Galileo Glass UI components
 * when imported by example applications.
 */
import * as React from 'react';

// Simpler approach with wildcard declarations
declare module 'galileo-glass-ui' {
  // TabItem interface needed for examples
  export interface TabItem {
    id?: string;
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    disabled?: boolean;
    badge?: number | string;
    badgeAnimation?: any;
    badgeHidden?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }

  // Icon position type 
  export type IconPosition = 'left' | 'top' | 'right';
  
  // TabBar component props
  export interface GlassTabBarProps {
    tabs: TabItem[];
    activeTab: number;
    onChange: (event: React.SyntheticEvent, index: number) => void;
    orientation?: 'horizontal' | 'vertical';
    variant?: 'default' | 'pills' | 'buttons' | 'underlined' | 'enclosed';
    glassVariant?: 'clear' | 'frosted' | 'tinted';
    iconPosition?: IconPosition;
    // Other props as needed
  }
  
  // DataChart tooltip style
  export interface ChartInteractionOptions {
    tooltipStyle?: 'glass' | 'frosted' | 'tinted' | 'luminous' | 'dynamic';
    // Other options as needed
  }
  
  // DateRangePicker control types
  export interface DateRangePickerProps {
    value?: any;
    onChange?: (value: any) => void;
    // Other props as needed
  }
  
  // Export component interfaces
  export const GlassTabBar: React.FC<GlassTabBarProps>;
  export const TabBar: React.FC<GlassTabBarProps>;
  export const DataChart: React.FC<any>;
  export const GlassDataChart: React.FC<any>;
  export const GlassDateRangePicker: React.FC<DateRangePickerProps>;
  export const StandardDateRangePresets: any[];
  export const AllDateRangePresets: any[];
  
  // Common components
  export const Typography: React.FC<any>;
  export const Card: React.FC<any>;
  export const Button: React.FC<any>;
  export const Select: React.FC<any>;
  export const Checkbox: React.FC<any>;
  
  // Export all other components and utilities
  export const ThemeProvider: React.FC<{theme: any}>;
  export const GlassLocalizationProvider: React.FC<any>;
  export const createDateFnsAdapter: () => any;
}

// Simpler declarations for submodules
declare module 'galileo-glass-ui/types' {}
declare module 'galileo-glass-ui/hooks' {}
declare module 'galileo-glass-ui/theme' {}
declare module 'galileo-glass-ui/core' {}
declare module 'galileo-glass-ui/animations' {}
declare module 'galileo-glass-ui/animations/physics' {}
declare module '@veerone/galileo-glass-ui' {
  // Duplicate the exports from the main module
  // TabItem interface needed for examples
  export interface TabItem {
    id?: string;
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    disabled?: boolean;
    badge?: number | string;
    badgeAnimation?: any;
    badgeHidden?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }

  // Icon position type 
  export type IconPosition = 'left' | 'top' | 'right';
  
  // TabBar component props
  export interface GlassTabBarProps {
    tabs: TabItem[];
    activeTab: number;
    onChange: (event: React.SyntheticEvent, index: number) => void;
    orientation?: 'horizontal' | 'vertical';
    variant?: 'default' | 'pills' | 'buttons' | 'underlined' | 'enclosed';
    glassVariant?: 'clear' | 'frosted' | 'tinted';
    iconPosition?: IconPosition;
    // Other props as needed
  }
  
  // Export component interfaces
  export const GlassTabBar: React.FC<GlassTabBarProps>;
  export const TabBar: React.FC<GlassTabBarProps>;
  export const DataChart: React.FC<any>;
  export const GlassDataChart: React.FC<any>;
  export const GlassDateRangePicker: React.FC<any>;
  export const StandardDateRangePresets: any[];
  export const AllDateRangePresets: any[];
}

declare module '@veerone/galileo-glass-ui/hooks' {}