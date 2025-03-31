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
export { Card } from './components/Card'; // GlassCard is used via Card's 'glass' prop
export { GlassTypography } from './components/Typography';
export { GlassTabs } from './components/GlassTabs/GlassTabs';
export { GlassTabBar } from './components/GlassTabBar';
export { GlassCardLink } from './components/GlassCardLink/GlassCardLink';
export { Icon } from './components/Icon';
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
// Add other components intended for the main export here...

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

// Explicitly re-export theme modules
export {
  ThemeProvider,
  GlassThemeProvider,
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

// Explicitly re-export animations
export { 
  accessibleAnimation, 
  animateWithPhysics, 
  useZSpaceAnimation,
  springAnimation
} from './animations';

// Explicitly re-export hooks
export { 
  useGlassTheme, 
  usePhysicsInteraction, 
  useOrchestration,
  useGalileoPhysicsEngine
} from './hooks';

// Re-export physics engine types
export type {
  PhysicsBodyOptions, // Ensure this is explicitly exported
  PhysicsBodyState,
  CollisionEvent,
  Vector2D,
  UnsubscribeFunction,
  GalileoPhysicsEngineAPI
} from './animations/physics/engineTypes';

// Main version (consolidated)
export const version = '1.0.4'; // Updated package version
