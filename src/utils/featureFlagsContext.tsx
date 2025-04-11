/**
 * Feature Flags React Context
 * 
 * Provides React components and hooks for accessing and managing feature flags.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  FeatureFlag,
  FEATURE_FLAGS,
  enableFeature,
  disableFeature,
  resetFeature,
  resetAllFeatures,
  getFeatureFlagStates,
  isFeatureEnabled,
  getAllFeatureFlags,
} from './featureFlags';

// Context type definition
interface FeatureFlagsContextType {
  // Feature flag states
  flags: Record<string, boolean>;
  // Functions to manipulate feature flags
  enable: (flagId: keyof typeof FEATURE_FLAGS) => void;
  disable: (flagId: keyof typeof FEATURE_FLAGS) => void;
  reset: (flagId: keyof typeof FEATURE_FLAGS) => void;
  resetAll: () => void;
  isEnabled: (flagId: keyof typeof FEATURE_FLAGS) => boolean;
  // List of available feature flags
  availableFlags: FeatureFlag[];
}

// Create the context with default values
const FeatureFlagsContext = createContext<FeatureFlagsContextType>({
  flags: Object.keys(FEATURE_FLAGS).reduce((acc, key) => {
    acc[key] = FEATURE_FLAGS[key as keyof typeof FEATURE_FLAGS].defaultEnabled;
    return acc;
  }, {} as Record<string, boolean>),
  enable: () => {},
  disable: () => {},
  reset: () => {},
  resetAll: () => {},
  isEnabled: () => false,
  availableFlags: [],
});

// Provider props
interface FeatureFlagsProviderProps {
  children: React.ReactNode;
  /** Whether to include internal feature flags in the context */
  includeInternal?: boolean;
}

/**
 * Feature Flags Provider
 * 
 * Wraps the application with a context provider for feature flags.
 * 
 * @example
 * ```tsx
 * <FeatureFlagsProvider>
 *   <App />
 * </FeatureFlagsProvider>
 * ```
 */
export function FeatureFlagsProvider({
  children,
  includeInternal = false,
}: FeatureFlagsProviderProps) {
  // Track feature flag states
  const [flags, setFlags] = useState<Record<string, boolean>>(getFeatureFlagStates());

  // List of available flags
  const availableFlags = useMemo(() => 
    getAllFeatureFlags(includeInternal), 
    [includeInternal]
  );

  // Update flags when they change
  useEffect(() => {
    // Initial load
    setFlags(getFeatureFlagStates());

    // Function to handle storage events
    const handleStorageChange = () => {
      setFlags(getFeatureFlagStates());
    };

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Feature flag manipulation functions
  const enable = (flagId: keyof typeof FEATURE_FLAGS) => {
    enableFeature(flagId);
    setFlags(getFeatureFlagStates());
  };

  const disable = (flagId: keyof typeof FEATURE_FLAGS) => {
    disableFeature(flagId);
    setFlags(getFeatureFlagStates());
  };

  const reset = (flagId: keyof typeof FEATURE_FLAGS) => {
    resetFeature(flagId);
    setFlags(getFeatureFlagStates());
  };

  const resetAll = () => {
    resetAllFeatures();
    setFlags(getFeatureFlagStates());
  };

  // Check if a flag is enabled
  const isEnabled = (flagId: keyof typeof FEATURE_FLAGS): boolean => {
    return isFeatureEnabled(flagId);
  };

  // Context value
  const value: FeatureFlagsContextType = {
    flags,
    enable,
    disable,
    reset,
    resetAll,
    isEnabled,
    availableFlags,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * useFeatureFlags hook
 * 
 * Hook for accessing and manipulating feature flags in components.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isEnabled, enable, disable } = useFeatureFlags();
 *   
 *   const usingNewEngine = isEnabled('ANIMATION_NEW_ENGINE');
 *   
 *   return (
 *     <div>
 *       <p>Using new engine: {usingNewEngine ? 'Yes' : 'No'}</p>
 *       <button onClick={() => enable('ANIMATION_NEW_ENGINE')}>Enable</button>
 *       <button onClick={() => disable('ANIMATION_NEW_ENGINE')}>Disable</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureFlags(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext);
  
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  
  return context;
}

/**
 * useFeatureFlag hook
 * 
 * Simplified hook for checking if a specific feature flag is enabled.
 * 
 * @param flagId The ID of the feature flag to check
 * @returns Whether the feature is enabled
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const usingNewEngine = useFeatureFlag('ANIMATION_NEW_ENGINE');
 *   
 *   return (
 *     <div>
 *       {usingNewEngine ? (
 *         <NewEngineComponent />
 *       ) : (
 *         <LegacyComponent />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureFlag(flagId: keyof typeof FEATURE_FLAGS): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagId);
}

/**
 * withFeatureFlag HOC
 * 
 * Higher-order component for conditionally rendering components based on feature flags.
 * 
 * @param flagId The ID of the feature flag to check
 * @param FeatureComponent Component to render when the feature is enabled
 * @param FallbackComponent Component to render when the feature is disabled
 * @returns A new component that renders based on the feature flag state
 * 
 * @example
 * ```tsx
 * const MyConditionalComponent = withFeatureFlag(
 *   'ANIMATION_NEW_ENGINE',
 *   NewEngineComponent,
 *   LegacyComponent
 * );
 * 
 * // Then use it as a regular component
 * function App() {
 *   return <MyConditionalComponent />;
 * }
 * ```
 */
export function withFeatureFlag<P extends object>(
  flagId: keyof typeof FEATURE_FLAGS,
  FeatureComponent: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<P>
): React.FC<P> {
  const WithFeatureFlag: React.FC<P> = (props) => {
    const isEnabled = useFeatureFlag(flagId);
    
    return isEnabled ? <FeatureComponent {...props} /> : <FallbackComponent {...props} />;
  };
  
  WithFeatureFlag.displayName = `WithFeatureFlag(${flagId})`;
  
  return WithFeatureFlag;
}

export default {
  FeatureFlagsProvider,
  useFeatureFlags,
  useFeatureFlag,
  withFeatureFlag,
}; 