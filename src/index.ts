/**
 * Galileo Glass UI
 *
 * A comprehensive UI system for creating beautiful glass morphism interfaces
 * with React and styled-components.
 */

// Explicitly re-export components to avoid conflicts
// export * from './components'; // Removed wildcard export

// --- Export intended public components --- 
export { Button, GlassButton, MagneticButton } from './components/Button';
export { Card, CardHeader, CardContent, CardActions } from './components/Card'; // Add Card subcomponents
export { GlassTypography } from './components/Typography';
export { GlassTabs } from './components/GlassTabs/GlassTabs';
export { GlassTabBar } from './components/GlassTabBar';
export { GlassCardLink } from './components/GlassCardLink/GlassCardLink';
export { Icon } from './components/Icon';
export { GlassMultiSelect } from './components/MultiSelect/GlassMultiSelect';
export { default as ChartWrapper } from './components/Chart/ChartWrapper';
export { default as PageGlassContainer } from './components/surfaces/PageGlassContainer';
export { default as FrostedGlass } from './components/surfaces/FrostedGlass';
export { default as DimensionalGlass } from './components/surfaces/DimensionalGlass';
export { default as HeatGlass } from './components/surfaces/HeatGlass';
export { default as WidgetGlass } from './components/surfaces/WidgetGlass';
export { SpeedDial, GlassSpeedDial } from './components/SpeedDial/SpeedDial';
export { default as SpeedDialAction } from './components/SpeedDial/SpeedDialAction';
export { default as SpeedDialIcon } from './components/SpeedDial/SpeedDialIcon';
export { Accordion, GlassAccordion } from './components/Accordion/Accordion';
export { AccordionSummary, GlassAccordionSummary } from './components/Accordion/AccordionSummary';
export { AccordionDetails, GlassAccordionDetails } from './components/Accordion/AccordionDetails';
export { TreeView, GlassTreeView } from './components/TreeView/TreeView';
export { TreeItem, GlassTreeItem } from './components/TreeView/TreeItem';
export { ToggleButton, GlassToggleButton } from './components/ToggleButton/ToggleButton';
export { ToggleButtonGroup, GlassToggleButtonGroup } from './components/ToggleButton/ToggleButtonGroup';
export { Rating, GlassRating } from './components/Rating/Rating';
export { ImageList, GlassImageList } from './components/ImageList/ImageList';
export { ImageListItem, GlassImageListItem } from './components/ImageList/ImageListItem';
export { ImageListItemBar, GlassImageListItemBar } from './components/ImageList/ImageListItemBar';
export { KpiCard } from './components/KpiCard/KpiCard';
export { PerformanceMetricCard, GlassPerformanceMetricCard } from './components/KpiCard/PerformanceMetricCard';
export { InteractiveKpiCard, GlassInteractiveKpiCard } from './components/KpiCard/InteractiveKpiCard';
export { GlassNavigation, ResponsiveNavigation, PageTransition, ZSpaceAppLayout } from './components/Navigation';
export { GlassThemeSwitcher } from './components/ThemeComponents';
export { default as AtmosphericBackground } from './components/backgrounds/AtmosphericBackground';
export { default as ParticleBackground } from './components/backgrounds/ParticleBackground';
export { default as VisualFeedback } from './components/VisualFeedback/VisualFeedback';
export { default as RippleButton } from './components/VisualFeedback/RippleButton';
export { GlassDataChart as DataChart } from './components/DataChart';
export { GlassTimeline } from './components/Timeline/GlassTimeline';
export { GlassDateRangePicker } from './components/DateRangePicker/GlassDateRangePicker';
export { Tooltip } from './components/Tooltip';
export { GlassStepper } from './components/GlassStepper';
export { GlassDataGrid } from './components/GlassDataGrid';
// Add other components intended for the main export here...

// Export Focus Ring component via components barrel (Task 8 Fix)
export { GlassFocusRing } from './components';

// Explicitly re-export core modules
export { createThemeContext } from './core/themeContext';

// Re-export mixins for backward compatibility
export { 
  glassSurface, 
  glassBorder,
  glowEffects, 
  innerGlow, 
  interactiveGlass,
  zSpaceLayer 
} from './core/mixins';

// Import GlassSurfaceOptions from the correct file
export type { GlassSurfaceOptions } from './core/mixins/glassSurface';

// Re-export core types
export type { 
  GlassSurfaceProps, 
  Theme, 
  ThemeVariant, 
  ColorMode,
  ThemeOptions
} from './core/types';

// Export MultiSelect types
export type { 
  MultiSelectOption, 
  OptionGroup, 
  MultiSelectProps,
  FilterFunction 
} from './components/MultiSelect/types';

// Explicitly re-export theme modules (Consolidated from ./theme barrel file)
export {
  ThemeProvider,
//  GlassThemeProvider, // Removed duplicate
  useTheme,
  useColorMode,
  useThemeVariant,
  usePreferences,
  useResponsive,
  ThemeTransition,
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} from './theme'; // Assuming ./theme exports these

// Export GlassThemeProvider separately if not in ./theme barrel - REMOVED, assuming it's in ./theme export
// export { GlassThemeProvider } from './theme/GlassThemeProvider'; 

// --- Removed direct theme exports like defaultTheme, themeTypes, createThemeContext ---
// --- Assuming they are covered by ./theme or other core exports ---


// Explicitly re-export animations (Consolidated)
export { 
  accessibleAnimation, 
  animateWithPhysics, 
  useZSpaceAnimation,
  springAnimation
} from './animations'; // Assuming ./animations barrel exists and exports these

// --- Removed direct animation hook exports like useAnimate, useAnimationSequence ---


// Explicitly re-export hooks (Consolidated from ./hooks barrel file)
export { 
  useGlassTheme, 
  usePhysicsInteraction, 
  useOrchestration,
  useGalileoPhysicsEngine,
  usePhysicsConstraint,
  useBreakpoint,          // Added from later duplicate
  useResponsiveValue,   // Added from later duplicate
  // useDebounce,            // Removed - Assuming not exported from ./hooks, potentially in ./utils or internal
  // useIsomorphicLayoutEffect, // Removed - Assuming not exported from ./hooks, potentially in ./utils or internal
  // usePrevious,            // Removed - Assuming not exported from ./hooks, potentially in ./utils or internal
  useReducedMotion,        // Added from later duplicate - path corrected
  // useIntersectionObserver, // Removed - Assuming file doesn't exist or is elsewhere
  // useGesturePhysics      // Removed - Assuming file doesn't exist or is elsewhere
  useGlassFocus,           // Added via hooks barrel (Task 8 Fix)
  useAmbientTilt          // Added: Export useAmbientTilt (Conflict 15 Fix)
} from './hooks'; // Assuming ./hooks barrel exports these

// --- Removed direct hook exports like useGlassTheme, useBreakpoint, etc. ---


// Re-export physics engine types (Consolidated from ./animations/physics/engineTypes)
export type {
  PhysicsBodyOptions,
  PhysicsBodyState,
  CollisionEvent,
  Vector2D,
  UnsubscribeFunction,
  GalileoPhysicsEngineAPI,
  PhysicsConstraintOptions,
  DistanceConstraintOptions,
  SpringConstraintOptions,
  HingeConstraintOptions
} from './animations/physics/engineTypes';

// Export AnimationStage types (Conflict 15 Fix)
export type { 
  AnimationStage,
  StyleAnimationStage,
  CallbackAnimationStage,
  EventAnimationStage,
  GroupAnimationStage,
  StaggerAnimationStage 
} from './animations/orchestration/useAnimationSequence';

// --- Removed duplicate physics type exports ---


// Main version (consolidated)
export const version = '1.0.4'; // Updated package version

// Export physics engine debug utilities (v1.0.14+)
export {
  getPhysicsBodyState,
  verifyPhysicsEngineState,
  forcePhysicsEngineUpdate,
  debugPhysicsEngine
} from './animations/physics/physicsEngineDebug';

// Export ref utilities for proper ref handling (v1.0.14+) (Consolidated)
export {
  mergeRefs,
  mergePhysicsRef,
  withForwardedRef
} from './utils/refUtils'; // Assuming ./utils/refUtils barrel exports these

// Export Animation Context/Provider (Task 12 Fix)
export { AnimationProvider, useAnimationContext } from './contexts/AnimationContext';

// Re-export core hooks (REMOVED - consolidated above)
// export { useGlassTheme } from './hooks/useGlassTheme';
// export { useBreakpoint } from './hooks/useBreakpoint';
// export { useResponsiveValue } from './hooks/useResponsiveValue';
// export { useDebounce } from './hooks/useDebounce';
// export { useIntersectionObserver } from './hooks/useIntersectionObserver';
// export { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
// export { usePrevious } from './hooks/usePrevious';

// Re-export animation/physics hooks and types (REMOVED - consolidated above or assumed in ./animations or ./hooks barrels)
// export { useAnimate, type AnimationControls } from './animations/useAnimate'; // Assumed in ./animations
// export { useAnimationSequence, type AnimationSequenceConfig, type AnimationStage } from './animations/orchestration/useAnimationSequence'; // Assumed in ./animations
// export { useAnimationStateMachine, type StateMachineDefinition, type StateMachineControls } from './animations/orchestration/useAnimationStateMachine'; // Assumed in ./animations
// export { useReducedMotion } from './animations/accessibility/useReducedMotion'; // Assumed in ./hooks
// export { useGesturePhysics } from './hooks/useGesturePhysics'; // Removed - Assuming non-existent
// export { usePhysicsInteraction } from './hooks/usePhysicsInteraction'; // Assumed in ./hooks
// export { useGalileoPhysicsEngine } from './animations/physics/useGalileoPhysicsEngine'; // Assumed in ./hooks
// export { usePhysicsConstraint } from './hooks/usePhysicsConstraint'; // Assumed in ./hooks

// Export Physics Engine API types (REMOVED - consolidated above)
// export type { ... } from './animations/physics/engineTypes';

// Export core components (REMOVED wildcard)
// ... (ensure all components like Button, Card, etc. are exported) ...
// export * from './components'; // Removed wildcard export

// Export theme related utilities and provider (REMOVED - consolidated above or assumed in barrels)
// export { GlassThemeProvider } from './theme/GlassThemeProvider'; // Kept separate for clarity if needed
// export { defaultTheme } from './theme/defaultTheme';
// export { type GlassTheme } from './theme/themeTypes';
// export { createThemeContext } from './theme/createThemeContext'; // Assumed in ./core/themeContext

// Export core utilities (REMOVED - consolidated above)
// export { mergeRefs } from './utils/mergeRefs'; // Assumed in ./utils/refUtils

// Add missing exports (Task 8 Storybook Fix)
export { Box, GlassBox } from './components/Box'; 
export { TextField, GlassTextField } from './components/TextField';
// Export DateRange type (Task 14 Fix)
export type { DateRange } from './components/DateRangePicker/types';
// Export Step type (Task 6 Fix)
export type { Step } from './components/GlassStepper/types';
// End missing exports
