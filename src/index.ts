/**
 * Galileo Glass UI
 *
 * A comprehensive UI system for creating beautiful glass morphism interfaces
 * with React and styled-components.
 */

//------------------------------------------------------------------------------
// COMPONENT EXPORTS
//------------------------------------------------------------------------------

export { Button, GlassButton, MagneticButton } from './components/Button';
export { Card, CardHeader, CardContent, CardActions } from './components/Card';
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
export { Paper, GlassPaper } from './components';
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
export { GlassFocusRing } from './components';
export { Box, GlassBox } from './components/Box';
export { TextField, GlassTextField } from './components/TextField';

//------------------------------------------------------------------------------
// CORE & THEME EXPORTS
//------------------------------------------------------------------------------

export { createThemeContext } from './core/themeContext';

// Mixins
export {
  glassSurface,
  glassBorder,
  glowEffects,
  innerGlow,
  interactiveGlass,
  zSpaceLayer
} from './core/mixins';

// Theme modules
export {
  ThemeProvider,
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
} from './theme';

//------------------------------------------------------------------------------
// ANIMATION EXPORTS
//------------------------------------------------------------------------------

export {
  accessibleAnimation,
  animateWithPhysics,
  useZSpaceAnimation,
  springAnimation
} from './animations';

export { AnimationProvider, useAnimationContext } from './contexts/AnimationContext';

//------------------------------------------------------------------------------
// HOOKS EXPORTS
//------------------------------------------------------------------------------

export {
  // useTheme, // Already exported from './theme' above
  usePhysicsInteraction,
  useOrchestration,
  usePhysicsEngine,
  usePhysicsConstraint,
  usePhysicsLayout,
  useBreakpoint,
  useResponsiveValue,
  useReducedMotion,
  useAmbientTilt,
  useDraggableListPhysics,
  useGalileoStateSpring,
  useGalileoSprings,
  useGlassEffects,
  useGlassPerformance,
  useStaggeredAnimation,
  useSortableData,
  useFallbackStrategies,
  useGlassFocus,
  
  // Accessibility related hooks
  useAccessibilitySettings,
  useAccessibleAnimation,
  useAccessibleAnimationOptions,
  useEnhancedReducedMotion,
  useReducedMotionAlternative,
  useMotionSettings,
  useMotionProfiler,
  
  // Animation related hooks
  useAnimationSpeed,
  useAnimationSynchronization,
  useAnimationEvent,
  useAnimationInterpolator,
  useOptimizedAnimation,
  useScrollScene,
  useGestureAnimation
  
  // Note: useZSpaceAnimation is already exported directly from './animations'
} from './hooks';

// Export 3D Transform and Magnetic Element hooks directly from source
export { use3DTransform } from './animations/physics/use3DTransform';
export { useMagneticElement } from './animations/physics/useMagneticElement';

//------------------------------------------------------------------------------
// UTILITY EXPORTS
//------------------------------------------------------------------------------

// Physics engine debug utilities
export {
  getPhysicsBodyState,
  verifyPhysicsEngineState,
  forcePhysicsEngineUpdate,
  debugPhysicsEngine
} from './animations/physics/physicsEngineDebug';

// Ref utilities
export {
  mergeRefs,
  mergePhysicsRef,
  withForwardedRef
} from './utils/refUtils';

// Version
export const version = '1.0.4';

//------------------------------------------------------------------------------
// TYPE EXPORTS
//------------------------------------------------------------------------------

// Core types
export type { GlassSurfaceOptions } from './core/mixins/glassSurface';

export type {
  GlassSurfaceProps,
  Theme,
  ThemeVariant,
  ColorMode,
  ThemeOptions
} from './core/types';

// Component types
export type {
  MultiSelectOption,
  OptionGroup,
  MultiSelectProps,
  FilterFunction
} from './components/MultiSelect/types';

export type { DateRange } from './components/DateRangePicker/types';
export type { Step } from './components/GlassStepper/types';

// Physics engine types
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

// Hook types
export type {
  // usePhysicsLayout types
  LayoutType,
  PhysicsLayoutItemConfig,
  PhysicsLayoutOptions,
  PhysicsLayoutResult
} from './types/hooks';

// Export useGlassFocus types
export type { UseGlassFocusOptions, UseGlassFocusReturn } from './hooks/useGlassFocus';

// Animation sequence types
export type {
  AnimationSequenceConfig,
  SequenceControls,
  AnimationSequenceResult
} from './animations/orchestration/useAnimationSequence';

// Orchestration types
export type {
  OrchestrationPattern,
  TimingFunction,
  GestaltRelationship,
  GestaltPatternOptions,
  OrchestrationOptions
} from './hooks/useOrchestration';

// Physics interaction types
export type {
  PhysicsInteractionOptions,
  PhysicsInteractionType
} from './hooks/usePhysicsInteraction';

// Gesture physics types
export type {
  GesturePhysicsOptions,
  GestureTransform,
  GesturePhysicsResult
} from './animations/physics/gestures/useGesturePhysics';

// Animation types
export type {
  AnimationStage,
  StyleAnimationStage,
  CallbackAnimationStage,
  EventAnimationStage,
  GroupAnimationStage,
  StaggerAnimationStage,
  PlaybackDirection,
  StaggerPattern,
  TimingRelationship,
  PlaybackState,
  SequenceLifecycle,
  EasingDefinitionType
} from './animations/types';

// Export Point directly from its canonical source
export type { Point, Point3D } from './types/physics';