/**
 * Accessibility Related Types
 */

/**
 * Enum defining different levels of motion sensitivity.
 * Used by useEnhancedReducedMotion and potentially other animation components.
 */
export enum MotionSensitivityLevel {
    NONE = 'none',    // No preference detected or explicitly set.
    HIGH = 'high',    // Prefers some motion, minimal reduction needed.
    MEDIUM = 'medium', // Prefers significantly reduced motion.
    LOW = 'low',      // Prefers little to no motion, major reduction or alternatives needed.
}

/**
 * Enum defining conceptual categories for animations.
 * Helps components decide how to adjust based on sensitivity or user preferences.
 */
export enum AnimationCategory {
    ESSENTIAL = 'essential', // Crucial for understanding state/interaction (e.g., focus, loading)
    TRANSITION = 'transition', // Navigational or state changes (e.g., modals, page loads)
    FEEDBACK = 'feedback',   // Direct response to user input (e.g., button press)
    HOVER = 'hover',      // Effects triggered by hover
    SCROLL = 'scroll',     // Effects linked to scrolling (e.g., parallax)
    ATTENTION = 'attention', // Designed to draw user attention (e.g., notification bounce)
    LOADING = 'loading',    // Indeterminate progress indicators (can overlap with ESSENTIAL)
    DECORATIVE = 'decorative', // Purely aesthetic with no functional purpose
    BACKGROUND = 'background', // Subtle background effects
}

/**
 * Enum defining performance quality tiers.
 */
export enum QualityTier {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    ULTRA = 'Ultra',
}

/**
 * Represents detected device capabilities relevant to performance.
 */
export interface DeviceCapabilities {
    /** Logical CPU cores detected. */
    cpuCores?: number;
    /** Approximate device memory in GB. */
    deviceMemory?: number;
    /** Network connection effective type. */
    connectionType?: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
    /** Whether the user has requested reduced data usage. */
    saveData?: boolean;
    // Future: GPU info, screen refresh rate?
} 