/**
 * useTabAnimations Hook
 * 
 * Handles animations for tab bar, including spring, magnetic, and inertial animations
 */
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useGestureAnimation } from '../../../hooks/useGestureAnimation';
import { GestureAnimationPreset } from '../../../animations/physics/gestures/GestureAnimation';
import { GestureType } from '../../../animations/physics/gestures/GestureDetector';
import { useAccessibilitySettings } from '../../../hooks/useAccessibilitySettings';
import { MagneticSelectionConfig, TabMagneticData, SpringRef, ScrollPosition } from '../types';
import { AnimationProps } from '../../../types/animation';
import { SpringConfig, SpringPresets } from '../../../animations/physics/springPhysics';
import { PhysicsConfig } from '../../../animations/physics/galileoPhysicsSystem';
import { useAnimationContext } from '../../../contexts/AnimationContext';

// Helper function to resolve spring config
const resolveSpringConfig = (
  config: SpringConfig | keyof typeof SpringPresets | undefined,
  presets: typeof SpringPresets,
  fallback: SpringConfig
): SpringConfig => {
  if (typeof config === 'string' && config in presets) {
    return presets[config as keyof typeof SpringPresets];
  }
  if (typeof config === 'object' && config !== null) {
    return { ...fallback, ...config }; // Merge with fallback
  }
  return fallback;
};

interface UseTabAnimationsProps {
  activeTab: number;
  tabs: any[];
  animationStyle?: 'spring' | 'magnetic' | 'inertial' | 'none';
  animationConfig?: SpringConfig | PhysicsConfig;
  disableAnimation?: boolean;
  orientation: 'horizontal' | 'vertical';
  variant: string;
  tabRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  tabsRef: React.RefObject<HTMLDivElement>;
  color: string;
  selectorStyle: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
}

interface AnimationResult {
  springProps: SpringRef;
  transform: {
    translateX: number;
    translateY: number;
  };
  tabMagneticData: TabMagneticData;
  magneticAnimationRef: React.MutableRefObject<{
    animationActive: boolean;
    rafId: number | null;
    startTime: number;
  }>;
  setSpringProps: (newProps: any) => void;
  updateSelectorPosition: () => void;
  magneticSelector: (e: React.MouseEvent) => void;
  applyMagneticEffect: (mouseX: number, mouseY: number) => void;
  animateTo: (params: { translateX?: number; translateY?: number }) => void;
  magneticSelectionConfig: MagneticSelectionConfig;
  usePhysicsAnimation: boolean;
}

/**
 * Hook for handling tab animations including spring, magnetic and inertial animations
 */
export default function useTabAnimations({
  activeTab,
  tabs,
  animationStyle = 'spring',
  animationConfig,
  disableAnimation,
  orientation,
  variant,
  tabRefs,
  tabsRef,
  color,
  selectorStyle
}: UseTabAnimationsProps): AnimationResult {
  const { isReducedMotion } = useAccessibilitySettings();
  const { defaultSpring: contextDefaultSpring } = useAnimationContext();
  
  // Determine final spring config by merging: prop > context > default preset
  const springPhysicsConfig = useMemo<SpringConfig>(() => {
    const baseFallback: SpringConfig = SpringPresets.DEFAULT; // Use DEFAULT as base

    // --- Temporary fix for context preset mismatch --- 
    // Map potentially undefined context presets to known SpringPresets keys or undefined
    let mappedContextConfigKey: keyof typeof SpringPresets | undefined;
    if (typeof contextDefaultSpring === 'string') {
        // Check if context string is a valid key in SpringPresets
        if (Object.keys(SpringPresets).includes(contextDefaultSpring)) {
            mappedContextConfigKey = contextDefaultSpring as keyof typeof SpringPresets;
        } 
        // else: If it's HOVER_QUICK/MODAL_TRANSITION etc. not in SpringPresets, 
        // mappedContextConfigKey remains undefined, causing resolveSpringConfig to use baseFallback.
        // TODO: Align AnimationContextState presets with SpringPresets definition later.
    } else if (typeof contextDefaultSpring === 'object'){
        // If context gives an object, we pass it directly later
        mappedContextConfigKey = undefined; // Ensure we don't try to resolve a non-string
    } else {
        mappedContextConfigKey = undefined;
    }
    // --- End temporary fix --- 

    // Resolve context config (object or resolved preset)
    const contextConfigObj = typeof contextDefaultSpring === 'object' ? contextDefaultSpring : undefined;
    const resolvedContextConfig = resolveSpringConfig(mappedContextConfigKey, SpringPresets, baseFallback);
    const finalContextConfig = { ...resolvedContextConfig, ...(contextConfigObj ?? {}) };

    // Resolve prop config (overrides context)
    const propConfig = resolveSpringConfig(
      animationConfig as SpringConfig | keyof typeof SpringPresets | undefined, 
      SpringPresets, 
      finalContextConfig // Use resolved context config as the fallback for prop resolution
    ); 
    
    return propConfig; // Final resolved config object
  }, [animationConfig, contextDefaultSpring]);
  
  // Determine if we should use physics animations
  const usePhysicsAnimation = animationStyle !== 'none' && !isReducedMotion && !disableAnimation;
  
  // Set up spring animation for selector
  const springRef = useRef<SpringRef>({ 
    width: selectorStyle.width,
    height: selectorStyle.height,
    left: selectorStyle.left,
    top: selectorStyle.top,
  });
  
  const setSpringProps = (newProps: any) => {
    springRef.current = {
      ...springRef.current,
      ...newProps
    };
  };
  
  // Tab data for magnetic attraction system
  const [tabMagneticData, setTabMagneticData] = useState<TabMagneticData>({
    isHoveringTab: false,
    closestTabIndex: null,
    magneticForce: 0,
    selectionProgress: 0,
    lastInteractionTime: 0
  });
  
  // Track magnetic tab selection animation
  const magneticAnimationRef = useRef<{
    animationActive: boolean;
    rafId: number | null;
    startTime: number;
  }>({
    animationActive: false,
    rafId: null,
    startTime: 0
  });
  
  // Configure gesture animation based on animation style
  const gestureConfig = useMemo(() => {
    let preset = GestureAnimationPreset.SPRING_BOUNCE;
    if (animationStyle === 'magnetic') {
      preset = GestureAnimationPreset.MAGNETIC_SNAP;
    } else if (animationStyle === 'inertial') {
      preset = GestureAnimationPreset.INERTIAL_SLIDE;
    }
    
    // Ensure springPhysicsConfig is resolved before accessing properties
    const resolvedConfig = springPhysicsConfig; // Already resolved by the previous useMemo

    return {
      preset,
      gestures: [GestureType.PAN],
      tension: resolvedConfig.tension, // Safe to access
      friction: resolvedConfig.friction, // Safe to access
      mass: resolvedConfig.mass, // Safe to access
      velocityScale: animationStyle === 'inertial' ? 1.2 : 1,
      boundaries: variant === 'underlined' ? {
        ...(orientation === 'horizontal' ? { y: { min: selectorStyle.top, max: selectorStyle.top } } : { x: { min: selectorStyle.left, max: selectorStyle.left } })
      } : undefined
    };
  }, [animationStyle, springPhysicsConfig, variant, orientation, selectorStyle]);
  
  // Set up gesture animation hook
  const { transform, animateTo } = useGestureAnimation({
    ref: useRef(null), // This is a placeholder, we'll manually control animation
    enabled: usePhysicsAnimation,
    respectReducedMotion: true,
    ...gestureConfig
  });
  
  // Set up magnetic tab selection physics
  const magneticSelectionConfig = useMemo<MagneticSelectionConfig>(() => {
    // Resolve the config first
    const resolvedConfig = springPhysicsConfig;
    return {
      hoverRadius: 150,           
      strongAttractionRadius: 60, 
      activationThreshold: 0.6,    
      baseAttractionForce: 0.05,   
      maxAttractionForce: 0.2,     
      selectionInertia: 0.86,      
      magneticDamping: 0.82,       
      springTension: isReducedMotion ? 350 : resolvedConfig.tension, // Use resolved
      springFriction: isReducedMotion ? 32 : resolvedConfig.friction, // Use resolved
      autoSelectDelay: 600,        
      minHoverTime: 120,           
      ...(variant === 'pills' ? { hoverRadius: 180, baseAttractionForce: 0.06} : {}),
      ...(variant === 'underlined' ? { hoverRadius: 140, baseAttractionForce: 0.03} : {})
    };
  }, [isReducedMotion, variant, springPhysicsConfig]); // springPhysicsConfig is already resolved
  
  // Update selector position based on active tab
  const updateSelectorPosition = useCallback(() => {
    if (!tabsRef.current || activeTab < 0 || activeTab >= tabs.length) return;
    
    const activeTabElement = tabRefs.current[activeTab];
    if (!activeTabElement) return;
    
    const tabRect = activeTabElement.getBoundingClientRect();
    const containerRect = tabsRef.current.getBoundingClientRect();
    
    const newStyle = {
      width: tabRect.width,
      height: tabRect.height,
      left: activeTabElement.offsetLeft,
      top: activeTabElement.offsetTop,
    };
    
    // Adjust for underlined variant
    if (variant === 'underlined') {
      if (orientation === 'horizontal') {
        newStyle.height = 2;
        newStyle.top = containerRect.height - 2;
      } else {
        newStyle.width = 2;
        newStyle.left = containerRect.width - 2;
      }
    }
    
    if (usePhysicsAnimation) {
        const baseResolvedConfig = springPhysicsConfig;
        let finalConfig: SpringConfig;

        if (animationStyle === 'magnetic') {
            finalConfig = {
                tension: baseResolvedConfig.tension + 20,
                friction: baseResolvedConfig.friction - 11,
                mass: baseResolvedConfig.mass,
            };
        } else if (animationStyle === 'inertial') {
            finalConfig = {
                tension: baseResolvedConfig.tension - 160,
                friction: baseResolvedConfig.friction - 12,
                mass: baseResolvedConfig.mass,
            };
        } else {
            finalConfig = baseResolvedConfig;
        }

        setSpringProps({
            width: newStyle.width,
            height: newStyle.height,
            left: newStyle.left,
            top: newStyle.top,
            config: finalConfig 
        });

        // Also update the gesture animation if available
        animateTo({
            translateX: newStyle.left,
            translateY: newStyle.top
        });
    }
  }, [
    activeTab, 
    tabs.length, 
    orientation, 
    variant, 
    usePhysicsAnimation, 
    animationStyle, 
    springPhysicsConfig, // Dependency on resolved config
    animateTo,
    tabRefs,
    tabsRef,
    selectorStyle,
    setSpringProps
  ]);
  
  // Magnetic effect for the tab selector
  const magneticSelector = useCallback((e: React.MouseEvent) => {
    if (!usePhysicsAnimation || !tabsRef.current) return;
    
    const now = Date.now();
    const containerRect = tabsRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;
    
    // Find closest tab to cursor and check if we're hovering any tab
    let closestTabIndex = null;
    let closestDistance = Infinity;
    let isHoveringAnyTab = false;
    
    // Track whether we should update the tab magnetic data
    let shouldUpdateTabMagneticData = false;
    
    // Process all tabs to find the closest one
    tabRefs.current.forEach((tabRef, index) => {
      if (!tabRef) return;
      
      const tabRect = tabRef.getBoundingClientRect();
      const tabCenterX = tabRect.left + tabRect.width / 2 - containerRect.left;
      const tabCenterY = tabRect.top + tabRect.height / 2 - containerRect.top;
      
      // Calculate distance to tab center
      const distanceToTab = Math.sqrt(
        Math.pow(mouseX - tabCenterX, 2) + 
        Math.pow(mouseY - tabCenterY, 2)
      );
      
      // Check if this is the closest tab
      if (distanceToTab < closestDistance) {
        closestDistance = distanceToTab;
        closestTabIndex = index;
      }
      
      // Check if we're hovering any tab (inside its rectangle with some padding)
      const isInTabBounds = 
        mouseX >= tabRect.left - containerRect.left - 10 && 
        mouseX <= tabRect.left - containerRect.left + tabRect.width + 10 &&
        mouseY >= tabRect.top - containerRect.top - 10 && 
        mouseY <= tabRect.top - containerRect.top + tabRect.height + 10;
        
      if (isInTabBounds) {
        isHoveringAnyTab = true;
      }
    });
    
    // Update tab magnetic data
    if (closestTabIndex !== null && closestDistance < magneticSelectionConfig.hoverRadius) {
      // Set magnetic force based on distance to closest tab
      const normalizedDistance = Math.min(1, closestDistance / magneticSelectionConfig.hoverRadius);
      
      // Calculate inverse distance (closer = stronger)
      const attractionForce = magneticSelectionConfig.baseAttractionForce + 
        (1 - normalizedDistance) * (magneticSelectionConfig.maxAttractionForce - magneticSelectionConfig.baseAttractionForce);
      
      // Calculate selection progress
      // If it's already the active tab, maintain 100% progress
      const selectionProgress = closestTabIndex === activeTab 
        ? 1
        : Math.min(
            1, 
            tabMagneticData.selectionProgress * magneticSelectionConfig.selectionInertia + 
            (closestDistance < magneticSelectionConfig.strongAttractionRadius ? attractionForce * 2 : attractionForce)
          );
      
      // Determine if we should change selected tab
      if (animationStyle === 'magnetic' && 
          tabMagneticData.closestTabIndex === closestTabIndex && 
          closestTabIndex !== activeTab && 
          selectionProgress > magneticSelectionConfig.activationThreshold) {
        
        // Check if we've hovered long enough or reached high enough progress
        const hoverTime = now - tabMagneticData.lastInteractionTime;
        if (hoverTime > magneticSelectionConfig.autoSelectDelay || selectionProgress > 0.9) {
          // Actually select the tab
          const tabElement = tabRefs.current[closestTabIndex];
          if (tabElement && (!tabs[closestTabIndex] || !tabs[closestTabIndex].disabled)) {
            // In the component, this would dispatch a click event
            // Here we'll just flag that we should update the magnetic data
            shouldUpdateTabMagneticData = true;
            setTabMagneticData(prev => ({
              ...prev,
              selectionProgress: 0,
              magneticForce: 0,
              lastInteractionTime: now
            }));
            
            return; // Exit early since we've clicked the tab
          }
        }
      }
      
      // Update magnetic data
      shouldUpdateTabMagneticData = true;
      setTabMagneticData(prev => ({
        isHoveringTab: isHoveringAnyTab,
        closestTabIndex: closestTabIndex,
        magneticForce: prev.magneticForce * magneticSelectionConfig.magneticDamping + attractionForce,
        selectionProgress,
        lastInteractionTime: isHoveringAnyTab && prev.closestTabIndex === closestTabIndex 
          ? prev.lastInteractionTime 
          : now
      }));
    } else {
      // Apply decay to selection progress when not hovering a tab
      if (tabMagneticData.selectionProgress > 0.01) {
        shouldUpdateTabMagneticData = true;
        setTabMagneticData(prev => ({
          ...prev,
          isHoveringTab: isHoveringAnyTab,
          selectionProgress: prev.selectionProgress * 0.92,
          magneticForce: prev.magneticForce * 0.9
        }));
      } else if (tabMagneticData.selectionProgress !== 0) {
        shouldUpdateTabMagneticData = true;
        setTabMagneticData(prev => ({
          ...prev,
          isHoveringTab: isHoveringAnyTab,
          selectionProgress: 0,
          magneticForce: 0
        }));
      }
    }
    
    // Apply magnetic effect to the active tab selector
    if (animationStyle === 'magnetic' && shouldUpdateTabMagneticData) {
      applyMagneticEffect(mouseX, mouseY);
    }
  }, [
    activeTab, 
    animationStyle, 
    usePhysicsAnimation, 
    magneticSelectionConfig,
    tabMagneticData
  ]);
  
  // Apply magnetic effect to the selector
  const applyMagneticEffect = useCallback((mouseX: number, mouseY: number) => {
    if (!tabsRef.current || !usePhysicsAnimation) return;
    
    // If we're not in magnetic animation style, exit early
    if (animationStyle !== 'magnetic') return;
    
    const containerRect = tabsRef.current.getBoundingClientRect();
    
    // Apply magnetic pull to the active tab
    const activeTabElement = tabRefs.current[activeTab];
    if (!activeTabElement) return;
    
    const tabRect = activeTabElement.getBoundingClientRect();
    const tabCenterX = tabRect.left + tabRect.width / 2 - containerRect.left;
    const tabCenterY = tabRect.top + tabRect.height / 2 - containerRect.top;
    
    // Calculate distance to active tab center
    const distanceToTab = Math.sqrt(
      Math.pow(mouseX - tabCenterX, 2) + 
      Math.pow(mouseY - tabCenterY, 2)
    );
    
    // Apply magnetic pull effect to the active tab selector
    if (distanceToTab < magneticSelectionConfig.hoverRadius) {
      // Calculate magnetic pull strength based on distance
      const normalizedDistance = Math.min(1, distanceToTab / magneticSelectionConfig.hoverRadius);
      const pullStrength = Math.pow(1 - normalizedDistance, 2) * 12; 
      
      // Calculate pull vector
      const pullX = (mouseX - tabCenterX) * pullStrength * 0.1;
      const pullY = (mouseY - tabCenterY) * pullStrength * 0.1;
      
      // For underlined variant, constrain movement to the axis
      let constrainedPullX = pullX;
      let constrainedPullY = pullY;
      
      if (variant === 'underlined') {
        if (orientation === 'horizontal') {
          constrainedPullY = 0; // Only allow horizontal movement
        } else {
          constrainedPullX = 0; // Only allow vertical movement
        }
      }
      
      // Use different animation technique based on distance
      if (distanceToTab < magneticSelectionConfig.strongAttractionRadius) {
        // When close, use direct spring adjustment for immediate response
        setSpringProps({
          left: selectorStyle.left + constrainedPullX,
          top: selectorStyle.top + constrainedPullY,
          config: {
            tension: magneticSelectionConfig.springTension + 50,
            friction: magneticSelectionConfig.springFriction - 3,
            mass: springPhysicsConfig.mass
          }
        });
      } else {
        // When further away, use spring physics with more bounce
        setSpringProps({
          left: selectorStyle.left + constrainedPullX * 0.8,
          top: selectorStyle.top + constrainedPullY * 0.8,
          config: {
            tension: magneticSelectionConfig.springTension,
            friction: magneticSelectionConfig.springFriction,
            mass: springPhysicsConfig.mass
          }
        });
      }
      
      // Also update with gesture animation system for additional effects
      animateTo({
        translateX: selectorStyle.left + constrainedPullX * 0.8,
        translateY: selectorStyle.top + constrainedPullY * 0.8
      });
    } else {
      // Reset selector position when outside hover radius
      setSpringProps({
        left: selectorStyle.left,
        top: selectorStyle.top,
        config: {
          tension: magneticSelectionConfig.springTension,
          friction: magneticSelectionConfig.springFriction,
          mass: springPhysicsConfig.mass
        }
      });
    }
    
    // If we have a different closest tab that's not the active tab,
    // apply a slight pull toward that tab to hint at the magnetic selection
    if (tabMagneticData.closestTabIndex !== null && 
        tabMagneticData.closestTabIndex !== activeTab &&
        tabMagneticData.selectionProgress > 0.1) {
      
      const closestTabElement = tabRefs.current[tabMagneticData.closestTabIndex];
      if (!closestTabElement) return;
      
      const closestTabRect = closestTabElement.getBoundingClientRect();
      const attractionX = (closestTabRect.left - tabRect.left) * tabMagneticData.selectionProgress * 0.15;
      const attractionY = (closestTabRect.top - tabRect.top) * tabMagneticData.selectionProgress * 0.15;
      
      // For underlined variant, constrain movement to the axis
      let constrainedAttractionX = attractionX;
      let constrainedAttractionY = attractionY;
      
      if (variant === 'underlined') {
        if (orientation === 'horizontal') {
          constrainedAttractionY = 0;
        } else {
          constrainedAttractionX = 0;
        }
      }
      
      // Apply the pull toward the closest tab
      setSpringProps(prev => ({
        ...prev,
        left: prev.left + constrainedAttractionX,
        top: prev.top + constrainedAttractionY,
      }));
    }
  }, [
    activeTab,
    animationStyle,
    magneticSelectionConfig,
    orientation,
    selectorStyle,
    setSpringProps,
    tabMagneticData,
    usePhysicsAnimation,
    variant,
    animateTo,
    tabRefs,
    tabsRef,
    springPhysicsConfig
  ]);
  
  return {
    springProps: springRef.current,
    transform,
    tabMagneticData,
    magneticAnimationRef,
    setSpringProps,
    updateSelectorPosition,
    magneticSelector,
    applyMagneticEffect,
    animateTo,
    magneticSelectionConfig,
    usePhysicsAnimation
  };
}