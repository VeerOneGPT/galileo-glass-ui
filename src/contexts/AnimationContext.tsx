import React, { createContext, useContext, ReactNode } from 'react';
import { SpringConfig, DefaultSprings, SpringPresets } from '../animations/physics/springPhysics';
import { PhysicsConfig } from '../animations/physics/galileoPhysicsSystem';
import { QualityTier, MotionSensitivityLevel } from '../types/accessibility'; // Import QualityTier and MotionSensitivityLevel enums
import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality'; // Import the new consolidated hook

// Define the shape of the context state
interface AnimationContextState {
  // General override config
  animationConfig?: SpringConfig | PhysicsConfig;
  disableAnimation?: boolean;

  // Specific named default configurations (allow preset names)
  defaultSpring?: SpringConfig | keyof typeof SpringPresets;
  gentleSpring?: SpringConfig | keyof typeof SpringPresets;
  hoverSpringConfig?: SpringConfig | keyof typeof SpringPresets;
  focusSpringConfig?: SpringConfig | keyof typeof SpringPresets;
  pressSpringConfig?: SpringConfig | keyof typeof SpringPresets;
  modalSpringConfig?: SpringConfig | keyof typeof SpringPresets;
  menuSpringConfig?: SpringConfig | keyof typeof SpringPresets;
  notificationSpringConfig?: SpringConfig | keyof typeof SpringPresets;

  // Performance Tier
  activeQualityTier?: QualityTier;
  // Add Motion Sensitivity Level
  motionSensitivityLevel?: MotionSensitivityLevel;
}

// Define props for the provider, adding forceQualityTier and defaultMotionSensitivity
interface AnimationProviderProps {
  children: ReactNode;
  value?: Partial<AnimationContextState>; 
  /** Optional: Force a specific quality tier, overriding automatic detection. */
  forceQualityTier?: QualityTier | null;
  /** Optional: Set a default motion sensitivity level for the context. */
  defaultMotionSensitivity?: MotionSensitivityLevel; 
}

// Default fallback state for the context hook
const FALLBACK_CONTEXT_STATE: AnimationContextState = {
    defaultSpring: 'DEFAULT',
    gentleSpring: 'GENTLE',
    hoverSpringConfig: 'HOVER_QUICK',
    focusSpringConfig: 'FOCUS_HIGHLIGHT',
    pressSpringConfig: 'PRESS_FEEDBACK',
    modalSpringConfig: 'MODAL_TRANSITION',
    menuSpringConfig: 'MENU_POPOVER',
    notificationSpringConfig: 'NOTIFICATION_SLIDE',
    activeQualityTier: QualityTier.MEDIUM, // Default fallback tier
    motionSensitivityLevel: MotionSensitivityLevel.MEDIUM, // Add default fallback level
};

// Create the context with a default value 
// Providing a default object helps if provider is not used, matching hook fallback
const AnimationContext = createContext<AnimationContextState>(FALLBACK_CONTEXT_STATE);

// Create a provider component
export const AnimationProvider: React.FC<AnimationProviderProps> = ({ 
    children, 
    value = {}, 
    forceQualityTier = null, 
    // Get default sensitivity from props or use fallback
    defaultMotionSensitivity = MotionSensitivityLevel.MEDIUM 
}) => {
  // Determine the active quality tier
  const { qualityTier: detectedQualityTier } = useAdaptiveQuality();
  const activeQualityTier = forceQualityTier ?? detectedQualityTier;

  // Determine active sensitivity level (user override in value prop takes precedence)
  const activeMotionSensitivity = value.motionSensitivityLevel ?? defaultMotionSensitivity;

  // Combine provided value with potential defaults and the determined quality tier
  const contextValue: AnimationContextState = {
    ...FALLBACK_CONTEXT_STATE, // Start with fallbacks
    ...value, // Apply user overrides from value prop
    activeQualityTier, // Apply determined or forced quality tier
    motionSensitivityLevel: activeMotionSensitivity, // Apply determined level
    // Ensure disableAnimation from value overrides fallback/defaults
    disableAnimation: value.disableAnimation ?? FALLBACK_CONTEXT_STATE.disableAnimation,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Create a custom hook to use the context
export const useAnimationContext = (): AnimationContextState => {
  // Context now has a default value, so useContext should always return a valid state
  return useContext(AnimationContext);
};

// Optional: Export the context itself if needed elsewhere
// export { AnimationContext };
 