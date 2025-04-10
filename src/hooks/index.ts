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
export { useParallaxScroll } from './useParallaxScroll';
export { useParticleSystem } from './useParticleSystem';
export { useChartPhysicsInteraction } from '../components/DataChart/hooks/useChartPhysicsInteraction';

// Utility hooks
export { useSortableData } from './useSortableData';
export { useFallbackStrategies } from './useFallbackStrategies';

// Scroll Reveal Hook and Component
export { useScrollReveal, ScrollReveal } from './useScrollReveal';

// Performance/Adaptive hooks (ensure correct path)
export { useAdaptiveQuality } from './useAdaptiveQuality';

export {
    getPhysicsBodyState,
    verifyPhysicsEngineState,
    forcePhysicsEngineUpdate
} from '../animations/physics/physicUtils';

// --- ADDING TYPE EXPORTS --- 
export type { 
    PhysicsInteractionOptions, 
    PhysicsInteractionType, 
    PhysicsState, // Also export related state/vector types
    PhysicsVector, 
    PhysicsMaterial, 
    CollisionShape, 
    PhysicsQuality 
} from './usePhysicsInteraction';
// Add other hook-specific type exports as needed, e.g.:
export type { UseGlassFocusOptions, UseGlassFocusReturn } from './useGlassFocus';
export type { AmbientTiltOptions } from './useAmbientTilt';
// Add Particle System types
export type { 
    ParticleSystemOptions, 
    ParticleSystemResult, 
    ParticleSystemControls, 
    ParticleSystemState,
    ParticlePresetCollection,
    ParticlePreset,
    Vector2D as ParticleVector2D // Alias if Vector2D conflicts
} from '../types/particles';
// Export types from gestures.ts
export type { 
    GesturePhysicsOptions, 
    GestureTransform, 
    GestureEventData, 
    GestureType,
    PanGestureConfig,
    PinchGestureConfig,
    RotateGestureConfig,
    TapGestureConfig
} from '../types/gestures';
// Export types from hooks.ts (Dimensional)
export type {
    InertialMovementOptions,
    InertialMovementState,
    InertialMovementResult,
    ZSpaceOptions,
    ZSpaceResult,
    Transform3DState,
    Transform3DOptions,
    SetTransform3D,
    Transform3DResult,
    ParallaxScrollOptions,
    ParallaxScrollResult
} from '../types/hooks';
// Export Accessibility Types
export type {
    MotionSensitivityLevel,
    AnimationCategory,
    QualityTier,
    DeviceCapabilities
} from '../types/accessibility';

// Export Chart Physics Interaction types
export type { ChartPhysicsInteractionOptions } from '../components/DataChart/hooks/useChartPhysicsInteraction';

// --- REMOVED ALL TYPE EXPORTS ---
