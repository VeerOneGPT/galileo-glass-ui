// Export necessary hooks, types, and presets from the main library
export {
  useGalileoStateSpring,
  usePhysicsEngine,
  useReducedMotion,
  useTheme,
  useBreakpoint,
  useMeasure,
  useWindowSize,
  useElementSize,
  useDebounce,
  useThrottle,
  usePrevious,
  useIsomorphicLayoutEffect,
  useOnClickOutside,
  useHover,
  useFocus,
  useFocusVisible,
  useKeyPress,
  useInterval,
  useTimeout,
  useRafState,
  useMergedRef,
  useId,
  useControllableState,
  useDeviceCapabilities,
  // useQualityTier, // Seems problematic based on build error?
  useEventListener,
  useFocusWithin,
  useParallaxScroll,
  useGesturePhysics,
  // Add other essential hooks used by website components here
} from '@veerone/galileo-glass-ui';

// Export necessary types
export type {
  GalileoStateSpringOptions,
  PhysicsEngineOptions,
  SpringConfig,
  SpringPresets,
  Theme,
  ThemeContextProps,
  GlassTheme,
  ColorPalette,
  Breakpoint,
  Size,
  RectReadOnly,
  MotionSensitivityLevel,
  AnimationCategory,
  // QualityTier as GalileoQualityTier, // Problematic import?
  DeviceCapabilities,
  GesturePhysicsOptions,
  GesturePhysicsResult,
  // Add other essential types used by website components here
} from '@veerone/galileo-glass-ui';

// Re-exporting presets directly might be useful
export { SpringPresets as GalileoSpringPresets } from '@veerone/galileo-glass-ui';

// TODO: Add any adapter-specific logic or re-exports if needed 