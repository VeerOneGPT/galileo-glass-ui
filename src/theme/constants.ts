/**
 * Theme Constants
 * 
 * Constants for the Glass UI theme system
 */

/**
 * Theme names
 */
export const THEME_NAMES = {
  DEFAULT: 'default',
  DASHBOARD: 'dashboard',
  MARKETING: 'marketing',
  ADMIN: 'admin',
  CREATIVE: 'creative',
};

/**
 * Theme variants
 */
export const THEME_VARIANTS = {
  STANDARD: 'standard',
  FROSTED: 'frosted',
  DARK_GLASS: 'dark-glass',
  LIGHT_GLASS: 'light-glass',
  PREMIUM: 'premium',
  MINIMAL: 'minimal',
};

/**
 * Glass quality tiers
 */
export const GLASS_QUALITY_TIERS = {
  ULTRA: 'ultra',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  MINIMAL: 'minimal',
};

/**
 * Blur strength presets
 */
export const BLUR_STRENGTHS = {
  NONE: '0px',
  MINIMAL: '4px',
  LIGHT: '8px',
  STANDARD: '12px',
  ENHANCED: '20px',
  HEAVY: '30px',
};

/**
 * Glow intensity presets
 */
export const GLOW_INTENSITIES = {
  NONE: 'none',
  SUBTLE: 'subtle',
  MEDIUM: 'medium',
  STRONG: 'strong',
  INTENSE: 'intense',
};

/**
 * Animation presets
 */
export const ANIMATION_PRESETS = {
  QUICK: {
    duration: 0.2,
    easing: 'ease-out',
  },
  STANDARD: {
    duration: 0.3,
    easing: 'ease-in-out',
  },
  SMOOTH: {
    duration: 0.5,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  SPRING: {
    duration: 0.6,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  BOUNCE: {
    duration: 0.8,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};