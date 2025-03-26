/**
 * Type declarations for Galileo Glass UI examples
 */

// Declare the module without specific type information to allow the examples to compile
declare module 'galileo-glass-ui' {
  export const Button: React.ComponentType<any>;
  export const GlassButton: React.ComponentType<any>;
  export const Card: React.ComponentType<any>;
  export const GlassCard: React.ComponentType<any>;
  export const FrostedGlass: React.ComponentType<any>;
  export const DimensionalGlass: React.ComponentType<any>;
  export const HeatGlass: React.ComponentType<any>;
  export const WidgetGlass: React.ComponentType<any>;
  export const PageGlassContainer: React.ComponentType<any>;
  export const AtmosphericBackground: React.ComponentType<any>;
  export const ParticleBackground: React.ComponentType<any>;
  export const SpeedDial: React.ComponentType<any>;
  export const SpeedDialAction: React.ComponentType<any>;
  export const SpeedDialIcon: React.ComponentType<any>;
  export const Accordion: React.ComponentType<any>;
  export const AccordionSummary: React.ComponentType<any>;
  export const AccordionDetails: React.ComponentType<any>;
  export const TreeView: React.ComponentType<any>;
  export const TreeItem: React.ComponentType<any>;
  export const ToggleButton: React.ComponentType<any>;
  export const ToggleButtonGroup: React.ComponentType<any>;
  export const Rating: React.ComponentType<any>;
  export const ImageList: React.ComponentType<any>;
  export const ImageListItem: React.ComponentType<any>;
  export const ImageListItemBar: React.ComponentType<any>;
  export const KpiCard: React.ComponentType<any>;
  export const PerformanceMetricCard: React.ComponentType<any>;
  export const InteractiveKpiCard: React.ComponentType<any>;
  export const GlassNavigation: React.ComponentType<any>;
  export const ResponsiveNavigation: React.ComponentType<any>;
  export const PageTransition: React.ComponentType<any>;
  export const ZSpaceAppLayout: React.ComponentType<any>;
  export const ZSpaceLayer: React.ComponentType<any>;
  export const GlassThemeSwitcher: React.ComponentType<any>;
  export const OptimizedGlassContainer: React.ComponentType<any>;
  export const VisualFeedback: React.ComponentType<any>;
  export const RippleButton: React.ComponentType<any>;
  export const FocusIndicator: React.ComponentType<any>;
  export const StateIndicator: React.ComponentType<any>;
}

declare module 'galileo-glass-ui/core' {
  export const createThemeContext: (theme: any) => any;
  export const glassSurface: (options: any) => any;
  export const glassGlow: (options: any) => any;
  export const innerGlow: (options: any) => any;
  export const edgeHighlight: (options: any) => any;
  export const enhancedGlow: (options: any) => any;
  export const adaptiveGlass: (options: any) => any;
}

declare module 'galileo-glass-ui/animations' {
  export const usePhysicsInteraction: (options: any) => any;
  export const springAnimation: (options: any) => any;
  export const advancedPhysicsAnimation: (options: any) => any;
  export const magneticEffect: (options: any) => any;
  export const particleSystem: (options: any) => any;
  export const calculateSpringParameters: (options: any) => any;
  export const designSpring: (options: any) => any;
  export const PhysicsAnimationMode: any;
  export const createVector: (x: number, y: number) => any;
  export const applyNoise: (vector: any, amount: number) => any;
  export const calculateMagneticForce: (options: any) => any;
}