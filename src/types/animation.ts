import { SpringConfig } from '../animations/physics/springPhysics';
import { PhysicsConfig } from '../animations/physics/galileoPhysicsSystem';

/**
 * Standard animation properties applicable to various components.
 */
export interface AnimationProps {
  /**
   * Optional configuration for physics-based animations.
   * Can be a spring configuration or a more general physics config.
   * This will typically override default configurations from the theme or context.
   */
  animationConfig?: SpringConfig | PhysicsConfig;

  /**
   * Optional flag to disable animations for this specific component instance.
   * Takes precedence over context settings but is overridden by reduced motion preferences.
   */
  disableAnimation?: boolean;
} 