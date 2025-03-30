import React, { useState, useEffect, useRef, Children, forwardRef, useMemo, cloneElement, useCallback } from 'react';
import styled from 'styled-components';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn, slideRight } from '../../animations/keyframes/basic';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useMultiSpring } from '../../animations/physics/useMultiSpring';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AnimationProps } from '../../animations/types';
import { MotionSensitivityLevel } from '../../animations/accessibility/MotionSensitivity';
import { usePhysicsInteraction, PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';

export interface TabsProps extends AnimationProps {
  /**
   * The currently selected tab index
   */
  value?: number;

  /**
   * Callback fired when the value changes
   */
  onChange?: (event: React.SyntheticEvent, value: number) => void;

  /**
   * The content of the component - should be Tab components
   */
  children: React.ReactNode;

  /**
   * The variant of the tabs
   */
  variant?: 'standard' | 'fullWidth' | 'scrollable';

  /**
   * The orientation of the tabs
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * The color of the tabs
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

  /**
   * The appearance of the tabs
   */
  appearance?: 'default' | 'glass' | 'elevated' | 'minimal';

  /**
   * The size of the tabs
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Optional spring configuration or preset name for the indicator animation.
   */
  animationConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;

  /**
   * If true, disables all animations.
   */
  disableAnimation?: boolean;
}

export interface TabProps {
  /**
   * The label of the tab
   */
  label: string | React.ReactNode;

  /**
   * If true, the tab will be disabled
   */
  disabled?: boolean;

  /**
   * Icon element shown before the label
   */
  icon?: React.ReactNode;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Callback fired when the tab is clicked
   */
  onClick?: (event: React.MouseEvent) => void;

  /**
   * The content of the tab panel
   */
  children?: React.ReactNode;
}

// Get color by name for theme consistency
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#6366F1';
  }
};

// Styled components
const TabsContainer = styled.div<{
  $orientation: 'horizontal' | 'vertical';
  $appearance: 'default' | 'glass' | 'elevated' | 'minimal';
}>`
  display: flex;
  flex-direction: ${props => (props.$orientation === 'horizontal' ? 'column' : 'row')};
  width: 100%;

  /* Glass appearance styling */
  ${props =>
    props.$appearance === 'glass' &&
    glassSurface({
      elevation: 1,
      blurStrength: 'standard',
      backgroundOpacity: 'subtle',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}),
    })}

  /* Elevated appearance styling */
  ${props =>
    props.$appearance === 'elevated' &&
    `
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  `}
  
  /* Minimal appearance styling */
  ${props =>
    props.$appearance === 'minimal' &&
    `
    background: transparent;
  `}
  
  /* Default appearance styling */
  ${props =>
    props.$appearance === 'default' &&
    `
    background-color: #F9FAFB;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  `}
`;

const TabListContainer = styled.div<{
  $orientation: 'horizontal' | 'vertical';
  $variant: 'standard' | 'fullWidth' | 'scrollable';
}>`
  display: flex;
  flex-direction: ${props => (props.$orientation === 'horizontal' ? 'row' : 'column')};

  ${props =>
    props.$variant === 'fullWidth' &&
    props.$orientation === 'horizontal' &&
    `
    > * {
      flex: 1;
    }
  `}

  ${props =>
    props.$variant === 'scrollable' &&
    props.$orientation === 'horizontal' &&
    `
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  `}
  
  position: relative;
`;

// StyledTab is a button directly
const StyledTab = styled.button<{
  $selected: boolean;
  $disabled: boolean;
  $orientation: 'horizontal' | 'vertical';
  $color: string;
  $size: 'small' | 'medium' | 'large';
  $appearance: 'default' | 'glass' | 'elevated' | 'minimal';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  text-decoration: none;
  outline: 0;
  border: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  transition: color 0.2s ease, background-color 0.2s ease;
  position: relative;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  overflow: hidden;
  will-change: color, background-color, opacity;

  /* Size styles */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          padding: 6px 12px;
          font-size: 0.8125rem;
          min-height: 32px;
        `;
      case 'large':
        return `
          padding: 12px 24px;
          font-size: 0.9375rem;
          min-height: 48px;
        `;
      default: // medium
        return `
          padding: 10px 16px;
          font-size: 0.875rem;
          min-height: 40px;
        `;
    }
  }}

  /* Selected state styling */
  color: ${props => (props.$selected ? getColorByName(props.$color) : 'rgba(0, 0, 0, 0.6)')};

  /* Hover state */
  &:hover {
    ${props =>
      !props.$disabled &&
      !props.$selected &&
      `
      color: rgba(0, 0, 0, 0.87);
      background-color: rgba(0, 0, 0, 0.04);
    `}
  }

  /* Glass appearance styling for selected tab */
  ${props =>
    props.$appearance === 'glass' &&
    props.$selected &&
    glassSurface({
      elevation: 1,
      blurStrength: 'minimal',
      backgroundOpacity: 'subtle',
      borderOpacity: 'medium',
      themeContext: createThemeContext({}),
    })}

  /* Selected tab glow effect */
  ${props =>
    props.$selected &&
    !props.$disabled &&
    glassGlow({
      intensity: 'low',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Orientation-specific styles */
  ${props =>
    props.$orientation === 'vertical' &&
    `
    justify-content: flex-start;
    width: 100%;
  `}
`;

const TabIcon = styled.span`
  display: flex;
  margin-right: 8px;
`;

const TabLabel = styled.span`
  display: flex;
`;

const TabIndicator = styled.span<{
  $color: string;
  $orientation: 'horizontal' | 'vertical';
}>`
  position: absolute;
  background-color: ${props => getColorByName(props.$color)};

  ${props =>
    props.$orientation === 'horizontal'
      ? `bottom: 0; height: 2px;`
      : `left: 0; width: 2px;`
  }

  border-radius: 1px;
  box-shadow: 0 0 4px ${props => getColorByName(props.$color)}80;
  will-change: left, top, width, height;
`;

const TabPanelsContainer = styled.div<{
  $animated: boolean;
}>`
  margin-top: 16px;

  ${props =>
    props.$animated &&
    accessibleAnimation({
      animation: fadeIn,
      duration: 0.3,
      easing: 'ease-out',
    })}
`;

/**
 * TabPanel Component
 *
 * Content associated with a tab
 */
export const TabPanel = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    value: number;
    index: number;
    className?: string;
  }
>((props, ref) => {
  const { children, value, index, className, ...rest } = props;

  return (
    <div
      ref={ref}
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={className}
      {...rest}
    >
      {value === index && children}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

// --- Internal Physics Tab Wrapper --- 
interface PhysicsTabProps extends TabProps, AnimationProps {
  selected: boolean;
  orientation: 'horizontal' | 'vertical';
  color: string;
  size: 'small' | 'medium' | 'large';
  appearance: 'default' | 'glass' | 'elevated' | 'minimal';
  onSelect: (event: React.MouseEvent<HTMLButtonElement>) => void; // Simplified click handler prop
  tabIndexRef: (el: HTMLButtonElement | null) => void;
}

const PhysicsTab = forwardRef<HTMLButtonElement, PhysicsTabProps>((props, ref) => {
  const {
    label,
    icon,
    disabled = false,
    selected,
    orientation,
    color,
    size,
    appearance,
    onClick, // Original onClick from child props
    onSelect, // Mapped onClick from parent Tabs
    animationConfig,
    disableAnimation,
    motionSensitivity,
    className,
    tabIndexRef,
    ...rest // rest should ideally be empty if props are explicit
  } = props;

  const { defaultSpring } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;
  const usePhysics = !finalDisableAnimation && !disabled;

  // Calculate final interaction config (similar to other components)
  const finalInteractionConfig = useMemo<Partial<PhysicsInteractionOptions>>(() => {
    const baseOptions: Partial<PhysicsInteractionOptions> = {
      affectsScale: true,
      scaleAmplitude: 0.03, 
    };
    let contextConf: Partial<SpringConfig> = {};
    if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
      contextConf = SpringPresets[defaultSpring as keyof typeof SpringPresets];
    } else if (typeof defaultSpring === 'object') {
      contextConf = defaultSpring ?? {};
    }
    let propConf: Partial<PhysicsInteractionOptions> = {};
    const configProp = animationConfig;
    // ... (Handle string preset, spring config, physics options) ...
    if (typeof configProp === 'string' && configProp in SpringPresets) {
      const preset = SpringPresets[configProp as keyof typeof SpringPresets];
      propConf = { stiffness: preset.tension, dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt(preset.tension * (preset.mass ?? 1))) : undefined, mass: preset.mass };
    } else if (typeof configProp === 'object' && configProp !== null) {
      if ('stiffness' in configProp || 'dampingRatio' in configProp) {
        propConf = configProp as Partial<PhysicsInteractionOptions>;
      } else if ('tension' in configProp || 'friction' in configProp) {
         const preset = configProp as Partial<SpringConfig>;
         propConf = { stiffness: preset.tension, dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt((preset.tension ?? SpringPresets.DEFAULT.tension) * (preset.mass ?? 1))) : undefined, mass: preset.mass };
      }
      if ('scaleAmplitude' in configProp && typeof configProp.scaleAmplitude === 'number') propConf.scaleAmplitude = configProp.scaleAmplitude;
      // Add other relevant physics props if needed
    }

    const finalStiffness = propConf.stiffness ?? contextConf.tension ?? baseOptions.stiffness ?? SpringPresets.DEFAULT.tension;
    const calculatedMass = propConf.mass ?? contextConf.mass ?? baseOptions.mass ?? 1;
    const finalDampingRatio = propConf.dampingRatio ?? (contextConf.friction ? contextConf.friction / (2 * Math.sqrt(finalStiffness * calculatedMass)) : baseOptions.dampingRatio ?? 0.5);
    const finalMass = calculatedMass;

    return {
      ...baseOptions,
      stiffness: finalStiffness,
      dampingRatio: finalDampingRatio,
      mass: finalMass,
      ...(propConf.scaleAmplitude !== undefined && { scaleAmplitude: propConf.scaleAmplitude }),
      ...(motionSensitivity && { motionSensitivityLevel: motionSensitivity }),
    };
  }, [defaultSpring, animationConfig, motionSensitivity]);

  const { style: physicsStyle, eventHandlers } = usePhysicsInteraction<HTMLButtonElement>({
    ...finalInteractionConfig,
    reducedMotion: !usePhysics,
  });

  // Combine event handlers
  const combinedClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onSelect(event); // Call parent onChange mapped to onSelect
      if (onClick) {
        onClick(event); // Call original child onClick
      }
      // Trigger physics click handler if needed (might be redundant with mouse down/up)
      // eventHandlers.onClick?.(event);
    }
  };

  const combinedRef = useCallback((node: HTMLButtonElement | null) => {
    tabIndexRef(node); // Call ref callback passed from Tabs
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref, tabIndexRef]);

  return (
    <StyledTab
      ref={combinedRef}
      onClick={combinedClickHandler}
      disabled={disabled}
      $selected={selected}
      $disabled={disabled}
      $orientation={orientation}
      $color={color}
      $size={size}
      $appearance={appearance}
      className={className}
      style={usePhysics ? physicsStyle : {}} // Apply physics style only if enabled
      // Spread physics handlers if enabled
      {...(usePhysics ? eventHandlers : {})}
      {...rest} // Spread any remaining standard HTML attributes
    >
      {icon && <TabIcon>{icon}</TabIcon>}
      <TabLabel>{label}</TabLabel>
    </StyledTab>
  );
});
PhysicsTab.displayName = 'PhysicsTab';

/**
 * Tabs Component
 *
 * Container for a set of tabs and tab panels
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
  const {
    value = 0,
    onChange,
    children,
    variant = 'standard',
    orientation = 'horizontal',
    color = 'primary',
    appearance = 'default',
    size = 'medium',
    className,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabListRef = useRef<HTMLDivElement>(null);
  const { defaultSpring } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();

  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;

  const initialIndicatorStyle = { left: 0, top: 0, width: 0, height: 0, opacity: 0 };
  const finalSpringConfig = useMemo(() => {
      const baseConfig: SpringConfig = SpringPresets.DEFAULT;
      let contextConfig: Partial<SpringConfig> = {};
      if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
          contextConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
      } else if (typeof defaultSpring === 'object') {
          contextConfig = defaultSpring ?? {};
      }

      let propConfig: Partial<SpringConfig> = {};
      if (typeof animationConfig === 'string' && animationConfig in SpringPresets) {
          propConfig = SpringPresets[animationConfig as keyof typeof SpringPresets];
      } else if (typeof animationConfig === 'object') {
          propConfig = animationConfig ?? {};
      }
      return { ...baseConfig, ...contextConfig, ...propConfig };
  }, [defaultSpring, animationConfig]);

  const { values: indicatorStyle, start: animateIndicator } = useMultiSpring({
      from: initialIndicatorStyle,
      animationConfig: finalSpringConfig,
      immediate: finalDisableAnimation,
      autoStart: false,
  });

  useEffect(() => {
    const selectedTabElement = tabRefs.current[value];
    if (selectedTabElement && tabListRef.current) {
      const tabRect = selectedTabElement.getBoundingClientRect();
      const tabListRect = tabListRef.current.getBoundingClientRect();

      let newStyle: typeof initialIndicatorStyle;
      if (orientation === 'horizontal') {
        newStyle = {
          left: selectedTabElement.offsetLeft,
          top: 0,
          width: tabRect.width,
          height: 2,
          opacity: 1,
        };
      } else {
        newStyle = {
          left: 0,
          top: selectedTabElement.offsetTop,
          width: 2,
          height: tabRect.height,
          opacity: 1,
        };
      }
      animateIndicator({ to: newStyle });
    } else {
        animateIndicator({ to: { ...initialIndicatorStyle, opacity: 0 } });
    }
  }, [value, tabRefs, orientation, animateIndicator]);

  // Map children, rendering PhysicsTab wrapper
  const tabElements: React.ReactNode[] = [];
  const panelElements: React.ReactNode[] = [];

  Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return;

    const childElement = child as React.ReactElement<TabProps>; 
    const childProps = childElement.props;
    const isDisabled = childProps.disabled ?? false;
    const isSelected = value === index;

    tabElements.push(
      <PhysicsTab
        key={`tab-${index}`}
        // Pass necessary props
        label={childProps.label}
        icon={childProps.icon}
        disabled={isDisabled}
        selected={isSelected}
        orientation={orientation}
        color={color}
        size={size}
        appearance={appearance}
        className={childProps.className} 
        onClick={childProps.onClick} 
        onSelect={(event) => {
          if (onChange) {
            onChange(event, index);
          }
        }}
        // Pass animation props
        animationConfig={animationConfig}
        disableAnimation={finalDisableAnimation}
        motionSensitivity={motionSensitivity}
        // Pass ref setting function
        tabIndexRef={(el: HTMLButtonElement | null) => (tabRefs.current[index] = el)}
        // Add accessibility props
        aria-controls={`tabpanel-${index}`} 
        aria-selected={value === index}
      />
    );

    // Create the corresponding TabPanel (remains the same)
    if (childProps.children) {
      panelElements.push(
        <TabPanel key={`tabpanel-${index}`} value={value} index={index}>
          {childProps.children}
        </TabPanel>
      );
    }
  });

  // Render Tabs structure
  return (
    <TabsContainer
      ref={ref}
      className={className}
      $orientation={orientation}
      $appearance={appearance}
      {...rest}
    >
      <TabListContainer
        ref={tabListRef}
        role="tablist"
        $orientation={orientation}
        $variant={variant}
      >
        {tabElements} 
        <TabIndicator
          style={{ 
            opacity: indicatorStyle.opacity,
            transform: `translate(${indicatorStyle.left}px, ${indicatorStyle.top}px) scaleX(${indicatorStyle.width ? indicatorStyle.width / 100 : 0}) scaleY(${indicatorStyle.height ? indicatorStyle.height / 100 : 0})`
          }}
          $color={color}
          $orientation={orientation}
        />
      </TabListContainer>
      <TabPanelsContainer $animated={!finalDisableAnimation}>{panelElements}</TabPanelsContainer>
    </TabsContainer>
  );
});

Tabs.displayName = 'Tabs';

/**
 * GlassTabs Component
 *
 * A tabs component with glass morphism styling
 */
export const GlassTabs = forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
  const { className, appearance = 'glass', ...rest } = props;

  return (
    <Tabs ref={ref} className={`glass-tabs ${className || ''}`} appearance={appearance} {...rest} />
  );
});

GlassTabs.displayName = 'GlassTabs';
