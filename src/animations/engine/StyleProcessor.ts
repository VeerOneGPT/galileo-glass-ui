/**
 * Style Processor
 * 
 * Manages batched style updates to minimize DOM reflows and improve performance.
 * Provides a clean abstraction over style manipulation with different backends.
 */

import { isFeatureEnabled } from '../../utils/featureFlags';
import timingProvider from './TimingProvider';

/**
 * Style update operation
 */
export interface StyleUpdate {
  /**
   * Target element or selector
   */
  target: HTMLElement | string;
  
  /**
   * CSS property to update
   */
  property: string;
  
  /**
   * New value for the property
   */
  value: string;
  
  /**
   * CSS priority, e.g. 'important'
   */
  priority?: string;
}

/**
 * Style removal operation
 */
export interface StyleRemoval {
  /**
   * Target element or selector
   */
  target: HTMLElement | string;
  
  /**
   * CSS property to remove
   */
  property: string;
}

/**
 * Style processor interface
 */
export interface StyleProcessor {
  /**
   * Apply a style update
   */
  applyStyle: (update: StyleUpdate) => void;
  
  /**
   * Remove a style
   */
  removeStyle: (removal: StyleRemoval) => void;
  
  /**
   * Process all pending style operations immediately
   */
  flushStyles: () => void;
  
  /**
   * Schedule style processing for the next animation frame
   */
  scheduleStyleProcessing: () => void;
}

/**
 * Queue-based style processor implementation
 * 
 * Queues style updates and processes them in batches to minimize DOM reflows.
 */
export class QueuedStyleProcessor implements StyleProcessor {
  /**
   * Queue of pending style updates
   */
  private updateQueue: StyleUpdate[] = [];
  
  /**
   * Queue of pending style removals
   */
  private removalQueue: StyleRemoval[] = [];
  
  /**
   * Whether a style processing operation is scheduled
   */
  private isProcessingScheduled = false;
  
  /**
   * Animation frame request ID for scheduled processing
   */
  private processingFrameId?: number;
  
  /**
   * Apply a style update
   */
  applyStyle(update: StyleUpdate): void {
    this.updateQueue.push(update);
    this.scheduleStyleProcessing();
  }
  
  /**
   * Remove a style
   */
  removeStyle(removal: StyleRemoval): void {
    this.removalQueue.push(removal);
    this.scheduleStyleProcessing();
  }
  
  /**
   * Process all pending style operations immediately
   */
  flushStyles(): void {
    if (this.processingFrameId) {
      timingProvider.cancelAnimationFrame(this.processingFrameId);
      this.processingFrameId = undefined;
    }
    
    this.processStyles();
  }
  
  /**
   * Schedule style processing for the next animation frame
   */
  scheduleStyleProcessing(): void {
    if (this.isProcessingScheduled) {
      return;
    }
    
    this.isProcessingScheduled = true;
    this.processingFrameId = timingProvider.requestAnimationFrame(() => {
      this.processStyles();
    });
  }
  
  /**
   * Process pending style operations
   */
  private processStyles(): void {
    this.isProcessingScheduled = false;
    this.processingFrameId = undefined;
    
    // Process style removals first
    this.processStyleRemovals();
    
    // Then process style updates
    this.processStyleUpdates();
  }
  
  /**
   * Process pending style removals
   */
  private processStyleRemovals(): void {
    const removalQueue = [...this.removalQueue];
    this.removalQueue = [];
    
    removalQueue.forEach(removal => {
      if (typeof removal.target === 'string') {
        // Query selector and apply to all matching elements
        const elements = document.querySelectorAll(removal.target);
        elements.forEach(element => {
          (element as HTMLElement).style.removeProperty(removal.property);
        });
      } else {
        // Apply directly to the element
        removal.target.style.removeProperty(removal.property);
      }
    });
  }
  
  /**
   * Process pending style updates
   */
  private processStyleUpdates(): void {
    const updateQueue = [...this.updateQueue];
    this.updateQueue = [];
    
    updateQueue.forEach(update => {
      if (typeof update.target === 'string') {
        // Query selector and apply to all matching elements
        const elements = document.querySelectorAll(update.target);
        elements.forEach(element => {
          (element as HTMLElement).style.setProperty(
            update.property,
            update.value,
            update.priority
          );
        });
      } else {
        // Apply directly to the element
        update.target.style.setProperty(
          update.property,
          update.value,
          update.priority
        );
      }
    });
  }
}

/**
 * Direct style processor implementation
 * 
 * Applies style updates immediately without batching.
 */
export class DirectStyleProcessor implements StyleProcessor {
  /**
   * Apply a style update immediately
   */
  applyStyle(update: StyleUpdate): void {
    if (typeof update.target === 'string') {
      // Query selector and apply to all matching elements
      const elements = document.querySelectorAll(update.target);
      elements.forEach(element => {
        (element as HTMLElement).style.setProperty(
          update.property,
          update.value,
          update.priority
        );
      });
    } else {
      // Apply directly to the element
      update.target.style.setProperty(
        update.property,
        update.value,
        update.priority
      );
    }
  }
  
  /**
   * Remove a style immediately
   */
  removeStyle(removal: StyleRemoval): void {
    if (typeof removal.target === 'string') {
      // Query selector and apply to all matching elements
      const elements = document.querySelectorAll(removal.target);
      elements.forEach(element => {
        (element as HTMLElement).style.removeProperty(removal.property);
      });
    } else {
      // Apply directly to the element
      removal.target.style.removeProperty(removal.property);
    }
  }
  
  /**
   * No-op since styles are applied immediately
   */
  flushStyles(): void {
    // No-op
  }
  
  /**
   * No-op since styles are applied immediately
   */
  scheduleStyleProcessing(): void {
    // No-op
  }
}

/**
 * Global default style processor instance
 */
const defaultStyleProcessor = new QueuedStyleProcessor();

/**
 * Get the active style processor
 * 
 * This will use the new queued style processor if the feature flag is enabled,
 * otherwise it will use the direct style processor.
 */
export function getStyleProcessor(): StyleProcessor {
  return isFeatureEnabled('ANIMATION_STYLE_ADAPTER')
    ? defaultStyleProcessor
    : new DirectStyleProcessor();
}

export default getStyleProcessor(); 