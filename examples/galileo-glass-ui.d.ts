/**
 * Type declarations for Galileo Glass UI examples
 * 
 * This file provides TypeScript declarations for the Galileo Glass UI components
 * when imported by example applications. Each section declares a set of components
 * with their proper types.
 */
import * as React from 'react';

// Ensure the declaration file is recognized by TypeScript
// by setting the module correctly

declare module 'galileo-glass-ui' {
  // Re-export all Types
  export * from 'galileo-glass-ui/types';
  
  // Base Components
  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export const GlassButton: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
  export const GlassCard: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
  export const Typography: React.ForwardRefExoticComponent<TypographyProps & React.RefAttributes<HTMLElement>>;
  export const GlassTypography: React.ForwardRefExoticComponent<TypographyProps & React.RefAttributes<HTMLElement>>;
  export const TextField: React.ForwardRefExoticComponent<TextFieldProps & React.RefAttributes<HTMLInputElement>>;
  export const GlassTextField: React.ForwardRefExoticComponent<TextFieldProps & React.RefAttributes<HTMLInputElement>>;
  export const Box: React.ForwardRefExoticComponent<BoxProps & React.RefAttributes<HTMLDivElement>>;
  export const GlassBox: React.ForwardRefExoticComponent<BoxProps & React.RefAttributes<HTMLDivElement>>;
  export const Container: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLDivElement>>;
  export const GlassContainer: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLDivElement>>;
  export const Paper: React.ForwardRefExoticComponent<PaperProps & React.RefAttributes<HTMLDivElement>>;
  export const GlassPaper: React.ForwardRefExoticComponent<PaperProps & React.RefAttributes<HTMLDivElement>>;
  
  // Layout Components
  export const Grid: GridComponent;
  export const Stack: StackComponent;
  export const Divider: React.ForwardRefExoticComponent<DividerProps & React.RefAttributes<HTMLHRElement>>;
  export const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
  
  // Advanced Glass Components
  export const FrostedGlass: React.ForwardRefExoticComponent<FrostedGlassProps & React.RefAttributes<HTMLDivElement>>;
  export const DimensionalGlass: React.ForwardRefExoticComponent<DimensionalGlassProps & React.RefAttributes<HTMLDivElement>>;
  export const HeatGlass: React.ForwardRefExoticComponent<HeatGlassProps & React.RefAttributes<HTMLDivElement>>;
  export const WidgetGlass: React.ForwardRefExoticComponent<WidgetGlassProps & React.RefAttributes<HTMLDivElement>>;
  export const PageGlassContainer: React.ForwardRefExoticComponent<PageGlassContainerProps & React.RefAttributes<HTMLDivElement>>;
  
  // Background Components
  export const AtmosphericBackground: React.ForwardRefExoticComponent<AtmosphericBackgroundProps & React.RefAttributes<HTMLDivElement>>;
  export const ParticleBackground: React.ForwardRefExoticComponent<ParticleBackgroundProps & React.RefAttributes<HTMLDivElement>>;
  
  // Feature Components
  export const SpeedDial: React.ForwardRefExoticComponent<SpeedDialProps & React.RefAttributes<HTMLDivElement>>;
  export const SpeedDialAction: React.ForwardRefExoticComponent<SpeedDialActionProps & React.RefAttributes<HTMLButtonElement>>;
  export const SpeedDialIcon: React.ForwardRefExoticComponent<SpeedDialIconProps & React.RefAttributes<HTMLDivElement>>;
  export const Accordion: React.ForwardRefExoticComponent<AccordionProps & React.RefAttributes<HTMLDivElement>>;
  export const AccordionSummary: React.ForwardRefExoticComponent<AccordionSummaryProps & React.RefAttributes<HTMLDivElement>>;
  export const AccordionDetails: React.ForwardRefExoticComponent<AccordionDetailsProps & React.RefAttributes<HTMLDivElement>>;
  export const TreeView: React.ForwardRefExoticComponent<TreeViewProps & React.RefAttributes<HTMLUListElement>>;
  export const TreeItem: React.ForwardRefExoticComponent<TreeItemProps & React.RefAttributes<HTMLLIElement>>;
  export const ToggleButton: React.ForwardRefExoticComponent<ToggleButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export const ToggleButtonGroup: React.ForwardRefExoticComponent<ToggleButtonGroupProps & React.RefAttributes<HTMLDivElement>>;
  export const Rating: React.ForwardRefExoticComponent<RatingProps & React.RefAttributes<HTMLDivElement>>;
  export const ImageList: React.ForwardRefExoticComponent<ImageListProps & React.RefAttributes<HTMLUListElement>>;
  export const ImageListItem: React.ForwardRefExoticComponent<ImageListItemProps & React.RefAttributes<HTMLLIElement>>;
  export const ImageListItemBar: React.ForwardRefExoticComponent<ImageListItemBarProps & React.RefAttributes<HTMLDivElement>>;
  
  // KPI Components
  export const KpiCard: React.ForwardRefExoticComponent<KpiCardProps & React.RefAttributes<HTMLDivElement>>;
  export const PerformanceMetricCard: React.ForwardRefExoticComponent<PerformanceMetricCardProps & React.RefAttributes<HTMLDivElement>>;
  export const InteractiveKpiCard: React.ForwardRefExoticComponent<InteractiveKpiCardProps & React.RefAttributes<HTMLDivElement>>;
  
  // Navigation Components
  export const GlassNavigation: React.ForwardRefExoticComponent<GlassNavigationProps & React.RefAttributes<HTMLElement>>;
  export const ResponsiveNavigation: React.ForwardRefExoticComponent<ResponsiveNavigationProps & React.RefAttributes<HTMLElement>>;
  export const PageTransition: React.ForwardRefExoticComponent<PageTransitionProps & React.RefAttributes<HTMLDivElement>>;
  export const ZSpaceAppLayout: React.ForwardRefExoticComponent<ZSpaceAppLayoutProps & React.RefAttributes<HTMLDivElement>>;
  export const ZSpaceLayer: React.ForwardRefExoticComponent<ZSpaceLayerProps & React.RefAttributes<HTMLDivElement>>;
  
  // Theme Components
  export const GlassThemeSwitcher: React.ForwardRefExoticComponent<GlassThemeSwitcherProps & React.RefAttributes<HTMLDivElement>>;
  
  // Performance Components
  export const OptimizedGlassContainer: React.ForwardRefExoticComponent<OptimizedGlassContainerProps & React.RefAttributes<HTMLDivElement>>;
  
  // Feedback Components
  export const VisualFeedback: React.ForwardRefExoticComponent<VisualFeedbackProps & React.RefAttributes<HTMLDivElement>>;
  export const RippleButton: React.ForwardRefExoticComponent<RippleButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export const FocusIndicator: React.ForwardRefExoticComponent<FocusIndicatorProps & React.RefAttributes<HTMLDivElement>>;
  export const StateIndicator: React.ForwardRefExoticComponent<StateIndicatorProps & React.RefAttributes<HTMLDivElement>>;
  
  // Theme Provider
  export const ThemeProvider: React.FC<{ theme?: any; children: React.ReactNode }>;
  export const useTheme: () => any;
}

// Core mixins and effects
declare module 'galileo-glass-ui/core' {
  export interface GlassSurfaceOptions {
    elevation?: number;
    blurStrength?: string | number;
    backgroundOpacity?: string | number;
    borderOpacity?: string | number;
    themeContext: any;
  }
  
  export interface GlassGlowOptions {
    intensity?: string | number;
    color?: string;
    radius?: string | number;
    themeContext: any;
  }
  
  export interface InnerGlowOptions {
    intensity?: string | number;
    color?: string;
    offset?: string | number;
    themeContext: any;
  }
  
  export interface EdgeHighlightOptions {
    thickness?: number;
    opacity?: number;
    position?: 'top' | 'right' | 'bottom' | 'left' | 'all';
    themeContext: any;
  }
  
  export const createThemeContext: (theme: any) => any;
  export const glassSurface: (options: GlassSurfaceOptions) => any;
  export const glassGlow: (options: GlassGlowOptions) => any;
  export const innerGlow: (options: InnerGlowOptions) => any;
  export const edgeHighlight: (options: EdgeHighlightOptions) => any;
  export const enhancedGlow: (options: GlassGlowOptions) => any;
  export const adaptiveGlass: (options: any) => any;
}

// Animation and physics
declare module 'galileo-glass-ui/animations' {
  export enum PhysicsAnimationMode {
    SIMPLE = 'simple',
    STANDARD = 'standard',
    COMPLEX = 'complex'
  }
  
  export interface Vector2D {
    x: number;
    y: number;
  }
  
  export interface PhysicsInteractionOptions {
    mass?: number;
    friction?: number;
    elasticity?: number;
    dampening?: number;
    range?: number;
    maxForce?: number;
    mode?: PhysicsAnimationMode;
    enabled?: boolean;
    respondToMouse?: boolean;
  }
  
  export interface PhysicsInteractionResult {
    ref: React.RefObject<HTMLElement>;
    style: React.CSSProperties;
    setVelocity: (velocityX: number, velocityY: number) => void;
    setPosition: (x: number, y: number) => void;
    applyForce: (forceX: number, forceY: number) => void;
    reset: () => void;
    enable: () => void;
    disable: () => void;
  }
  
  export const usePhysicsInteraction: (options?: PhysicsInteractionOptions) => PhysicsInteractionResult;
  export const springAnimation: (options: any) => any;
  export const advancedPhysicsAnimation: (options: any) => any;
  export const magneticEffect: (options: any) => any;
  export const particleSystem: (options: any) => any;
  export const calculateSpringParameters: (options: any) => any;
  export const designSpring: (options: any) => any;
  export const createVector: (x: number, y: number) => Vector2D;
  export const applyNoise: (vector: Vector2D, amount: number) => Vector2D;
  export const calculateMagneticForce: (options: any) => Vector2D;
}

// Common component props interfaces
declare module 'galileo-glass-ui/types' {
  export interface ButtonProps {
    variant?: 'text' | 'outlined' | 'contained' | 'glass';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'inherit' | 'default';
    size?: 'small' | 'medium' | 'large';
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    fullWidth?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    [key: string]: any;
  }
  
  export interface CardProps {
    raised?: boolean;
    variant?: 'outlined' | 'elevation' | 'glass';
    glass?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface TypographyProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
    component?: React.ElementType;
    align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
    color?: 'initial' | 'inherit' | 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'error';
    glass?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface ContainerProps {
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
    fixed?: boolean;
    disableGutters?: boolean;
    glass?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface BoxProps {
    component?: React.ElementType;
    className?: string;
    glass?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface PaperProps {
    elevation?: number;
    square?: boolean;
    variant?: 'elevation' | 'outlined' | 'glass';
    glass?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface TextFieldProps {
    variant?: 'standard' | 'outlined' | 'filled' | 'glass';
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    size?: 'small' | 'medium';
    label?: React.ReactNode;
    value?: unknown;
    defaultValue?: unknown;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    error?: boolean;
    fullWidth?: boolean;
    placeholder?: string;
    glass?: boolean;
    multiline?: boolean;
    rows?: number;
    type?: string;
    [key: string]: any;
  }
  
  export interface GridComponent extends React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLDivElement>> {
    Item: React.ForwardRefExoticComponent<GridItemProps & React.RefAttributes<HTMLDivElement>>;
  }
  
  export interface GridProps {
    container?: boolean;
    spacing?: number | string;
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface GridItemProps {
    xs?: number | 'auto';
    sm?: number | 'auto';
    md?: number | 'auto';
    lg?: number | 'auto';
    xl?: number | 'auto';
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface StackComponent extends React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLDivElement>> {
    Item: React.ForwardRefExoticComponent<StackItemProps & React.RefAttributes<HTMLDivElement>>;
  }
  
  export interface StackProps {
    direction?: 'column' | 'row' | 'row-reverse' | 'column-reverse';
    spacing?: number | string;
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    glass?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface StackItemProps {
    grow?: number;
    shrink?: number;
    basis?: string | number;
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  // Generic props for all glass surface types
  export interface GlassSurfaceProps {
    elevation?: number;
    blurStrength?: 'none' | 'minimal' | 'light' | 'standard' | 'medium' | 'enhanced' | 'strong' | 'maximum';
    backgroundOpacity?: 'none' | 'subtle' | 'light' | 'medium' | 'strong' | number;
    borderOpacity?: 'none' | 'subtle' | 'light' | 'medium' | 'strong' | number;
    glowEffect?: boolean;
    glowColor?: string;
    glowIntensity?: 'none' | 'subtle' | 'light' | 'medium' | 'strong' | number;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  // Specialized glass interfaces
  export interface FrostedGlassProps extends GlassSurfaceProps {}
  export interface DimensionalGlassProps extends GlassSurfaceProps {
    depth?: number;
    perspective?: number;
    angle?: number;
  }
  export interface HeatGlassProps extends GlassSurfaceProps {
    temperature?: 'cold' | 'cool' | 'neutral' | 'warm' | 'hot';
    intensity?: number;
  }
  export interface WidgetGlassProps extends GlassSurfaceProps {
    variant?: 'info' | 'data' | 'control' | 'media';
  }
  export interface PageGlassContainerProps extends GlassSurfaceProps {
    variant?: 'standard' | 'layered' | 'deep';
  }
  
  // Theme interfaces
  export interface GlassThemeSwitcherProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'fixed';
    variant?: 'icon' | 'minimal' | 'expanded';
    isDarkMode?: boolean;
    onThemeChange?: (isDarkMode: boolean) => void;
    themes?: string[];
    [key: string]: any;
  }
  
  // Minimal interface definitions for other component types
  export interface DividerProps {
    [key: string]: any;
  }
  
  export interface LinkProps {
    [key: string]: any;
  }
  
  export interface AtmosphericBackgroundProps {
    [key: string]: any;
  }
  
  export interface ParticleBackgroundProps {
    [key: string]: any;
  }
  
  export interface SpeedDialProps {
    [key: string]: any;
  }
  
  export interface SpeedDialActionProps {
    [key: string]: any;
  }
  
  export interface SpeedDialIconProps {
    [key: string]: any;
  }
  
  export interface AccordionProps {
    [key: string]: any;
  }
  
  export interface AccordionSummaryProps {
    [key: string]: any;
  }
  
  export interface AccordionDetailsProps {
    [key: string]: any;
  }
  
  export interface TreeViewProps {
    [key: string]: any;
  }
  
  export interface TreeItemProps {
    [key: string]: any;
  }
  
  export interface ToggleButtonProps {
    [key: string]: any;
  }
  
  export interface ToggleButtonGroupProps {
    [key: string]: any;
  }
  
  export interface RatingProps {
    [key: string]: any;
  }
  
  export interface ImageListProps {
    [key: string]: any;
  }
  
  export interface ImageListItemProps {
    [key: string]: any;
  }
  
  export interface ImageListItemBarProps {
    [key: string]: any;
  }
  
  export interface KpiCardProps {
    [key: string]: any;
  }
  
  export interface PerformanceMetricCardProps {
    [key: string]: any;
  }
  
  export interface InteractiveKpiCardProps {
    [key: string]: any;
  }
  
  export interface GlassNavigationProps {
    [key: string]: any;
  }
  
  export interface ResponsiveNavigationProps {
    [key: string]: any;
  }
  
  export interface PageTransitionProps {
    [key: string]: any;
  }
  
  export interface ZSpaceAppLayoutProps {
    [key: string]: any;
  }
  
  export interface ZSpaceLayerProps {
    [key: string]: any;
  }
  
  export interface OptimizedGlassContainerProps {
    [key: string]: any;
  }
  
  export interface VisualFeedbackProps {
    [key: string]: any;
  }
  
  export interface RippleButtonProps {
    [key: string]: any;
  }
  
  export interface FocusIndicatorProps {
    [key: string]: any;
  }
  
  export interface StateIndicatorProps {
    [key: string]: any;
  }
}