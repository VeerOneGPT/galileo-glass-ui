/**
 * Animation Orchestrator
 *
 * Coordinates and manages complex animation sequences.
 */
import { createElement, ReactElement, ReactNode, useEffect, ComponentType, FC } from 'react';
import { Keyframes } from 'styled-components';

import { AnimationMapping } from '../accessibility/AccessibilityTypes';
import { accessibleAnimation } from '../accessibility/accessibleAnimation';
import { animationMapper } from '../accessibility/AnimationMapper';
import {
  MotionSensitivityLevel,
  AnimationComplexity,
  getMotionSensitivity,
} from '../accessibility/MotionSensitivity';
import type { AnimationPreset } from '../core/types';

/**
 * Animation event types
 */
export type AnimationEventType = 'start' | 'complete' | 'pause' | 'resume' | 'cancel';

/**
 * Animation event listener
 */
export type AnimationEventListener = (event: {
  type: AnimationEventType;
  target: string;
  animation: string;
  timestamp: number;
}) => void;

/**
 * Animation target config
 */
export interface AnimationTarget {
  /** Target element selector or reference */
  target: string | HTMLElement;

  /** Animation to apply */
  animation: AnimationPreset;

  /** Delay before this animation in milliseconds */
  delay?: number;

  /** Duration override for this animation */
  duration?: string | number;

  /** Whether to wait for this animation to complete before next */
  waitForCompletion?: boolean;

  /** Trigger next animation after a percentage of completion */
  triggerAt?: number;

  /** Custom options for this animation */
  options?: Record<string, any>;
}

/**
 * Animation sequence configuration
 */
export interface AnimationSequence {
  /** Animation targets in sequence */
  targets: AnimationTarget[];

  /** Whether to run animations in parallel */
  parallel?: boolean;

  /** Motion sensitivity level to apply */
  sensitivity?: MotionSensitivityLevel;

  /** Whether to loop the sequence */
  loop?: boolean;

  /** Loop count (if loop is true) */
  iterations?: number;

  /** Whether to reverse on alternate iterations */
  alternate?: boolean;

  /** Whether the animation autoplays */
  autoPlay?: boolean;
}

/**
 * Animation orchestrator to coordinate complex animations
 */
export class AnimationOrchestrator {
  private sequences: Map<string, AnimationSequence> = new Map();
  private eventListeners: Map<string, AnimationEventListener[]> = new Map();
  private activeAnimations: Set<string> = new Set();
  private animationTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a new animation sequence
   * @param id Unique identifier for the sequence
   * @param sequence Animation sequence configuration
   * @returns The orchestrator instance for chaining
   */
  createSequence(id: string, sequence: AnimationSequence): AnimationOrchestrator {
    this.sequences.set(id, sequence);

    // Autoplay if specified
    if (sequence.autoPlay) {
      this.play(id);
    }

    return this;
  }

  /**
   * Play an animation sequence
   * @param id Sequence identifier
   * @returns Promise that resolves when sequence completes
   */
  async play(id: string): Promise<void> {
    const sequence = this.sequences.get(id);
    if (!sequence) {
      throw new Error(`Animation sequence "${id}" not found`);
    }

    // Clear any existing timers for this sequence
    this.clearTimers(id);

    // Trigger start event
    this.triggerEvent({
      type: 'start',
      target: id,
      animation: id,
      timestamp: Date.now(),
    });

    // Get motion sensitivity configuration
    const sensitivityConfig = getMotionSensitivity(sequence.sensitivity);

    if (sequence.parallel) {
      // Run all animations in parallel
      const promises = sequence.targets.map(target =>
        this.animateTarget(target, id, sensitivityConfig.level)
      );
      await Promise.all(promises);
    } else {
      // Run animations sequentially
      for (const target of sequence.targets) {
        await this.animateTarget(target, id, sensitivityConfig.level);
      }
    }

    // Trigger complete event
    this.triggerEvent({
      type: 'complete',
      target: id,
      animation: id,
      timestamp: Date.now(),
    });

    // Handle looping
    if (sequence.loop) {
      if (sequence.iterations === undefined || sequence.iterations > 0) {
        // Update iterations count if specified
        if (sequence.iterations !== undefined) {
          this.sequences.set(id, {
            ...sequence,
            iterations: sequence.iterations - 1,
          });
        }

        // For alternating animations, reverse the targets order
        if (sequence.alternate) {
          this.sequences.set(id, {
            ...sequence,
            targets: [...sequence.targets].reverse(),
          });
        }

        // Play again
        this.play(id);
      }
    }
  }

  /**
   * Pause an animation sequence
   * @param id Sequence identifier
   */
  pause(id: string): void {
    // Clear timers
    this.clearTimers(id);

    // Trigger pause event
    this.triggerEvent({
      type: 'pause',
      target: id,
      animation: id,
      timestamp: Date.now(),
    });

    // Note: This just stops future animations in the sequence
    // Currently playing CSS animations will continue - would need JS animations for full control
  }

  /**
   * Stop and reset an animation sequence
   * @param id Sequence identifier
   */
  stop(id: string): void {
    // Clear timers
    this.clearTimers(id);

    // Remove from active animations
    this.activeAnimations.delete(id);

    // Trigger cancel event
    this.triggerEvent({
      type: 'cancel',
      target: id,
      animation: id,
      timestamp: Date.now(),
    });

    // Note: Would need to reset DOM elements to initial state for complete reset
  }

  /**
   * Add an event listener
   * @param type Event type
   * @param listener Event listener function
   */
  addEventListener(type: AnimationEventType, listener: AnimationEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }

    this.eventListeners.get(type)?.push(listener);
  }

  /**
   * Remove an event listener
   * @param type Event type
   * @param listener Event listener function to remove
   */
  removeEventListener(type: AnimationEventType, listener: AnimationEventListener): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      this.eventListeners.set(
        type,
        listeners.filter(l => l !== listener)
      );
    }
  }

  /**
   * Get all registered sequences
   * @returns Map of sequence IDs to configurations
   */
  getSequences(): Map<string, AnimationSequence> {
    return new Map(this.sequences);
  }

  /**
   * Clear all animation sequences
   */
  clear(): void {
    // Stop all active animations
    for (const id of this.activeAnimations) {
      this.stop(id);
    }

    // Clear all sequences
    this.sequences.clear();
    this.activeAnimations.clear();
  }

  /**
   * Clear timers for a sequence
   * @param id Sequence identifier
   */
  private clearTimers(id: string): void {
    // Clear all timers with this sequence ID prefix
    for (const [timerId, timer] of this.animationTimers.entries()) {
      if (timerId.startsWith(`${id}:`)) {
        clearTimeout(timer);
        this.animationTimers.delete(timerId);
      }
    }
  }

  /**
   * Animate a specific target
   * @param target Animation target configuration
   * @param sequenceId Parent sequence identifier
   * @param sensitivity Motion sensitivity level
   * @returns Promise that resolves when animation completes
   */
  private animateTarget(
    target: AnimationTarget,
    sequenceId: string,
    sensitivity: MotionSensitivityLevel
  ): Promise<void> {
    return new Promise<void>(resolve => {
      // Create timer for the animation
      const timerId = `${sequenceId}:${
        typeof target.target === 'string' ? target.target : 'element'
      }`;

      // Calculate animation duration in ms
      let durationMs = 300; // Default

      if (target.animation.duration) {
        if (typeof target.animation.duration === 'string') {
          // Parse from CSS time value (e.g., "0.3s" or "300ms")
          if (target.animation.duration.endsWith('ms')) {
            durationMs = parseInt(target.animation.duration, 10);
          } else if (target.animation.duration.endsWith('s')) {
            durationMs = parseFloat(target.animation.duration) * 1000;
          }
        } else {
          durationMs = target.animation.duration as number;
        }
      }

      // Override with target-specific duration if provided
      if (target.duration) {
        if (typeof target.duration === 'string') {
          if (target.duration.endsWith('ms')) {
            durationMs = parseInt(target.duration, 10);
          } else if (target.duration.endsWith('s')) {
            durationMs = parseFloat(target.duration) * 1000;
          }
        } else {
          durationMs = target.duration as number;
        }
      }

      // Get delay in ms
      const delayMs = target.delay || 0;

      // Set timer for this animation
      const timer = setTimeout(() => {
        // Add to active animations
        this.activeAnimations.add(timerId);

        // Get appropriate animation based on sensitivity
        const mappedAnimation = animationMapper.getAccessibleAnimation(target.animation, {
          sensitivity,
          duration: durationMs,
        });

        // Trigger start event for this target
        this.triggerEvent({
          type: 'start',
          target: typeof target.target === 'string' ? target.target : 'element',
          animation: target.animation.keyframes.name,
          timestamp: Date.now(),
        });

        // Apply animation to DOM element
        this.applyAnimation(target, mappedAnimation.animation);

        // Set completion timer
        const completionTimer = setTimeout(() => {
          // Remove from active animations
          this.activeAnimations.delete(timerId);

          // Trigger complete event for this target
          this.triggerEvent({
            type: 'complete',
            target: typeof target.target === 'string' ? target.target : 'element',
            animation: target.animation.keyframes.name,
            timestamp: Date.now(),
          });

          // Resolve promise
          resolve();
        }, durationMs);

        // Store completion timer
        this.animationTimers.set(`${timerId}:completion`, completionTimer);
      }, delayMs);

      // Store the timer
      this.animationTimers.set(timerId, timer);
    });
  }

  /**
   * Apply animation to target element
   * @param target Animation target
   * @param animation Animation to apply
   */
  private applyAnimation(
    target: AnimationTarget,
    animation: AnimationPreset | Keyframes | string | null
  ): void {
    if (!animation) return;

    // Get the target element
    let element: HTMLElement | null = null;

    if (typeof target.target === 'string') {
      element = document.querySelector(target.target);
    } else if (target.target instanceof HTMLElement) {
      element = target.target;
    }

    if (!element) {
      console.warn(`Target element not found: ${target.target}`);
      return;
    }

    // Get animation CSS
    let animationCSS = '';

    if (typeof animation === 'string') {
      animationCSS = `
        animation-name: ${animation};
        animation-duration: ${target.duration || '0.3s'};
        animation-timing-function: ${target.animation.easing || 'ease'};
        animation-fill-mode: ${target.animation.fillMode || 'both'};
      `;
    } else if ('keyframes' in animation) {
      animationCSS = `
        animation-name: ${animation.keyframes.name};
        animation-duration: ${target.duration || animation.duration || '0.3s'};
        animation-timing-function: ${animation.easing || 'ease'};
        animation-fill-mode: ${animation.fillMode || 'both'};
      `;
    } else {
      // Get animation name with fallbacks
      let animationName = '';
      if ('name' in animation) {
        animationName = animation.name;
      } else if ('keyframes' in animation && animation.keyframes) {
        animationName = animation.keyframes.name;
      } else if ('animation' in animation && animation.animation) {
        animationName = animation.animation.name;
      } else {
        animationName = `animation-${Math.random().toString(36).substring(2, 9)}`;
      }

      animationCSS = `
        animation-name: ${animationName};
        animation-duration: ${target.duration || '0.3s'};
        animation-timing-function: ease;
        animation-fill-mode: both;
      `;
    }

    // Apply animation CSS to element
    element.style.cssText += animationCSS;
  }

  /**
   * Trigger an animation event
   * @param event Event data
   */
  private triggerEvent(event: {
    type: AnimationEventType;
    target: string;
    animation: string;
    timestamp: number;
  }): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }
}

// Create and export a singleton instance
export const animationOrchestrator = new AnimationOrchestrator();

/**
 * Higher-order component that applies orchestrated animations
 * @param Component Component to wrap
 * @param sequenceConfig Animation sequence configuration
 * @returns Enhanced component with animations
 */
export const withOrchestration = <P extends object>(
  Component: ComponentType<P>,
  sequenceConfig: AnimationSequence
): FC<P> => {
  return (props: P) => {
    // Create a unique ID for this sequence based on component name
    const sequenceId = `${Component.displayName || 'Component'}-${Date.now()}`;

    // Create the sequence when component mounts
    useEffect(() => {
      animationOrchestrator.createSequence(sequenceId, sequenceConfig);

      return () => {
        // Clean up when component unmounts
        animationOrchestrator.stop(sequenceId);
      };
    }, []);

    // Render the wrapped component
    return createElement(Component, props);
  };
};
