/**
 * Animation Accessibility Utilities
 * 
 * Utilities to help make animations more accessible, focusing on ARIA attributes 
 * and accessibility best practices.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { FlattenSimpleInterpolation } from 'styled-components';

import { AnimationCategory } from './MotionSensitivity';
import { MotionIntensityLevel } from './MotionIntensityProfiler';

/**
 * ARIA live region announcement types
 */
export enum AnnouncementType {
  /** No announcement for this animation */
  NONE = 'none',
  
  /** Polite announcement (screen reader will finish current task first) */
  POLITE = 'polite',
  
  /** Assertive announcement (screen reader will interrupt current task) */
  ASSERTIVE = 'assertive',
}

/**
 * Animation announcement settings
 */
export interface AnimationAnnouncementSettings {
  /** Whether to announce animation to screen readers */
  announce: boolean;
  
  /** Announcement type (polite or assertive) */
  type: AnnouncementType;
  
  /** Text to announce (if not provided, will use description) */
  text?: string;
  
  /** Description of the animation for screen readers */
  description: string;
  
  /** Whether to announce only on first animation */
  announceOnlyOnce?: boolean;
}

/**
 * Default animation ARIA attributes based on animation category
 */
export const DEFAULT_ANIMATION_ARIA_ATTRIBUTES: Record<AnimationCategory, {
  /** Animation description for screen readers */
  description: string;
  
  /** Whether this animation should be announced by default */
  announce: boolean;
  
  /** Default announcement type */
  announcementType: AnnouncementType;
  
  /** Default role for animated element if not already specified */
  role?: string;
  
  /** Default aria-live value */
  ariaLive?: 'polite' | 'assertive' | 'off';
  
  /** Whether to include aria-busy while animating */
  ariaBusy?: boolean;
}> = {
  [AnimationCategory.ENTRANCE]: {
    description: 'Content appearing',
    announce: false,
    announcementType: AnnouncementType.NONE,
    ariaLive: 'polite',
  },
  
  [AnimationCategory.EXIT]: {
    description: 'Content disappearing',
    announce: false,
    announcementType: AnnouncementType.NONE,
  },
  
  [AnimationCategory.HOVER]: {
    description: 'Hover effect',
    announce: false,
    announcementType: AnnouncementType.NONE,
  },
  
  [AnimationCategory.FOCUS]: {
    description: 'Focus effect',
    announce: false,
    announcementType: AnnouncementType.NONE,
  },
  
  [AnimationCategory.ACTIVE]: {
    description: 'Activation effect',
    announce: false,
    announcementType: AnnouncementType.NONE,
  },
  
  [AnimationCategory.LOADING]: {
    description: 'Loading content',
    announce: true,
    announcementType: AnnouncementType.POLITE,
    ariaLive: 'polite',
    ariaBusy: true,
  },
  
  [AnimationCategory.BACKGROUND]: {
    description: 'Background animation',
    announce: false,
    announcementType: AnnouncementType.NONE,
  },
  
  [AnimationCategory.SCROLL]: {
    description: 'Scroll animation',
    announce: false,
    announcementType: AnnouncementType.NONE,
  },
  
  [AnimationCategory.ATTENTION]: {
    description: 'Attention-grabbing animation',
    announce: true,
    announcementType: AnnouncementType.POLITE,
    ariaLive: 'polite',
  },
  
  [AnimationCategory.ESSENTIAL]: {
    description: 'Essential animation',
    announce: false,
    announcementType: AnnouncementType.NONE,
  },
};

/**
 * Generate ARIA attributes for animated elements
 * 
 * @param category Animation category
 * @param options Additional options
 * @returns ARIA attributes object
 */
export const getAnimationAriaAttributes = (
  category: AnimationCategory,
  options?: {
    /** Whether the animation is currently active */
    isAnimating?: boolean;
    
    /** Custom description */
    description?: string;
    
    /** Whether to announce the animation */
    announce?: boolean;
    
    /** Announcement type */
    announcementType?: AnnouncementType;
    
    /** Element has interactive role */
    isInteractive?: boolean;
  }
): Record<string, string | boolean> => {
  const defaultAttrs = DEFAULT_ANIMATION_ARIA_ATTRIBUTES[category];
  const isAnimating = options?.isAnimating ?? false;
  const attrs: Record<string, string | boolean> = {};
  
  // Add description
  if (options?.description || defaultAttrs.description) {
    attrs['aria-description'] = options?.description || defaultAttrs.description;
  }
  
  // Add busy state for loading animations
  if (defaultAttrs.ariaBusy && isAnimating) {
    attrs['aria-busy'] = true;
  }
  
  // Add live region attributes if animation should be announced
  const shouldAnnounce = options?.announce ?? defaultAttrs.announce;
  if (shouldAnnounce) {
    const announcementType = options?.announcementType ?? defaultAttrs.announcementType;
    
    if (announcementType !== AnnouncementType.NONE) {
      attrs['aria-live'] = announcementType === AnnouncementType.ASSERTIVE ? 'assertive' : 'polite';
    }
  }
  
  // Add role if needed and not an interactive element
  if (defaultAttrs.role && !options?.isInteractive) {
    attrs['role'] = defaultAttrs.role;
  }
  
  return attrs;
};

/**
 * Animation announcement component props
 */
export interface AnimationAnnouncerProps {
  /** ID for the animation */
  id: string;
  
  /** Whether the animation is currently playing */
  isAnimating: boolean;
  
  /** Animation category */
  category: AnimationCategory;
  
  /** Announcement settings */
  settings?: Partial<AnimationAnnouncementSettings>;
  
  /** Motion intensity level */
  intensityLevel?: MotionIntensityLevel;
}

/**
 * Component that announces animations to screen readers
 */
export const AnimationAnnouncer: React.FC<AnimationAnnouncerProps> = ({
  id,
  isAnimating,
  category,
  settings = {},
  intensityLevel = MotionIntensityLevel.MODERATE,
}) => {
  // Track whether we've already announced this animation
  const hasAnnouncedRef = useRef(false);
  
  // Get default announcement settings for this category
  const defaultSettings = DEFAULT_ANIMATION_ARIA_ATTRIBUTES[category];
  
  // Merge with provided settings
  const announcementSettings: AnimationAnnouncementSettings = {
    announce: settings.announce ?? defaultSettings.announce,
    type: settings.type ?? defaultSettings.announcementType,
    description: settings.description ?? defaultSettings.description,
    text: settings.text,
    announceOnlyOnce: settings.announceOnlyOnce ?? true,
  };
  
  // Only announce if needed
  if (!announcementSettings.announce || 
      announcementSettings.type === AnnouncementType.NONE ||
      (announcementSettings.announceOnlyOnce && hasAnnouncedRef.current)) {
    return null;
  }
  
  // Determine text to announce
  const announceText = announcementSettings.text || announcementSettings.description;
  
  // Set live region attributes based on announcement type
  const liveRegionProps = {
    'aria-live': announcementSettings.type === AnnouncementType.ASSERTIVE ? 'assertive' : 'polite',
    role: 'status',
    'aria-atomic': 'true',
  };
  
  // Update announced state when animation starts
  useEffect(() => {
    if (isAnimating && !hasAnnouncedRef.current) {
      hasAnnouncedRef.current = true;
    }
  }, [isAnimating]);
  
  // Only render when animation is active
  return isAnimating ? (
    <div 
      id={`animation-announcer-${id}`}
      {...liveRegionProps}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {announceText}
    </div>
  ) : null;
};

/**
 * Hook to provide ARIA attributes for animated elements
 * 
 * @param category Animation category
 * @param options Optional settings
 * @returns ARIA attributes and AnimationAnnouncer component
 */
export const useAnimationAccessibility = (
  category: AnimationCategory,
  options?: {
    /** Unique ID for this animation */
    id?: string;
    
    /** Whether the animation is currently active */
    isAnimating?: boolean;
    
    /** Custom description */
    description?: string;
    
    /** Whether to announce the animation */
    announce?: boolean;
    
    /** Announcement type */
    announcementType?: AnnouncementType;
    
    /** Element has interactive role */
    isInteractive?: boolean;
    
    /** Animation intensity level */
    intensityLevel?: MotionIntensityLevel;
  }
) => {
  // Generate unique ID if not provided
  const idRef = useRef<string>(options?.id || `animation-${Math.random().toString(36).substring(2, 9)}`);
  const id = idRef.current;
  
  // Track animation state
  const [isAnimating, setIsAnimating] = React.useState(options?.isAnimating || false);
  
  // Get ARIA attributes
  const ariaAttributes = getAnimationAriaAttributes(category, {
    ...options,
    isAnimating,
  });
  
  // Function to start animation
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);
  
  // Function to end animation
  const endAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);
  
  // Create announcer component
  const Announcer = () => (
    <AnimationAnnouncer
      id={id}
      isAnimating={isAnimating}
      category={category}
      settings={{
        description: options?.description,
        announce: options?.announce,
        type: options?.announcementType,
      }}
      intensityLevel={options?.intensityLevel}
    />
  );
  
  return {
    ariaAttributes,
    isAnimating,
    startAnimation,
    endAnimation,
    Announcer,
  };
};

/**
 * Higher-order component that adds accessibility features to animated components
 * 
 * @param WrappedComponent Component to wrap
 * @param category Animation category
 * @param options Accessibility options
 * @returns Wrapped component with accessibility features
 */
export function withAnimationAccessibility<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  category: AnimationCategory,
  options?: {
    /** Custom description */
    description?: string;
    
    /** Whether to announce the animation */
    announce?: boolean;
    
    /** Announcement type */
    announcementType?: AnnouncementType;
    
    /** Element has interactive role */
    isInteractive?: boolean;
  }
) {
  return (props: P & { className?: string }) => {
    // Get accessibility hooks
    const {
      ariaAttributes,
      isAnimating,
      startAnimation,
      endAnimation,
      Announcer,
    } = useAnimationAccessibility(category, options);
    
    // Track animation with event listeners on the component
    useEffect(() => {
      const onAnimationStart = () => startAnimation();
      const onAnimationEnd = () => endAnimation();
      
      // When component mounts, find the DOM element and attach listeners
      const element = document.querySelector(`.${props.className}`);
      if (element) {
        element.addEventListener('animationstart', onAnimationStart);
        element.addEventListener('animationend', onAnimationEnd);
        
        return () => {
          element.removeEventListener('animationstart', onAnimationStart);
          element.removeEventListener('animationend', onAnimationEnd);
        };
      }
    }, [props.className, startAnimation, endAnimation]);
    
    // Render wrapped component with accessibility attributes
    return (
      <>
        <WrappedComponent
          {...props}
          {...ariaAttributes}
        />
        <Announcer />
      </>
    );
  };
}

/**
 * Add ARIA attributes to CSS animation
 * 
 * This function doesn't directly modify CSS, but provides
 * attributes to be applied to the element using the animation
 * 
 * @param animation Original CSS animation
 * @param category Animation category
 * @param options Optional settings
 * @returns Original animation and ARIA attributes to apply
 */
export const makeAnimationAccessible = (
  animation: FlattenSimpleInterpolation,
  category: AnimationCategory,
  options?: {
    /** Custom description */
    description?: string;
    
    /** Whether to announce the animation */
    announce?: boolean;
    
    /** Announcement type */
    announcementType?: AnnouncementType;
  }
): {
  animation: FlattenSimpleInterpolation;
  ariaAttributes: Record<string, string | boolean>;
} => {
  // Get ARIA attributes for this animation category
  const ariaAttributes = getAnimationAriaAttributes(category, options);
  
  // Return original animation and attributes to apply
  return {
    animation,
    ariaAttributes,
  };
};