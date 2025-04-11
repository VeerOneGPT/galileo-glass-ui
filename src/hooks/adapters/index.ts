// Export necessary hooks, types, and presets from the main library

// Located Hooks (using relative paths)
export { useGalileoStateSpring } from '../useGalileoStateSpring';
export { useGalileoPhysicsEngine } from '../../animations/physics/useGalileoPhysicsEngine';
export { useReducedMotion } from '../useReducedMotion';
export { useGlassTheme } from '../useGlassTheme';
export { useBreakpoint } from '../useBreakpoint';
export { useParallaxScroll } from '../useParallaxScroll';
export { useGesturePhysics } from '../useGesturePhysics';
export { useAccessibilitySettings } from '../useAccessibilitySettings';
export { useDeviceCapabilities } from '../../animations/performance/useDeviceCapabilities';
export { useGlassFocus as useFocus } from '../useGlassFocus';

// --- Hooks below were not found in docs search, paths need verification --- 
// export { useMeasure } from '???';
// export { useWindowSize } from '???';
// export { useElementSize } from '???';
// export { useDebounce } from '???';
// export { useThrottle } from '???';
// export { usePrevious } from '???';
// export { useIsomorphicLayoutEffect } from '???';
// export { useOnClickOutside } from '???';
// export { useHover } from '???';
// export { useFocusVisible } from '???';
// export { useKeyPress } from '???';
// export { useInterval } from '???';
// export { useTimeout } from '???';
// export { useRafState } from '???';
// export { useMergedRef } from '???';
// export { useId } from '???'; // Ambiguous search results
// export { useControllableState } from '???';
// export { useEventListener } from '???';
// export { useFocusWithin } from '???';

// Export necessary types
export type { GalileoStateSpringOptions } from '../useGalileoStateSpring';
export type { GalileoPhysicsEngineAPI } from '../../animations/physics/engineTypes';
export type { SpringConfig } from '../../animations/physics/springPhysics';
export type { GlassTheme, ThemeContext } from '../../core/theme';
export type { Breakpoint } from '../useBreakpoint';
export type { DeviceCapabilities } from '../../animations/performance/useDeviceCapabilities';
export type { GesturePhysicsOptions } from '../../types/gestures';
export type { MotionSensitivityLevel, AnimationCategory } from '../../animations/accessibility/MotionSensitivity';

// --- Types below need their paths verified --- 
// export type { Size } from '???'; // From useWindowSize/useElementSize?
// export type { RectReadOnly } from '???'; // From useMeasure?

// Re-exporting presets directly might be useful
export { SpringPresets } from '../../animations/physics/springPhysics';
export { SpringPresets as GalileoSpringPresets } from '../../animations/physics/springPhysics';

// TODO: Add any adapter-specific logic or re-exports if needed 