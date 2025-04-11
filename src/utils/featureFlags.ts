/**
 * Feature Flags System
 * 
 * A centralized system for managing feature flags across the codebase.
 * This allows for gradual rollout of new features and architectures.
 */

// Check if code is running in a browser environment
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Types for feature flag definitions
export interface FeatureFlag {
  /** Unique identifier for the feature */
  id: string;
  /** Human-readable name of the feature */
  name: string;
  /** Description of what the feature does */
  description: string;
  /** Default state of the feature flag */
  defaultEnabled: boolean;
  /** Whether this feature is for internal development only */
  internal?: boolean;
  /** Whether this feature is in public beta */
  beta?: boolean;
  /** Version when this feature was introduced */
  introducedVersion?: string;
  /** Whether this feature can be toggled at runtime */
  runtimeToggleable?: boolean;
}

// Collection of all feature flags
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Animation System Redesign Flags
  ANIMATION_NEW_ENGINE: {
    id: 'ANIMATION_NEW_ENGINE',
    name: 'Animation Engine Redesign',
    description: 'Enables the new animation engine with improved performance and stability',
    defaultEnabled: false,
    internal: true,
    introducedVersion: '1.0.28',
    runtimeToggleable: true,
  },
  ANIMATION_STYLE_ADAPTER: {
    id: 'ANIMATION_STYLE_ADAPTER',
    name: 'Animation Style Adapter',
    description: 'Uses the new style adapter system for animation style applications',
    defaultEnabled: false,
    internal: true,
    introducedVersion: '1.0.28',
    runtimeToggleable: true,
  },
  ANIMATION_STATE_MACHINE: {
    id: 'ANIMATION_STATE_MACHINE',
    name: 'New Animation State Machine',
    description: 'Enables the redesigned animation state machine implementation',
    defaultEnabled: false,
    internal: true,
    introducedVersion: '1.0.28',
    runtimeToggleable: true,
  },
  ANIMATION_TIMING_PROVIDER: {
    id: 'ANIMATION_TIMING_PROVIDER',
    name: 'Animation Timing Provider',
    description: 'Uses the new abstracted timing provider for animations',
    defaultEnabled: false,
    internal: true,
    introducedVersion: '1.0.28',
    runtimeToggleable: true,
  },
  ANIMATION_HOOKS_V2: {
    id: 'ANIMATION_HOOKS_V2',
    name: 'Animation Hooks V2',
    description: 'Enables the new version of animation React hooks',
    defaultEnabled: false,
    internal: true,
    introducedVersion: '1.0.28',
    runtimeToggleable: true,
  },
};

// Local storage key for feature flag overrides
const LOCAL_STORAGE_KEY = 'galileo_glass_feature_flags';

// Get feature flag overrides from local storage
function getFeatureFlagOverrides(): Record<string, boolean> {
  if (!isBrowser) {
    return {};
  }
  
  try {
    const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : {};
  } catch (error) {
    console.error('Failed to load feature flag overrides:', error);
    return {};
  }
}

// Save feature flag overrides to local storage
function saveFeatureFlagOverrides(overrides: Record<string, boolean>): void {
  if (!isBrowser) {
    return;
  }
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
  } catch (error) {
    console.error('Failed to save feature flag overrides:', error);
  }
}

/**
 * Check if a feature flag is enabled
 * 
 * @param featureFlagId The ID of the feature flag to check
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(featureFlagId: keyof typeof FEATURE_FLAGS): boolean {
  const featureFlag = FEATURE_FLAGS[featureFlagId];
  
  if (!featureFlag) {
    console.warn(`Unknown feature flag: ${featureFlagId}`);
    return false;
  }
  
  // Check for override in local storage
  const overrides = getFeatureFlagOverrides();
  if (typeof overrides[featureFlagId] === 'boolean') {
    return overrides[featureFlagId];
  }
  
  // Fall back to default
  return featureFlag.defaultEnabled;
}

/**
 * Enable a feature flag
 * 
 * @param featureFlagId The ID of the feature flag to enable
 */
export function enableFeature(featureFlagId: keyof typeof FEATURE_FLAGS): void {
  const featureFlag = FEATURE_FLAGS[featureFlagId];
  
  if (!featureFlag) {
    console.warn(`Cannot enable unknown feature flag: ${featureFlagId}`);
    return;
  }
  
  if (!featureFlag.runtimeToggleable) {
    console.warn(`Feature ${featureFlagId} cannot be toggled at runtime`);
    return;
  }
  
  const overrides = getFeatureFlagOverrides();
  overrides[featureFlagId] = true;
  saveFeatureFlagOverrides(overrides);
}

/**
 * Disable a feature flag
 * 
 * @param featureFlagId The ID of the feature flag to disable
 */
export function disableFeature(featureFlagId: keyof typeof FEATURE_FLAGS): void {
  const featureFlag = FEATURE_FLAGS[featureFlagId];
  
  if (!featureFlag) {
    console.warn(`Cannot disable unknown feature flag: ${featureFlagId}`);
    return;
  }
  
  if (!featureFlag.runtimeToggleable) {
    console.warn(`Feature ${featureFlagId} cannot be toggled at runtime`);
    return;
  }
  
  const overrides = getFeatureFlagOverrides();
  overrides[featureFlagId] = false;
  saveFeatureFlagOverrides(overrides);
}

/**
 * Reset a feature flag to its default state
 * 
 * @param featureFlagId The ID of the feature flag to reset
 */
export function resetFeature(featureFlagId: keyof typeof FEATURE_FLAGS): void {
  const featureFlag = FEATURE_FLAGS[featureFlagId];
  
  if (!featureFlag) {
    console.warn(`Cannot reset unknown feature flag: ${featureFlagId}`);
    return;
  }
  
  const overrides = getFeatureFlagOverrides();
  delete overrides[featureFlagId];
  saveFeatureFlagOverrides(overrides);
}

/**
 * Reset all feature flags to their default states
 */
export function resetAllFeatures(): void {
  saveFeatureFlagOverrides({});
}

/**
 * Get a list of all available feature flags
 * 
 * @param includeInternal Whether to include internal feature flags
 * @returns Array of feature flag objects
 */
export function getAllFeatureFlags(includeInternal = false): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(flag => includeInternal || !flag.internal);
}

/**
 * Get the current state of all feature flags
 * 
 * @returns Record mapping feature flag IDs to their current enabled state
 */
export function getFeatureFlagStates(): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const overrides = getFeatureFlagOverrides();
  
  Object.keys(FEATURE_FLAGS).forEach(id => {
    const flagId = id as keyof typeof FEATURE_FLAGS;
    result[id] = typeof overrides[flagId] === 'boolean' 
      ? overrides[flagId] 
      : FEATURE_FLAGS[flagId].defaultEnabled;
  });
  
  return result;
}

/**
 * React hook for feature flags
 * 
 * Note: This is a placeholder. In the actual implementation, we would:
 * 1. Create a React context for feature flags
 * 2. Implement a Provider component to wrap the application
 * 3. Create a useFeatureFlag hook to access flag state
 * 
 * This will be implemented in a separate file dedicated to React integration.
 */ 