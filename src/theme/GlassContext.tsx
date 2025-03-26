import { createContext, useContext } from 'react';

// Glass context type
export interface GlassContextType {
  /**
   * Whether reduced effects should be used
   */
  reducedEffects: boolean | 'minimal';

  /**
   * Whether to use hardware acceleration
   */
  useHardwareAcceleration: boolean;

  /**
   * The quality tier for glass effects
   */
  qualityTier: 'ultra' | 'high' | 'medium' | 'low' | 'minimal';

  /**
   * Whether dark mode is active
   */
  isDarkMode: boolean;

  /**
   * The current theme variant
   */
  themeVariant: string;

  /**
   * Get a color value from the theme
   */
  getColor: (path: string, fallback?: string) => string;
}

// Default glass context
const defaultGlassContext: GlassContextType = {
  reducedEffects: false,
  useHardwareAcceleration: true,
  qualityTier: 'high',
  isDarkMode: false,
  themeVariant: 'default',
  getColor: () => '',
};

// Create the glass context
export const GlassContext = createContext<GlassContextType>(defaultGlassContext);

/**
 * Hook to use the glass context
 */
export const useGlass = () => {
  return useContext(GlassContext);
};

export default GlassContext;
