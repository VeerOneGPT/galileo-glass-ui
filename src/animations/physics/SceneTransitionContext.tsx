/**
 * SceneTransitionContext.tsx
 * 
 * React context provider for scene transitions in Galileo Glass UI.
 * Provides global access to scene transition functionality across an application.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import {
  useSceneTransition,
  SceneTransitionConfig,
  SceneTransitionResult
} from './useSceneTransition';

// Create context
const SceneTransitionContext = createContext<SceneTransitionResult | null>(null);

/**
 * Props for the SceneTransitionProvider component
 */
export interface SceneTransitionProviderProps extends SceneTransitionConfig {
  /** Child components */
  children: ReactNode;
  
  /** Container element reference */
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * Provider component for scene transitions
 */
export const SceneTransitionProvider: React.FC<SceneTransitionProviderProps> = ({
  children,
  containerRef,
  ...config
}) => {
  // Initialize scene transition hook
  const sceneTransition = useSceneTransition({
    ...config,
    containerRef
  });
  
  return (
    <SceneTransitionContext.Provider value={sceneTransition}>
      {children}
    </SceneTransitionContext.Provider>
  );
};

/**
 * Hook for accessing scene transitions from the context
 */
export function useSceneTransitionContext(): SceneTransitionResult {
  const context = useContext(SceneTransitionContext);
  
  if (!context) {
    throw new Error('useSceneTransitionContext must be used within a SceneTransitionProvider');
  }
  
  return context;
}

export default SceneTransitionProvider;