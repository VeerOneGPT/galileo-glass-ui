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

// Final Corrected EXPORTS for Select and MenuItem components
export { Select } from './components/Select/Select'; 
export { MenuItem } from './components/MenuItem/MenuItem';

// Export Switch
export { Switch, GlassSwitch } from './components/Switch';

// Export DatePicker/Localization utilities
export { DatePicker, GlassDatePicker, GlassLocalizationProvider, createDateFnsAdapter } from './components/DatePicker';

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
  useParticleSystem,
  useScrollReveal,
  ScrollReveal,
  
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
  useGestureAnimation,
  
  // New consolidated hook for adaptive quality
  useAdaptiveQuality,
  
  // Note: useZSpaceAnimation is already exported directly from './animations'
  // Removed useParallaxScroll as it's exported directly below
  useGesturePhysics
} from './hooks';

// Add direct export for pointer following hooks
export { usePointerFollow, usePointerFollowGroup } from './animations/physics';

// Add explicit export for useGalileoPhysicsEngine directly from its source
export { useGalileoPhysicsEngine } from './animations/physics/useGalileoPhysicsEngine';

// Explicitly export PhysicsInteractionOptions and PhysicsInteractionType from the source
export { 
  type PhysicsInteractionOptions, 
  type PhysicsInteractionType, 
  type PhysicsState, 
  type PhysicsVector, 
  type PhysicsMaterial, 
  type CollisionShape, 
  type PhysicsQuality
} from './hooks/usePhysicsInteraction';

// Export specific hooks directly from their source files
// These are hooks that might have different implementations or are provided from multiple locations
export { useZSpace } from './hooks/useZSpace';
export { use3DTransform } from './hooks/use3DTransform';
export { useParallaxScroll } from './hooks/useParallaxScroll';

// FIX: Add direct export for useChartPhysicsInteraction
export { useChartPhysicsInteraction } from './components/DataChart/hooks/useChartPhysicsInteraction';

// Export useInertialMovement and its types
export {
  useInertialMovement,
  type InertialMovementOptions,
  type InertialMovementResult,
  type InertialMovementState
} from './hooks/useInertialMovement';

// Export 3D Transform types
export type {
  Transform3DOptions,
  Transform3DState,
  Transform3DResult,
  Vector3D
} from './animations/physics/use3DTransform';

// Export Magnetic Element hook - keeping this import to maintain correct sourcing
export { useMagneticElement } from './animations/physics/useMagneticElement';

// Export Particle System hook and types
// export { useParticleSystem } from './hooks/useParticleSystem';
// export type { 
//     ParticleSystemOptions, 
//     ParticleSystemResult, 
//     ParticleSystemControls, 
//     ParticleSystemState,
//     ParticlePresetCollection,
//     ParticlePreset,
//     Vector2D as ParticleVector2D
// } from './types/particles';

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
export const version = '1.0.23';

//------------------------------------------------------------------------------
// TYPE EXPORTS
//------------------------------------------------------------------------------

// Core types
export type { GlassSurfaceProps } from './core/types';

export type {
  GlassSurfaceProps as GlassSurfaceOptions,
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

// Export Magnetic Element types
export type { MagneticElementOptions } from './animations/physics/useMagneticElement';

// Export Point types from canonical source
export type { Point, Point3D } from './types/physics';

// Spring physics exports
export { SpringPhysics, createSpring, convertSpringParams, SpringPresets, DefaultSprings } from './animations/physics/springPhysics';
export type { SpringConfig, SpringPresetName } from './animations/physics/springPhysics';

// Export useVectorSpring
export { useVectorSpring } from './animations/physics/useVectorSpring';
export type { VectorSpringOptions } from './animations/physics/useVectorSpring';
// Fix for VectorSpringResult - use correct type name
export type { VectorSpringHookResult as VectorSpringResult } from './animations/physics/useVectorSpring';

// Export animation types from proper location
export { useGlassTheme } from './hooks/useGlassTheme';
export type { GlassThemeContextValue } from './hooks/useGlassTheme';

// Re-export Animation Sequence hook and types
export { default as useAnimationSequence } from './animations/orchestration/useAnimationSequence';
// --- Fix Export Path for Types --- 
export type { 
    AnimationSequenceConfig, 
    SequenceControls, 
    AnimationSequenceResult 
} from './animations/types'; // Corrected path
// --- End Fix --- 

// Animation types from animations/types.ts
export type {
  AnimationProps,
  AnimationTiming,
  AnimationEasing,
  AnimationPresetReference,
  AccessibleAnimationOptions,
  AnimationPairing,
  AnimationPresets,
  OptimizedAnimationOptions,
  ZSpaceAnimationOptions,
  // Public Animation Stage Types
  PublicBaseAnimationStage,
  PublicAnimationStage,
  PublicStyleAnimationStage,
  PublicCallbackAnimationStage,
  PublicEventAnimationStage,
  PublicGroupAnimationStage,
  PublicStaggerAnimationStage,
  // Standard animation types
  PlaybackDirection,
  StaggerPattern,
  TimingRelationship,
  PlaybackState,
  SequenceLifecycle,
  EasingDefinitionType,
  // Callback types
  SequenceIdCallback,
  ProgressCallback,
  AnimationIdCallback,
  ConfigCallback
} from './animations/types';

// Export all components
export * from './components';

// Export specific chart types
export type { DataPoint, ChartDataset } from './components/DataChart/types/ChartTypes';

// Export DataGrid types
export type { ColumnDefinition, SortState } from './components/GlassDataGrid/types';

// Export Gesture Physics types
export type { GesturePhysicsOptions, GestureTransform } from './animations/physics/gestures/useGesturePhysics';
export { GesturePhysicsPreset } from './animations/physics/gestures/useGesturePhysics';

// Export types from hooks index
export type { 
    AmbientTiltOptions,
    GestureEventData, 
    GestureType,
    PanGestureConfig,
    PinchGestureConfig,
    RotateGestureConfig,
    TapGestureConfig,
    ZSpaceOptions,
    ZSpaceResult,
    SetTransform3D,
    ParallaxScrollOptions,
    ParallaxScrollResult,
    MotionSensitivityLevel, 
    AnimationCategory, 
    QualityTier,
    DeviceCapabilities
} from './hooks';