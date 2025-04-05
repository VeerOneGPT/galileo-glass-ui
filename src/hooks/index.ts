// src/hooks/index.ts

// Core hooks
export { GlassContext as useGlassContext } from '../theme/GlassContext';
export { useGlassTheme as useTheme } from './useGlassTheme';
export { useBreakpoint } from './useBreakpoint';
export { useResponsiveValue } from './useResponsiveValue';
export { useGlassFocus } from './useGlassFocus';

// Accessibility hooks
export { useReducedMotion } from './useReducedMotion';
export { useEnhancedReducedMotion } from './useEnhancedReducedMotion';
export { useReducedMotionAlternative } from './useReducedMotionAlternative';
export { useAccessibilitySettings } from './useAccessibilitySettings';
export { useAccessibleAnimation } from './useAccessibleAnimation';
export { useAccessibleAnimationOptions } from './useAccessibleAnimationOptions';
export { useMotionSettings } from './useMotionSettings';
export { useFocusTrap } from './accessibility/useFocusTrap';

// Animation hooks
export { useAnimationSequence } from '../animations/orchestration/useAnimationSequence';
export { useOrchestration } from './useOrchestration';
export { useStaggeredAnimation } from './useStaggeredAnimation';
export { useAnimationSpeed } from './useAnimationSpeed';
export { useAnimationSynchronization } from './useAnimationSynchronization';
export { useAnimationEvent } from './useAnimationEvent';
export { useAnimationInterpolator } from './useAnimationInterpolator';
export { 
    useOptimizedAnimation, 
    optimizedAnimation, 
    AnimationComplexity 
} from './useOptimizedAnimation';
export { useZSpaceAnimation } from './useZSpaceAnimation';
export { useScrollScene } from './useScrollScene';
export { useMotionProfiler } from './useMotionProfiler';
export { useGestureAnimation } from './useGestureAnimation';

// Glass UI specific hooks
export { useGlassEffects } from './useGlassEffects';
export { useGlassPerformance } from './useGlassPerformance';

// Physics hooks
export { useGalileoPhysicsEngine as usePhysicsEngine } from '../animations/physics/useGalileoPhysicsEngine';
export { usePhysicsInteraction } from './usePhysicsInteraction';
export { usePhysicsLayout } from './usePhysicsLayout';
export { usePhysicsConstraint } from './usePhysicsConstraint';
export { useGesturePhysics } from '../animations/physics/gestures/useGesturePhysics';
export { useAmbientTilt } from './useAmbientTilt';
export { useDraggableListPhysics } from './useDraggableListPhysics';
export { useGalileoStateSpring } from './useGalileoStateSpring';
export { useGalileoSprings } from './useGalileoSprings';

// Utility hooks
export { useSortableData } from './useSortableData';
export { useFallbackStrategies } from './useFallbackStrategies';

export {
    getPhysicsBodyState,
    verifyPhysicsEngineState,
    forcePhysicsEngineUpdate
} from '../animations/physics/physicUtils';

// --- REMOVED ALL TYPE EXPORTS ---
