import React, { createContext, useContext, ReactNode } from 'react';
import { SpringConfig, DefaultSprings, SpringPresets } from '../animations/physics/springPhysics';
import { PhysicsConfig } from '../animations/physics/galileoPhysicsSystem';

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
}

// Create the context with a default value (can be undefined or a default object)
const AnimationContext = createContext<AnimationContextState | undefined>(undefined);

// Create a provider component
interface AnimationProviderProps {
  children: ReactNode;
  value?: Partial<AnimationContextState>; // Allow overriding defaults
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children, value = {} }) => {
  // Combine provided value with potential defaults if needed
  const contextValue: AnimationContextState = {
    // Default values can be set here if desired
    ...value,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Create a custom hook to use the context
export const useAnimationContext = (): AnimationContextState => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    console.warn('useAnimationContext must be used within an AnimationProvider. Using fallback defaults.');
    // Use newly defined standard preset names
    return {
        defaultSpring: 'DEFAULT',
        gentleSpring: 'GENTLE',
        hoverSpringConfig: 'HOVER_QUICK',
        focusSpringConfig: 'FOCUS_HIGHLIGHT',
        pressSpringConfig: 'PRESS_FEEDBACK',
        modalSpringConfig: 'MODAL_TRANSITION',
        menuSpringConfig: 'MENU_POPOVER',
        notificationSpringConfig: 'NOTIFICATION_SLIDE',
    };
  }
  return context;
};

// Optional: Export the context itself if needed elsewhere
// export { AnimationContext };
 