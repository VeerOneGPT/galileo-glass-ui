import React, { forwardRef, Children, cloneElement, useMemo, useRef, useEffect, useCallback, ReactElement } from 'react';
import styled, { css } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { 
  useAnimationSequence, 
  AnimationSequenceConfig,
  AnimationStage,
  StyleAnimationStage,
  StaggerAnimationStage,
} from '../../animations/orchestration/useAnimationSequence';

// Physics/Animation Imports
import { usePhysicsInteraction, PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { AnimationProps } from '../../animations/types';

export interface ListProps extends AnimationProps {
  /**
   * The content of the list
   */
  children: React.ReactNode;

  /**
   * The component used for the root node (advanced)
   */
  component?: React.ElementType;

  /**
   * If true, compact vertical padding will be used
   */
  dense?: boolean;

  /**
   * If true, the left and right padding will be removed
   */
  disablePadding?: boolean;

  /**
   * The variant of the list
   */
  variant?: 'standard' | 'outlined' | 'glass';

  /**
   * The width of the list
   */
  width?: string | number;

  /**
   * If true, horizontal dividers will be rendered between items
   */
  dividers?: boolean;

  /**
   * The color scheme of the list
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

  /**
   * If true, the list will have rounded corners
   */
  rounded?: boolean;

  /**
   * If true, the list will have a subtle background
   */
  hasBackground?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * If true, add shadow to the list
   */
  elevated?: boolean;

  /** 
   * If true, animate list items on mount. 
   */
  animateEntrance?: boolean;

  /** 
   * Configuration for the entrance animation sequence. 
   */
  entranceAnimationConfig?: Partial<AnimationSequenceConfig>;
}

export interface ListItemProps extends AnimationProps {
  /**
   * The content of the list item
   */
  children: React.ReactNode;

  /**
   * If true, the list item will be a button
   */
  button?: boolean;

  /**
   * If true, the list item will be disabled
   */
  disabled?: boolean;

  /**
   * If true, the list item will be focused
   */
  focused?: boolean;

  /**
   * If true, the list item will be selected
   */
  selected?: boolean;

  /**
   * Primary text for the list item (used with secondaryText for two-line items)
   */
  primaryText?: React.ReactNode;

  /**
   * Secondary text for the list item (used with primaryText for two-line items)
   */
  secondaryText?: React.ReactNode;

  /**
   * Icon to display at the beginning of the list item
   */
  icon?: React.ReactNode;

  /**
   * Element to display at the end of the list item
   */
  action?: React.ReactNode;

  /**
   * If true, display a left border accent
   */
  accentLeft?: boolean;

  /**
   * Callback fired when the list item is clicked
   */
  onClick?: React.MouseEventHandler<HTMLDivElement | HTMLLIElement>;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Index of the item in the list (used for animation staggering).
   * This might be injected by the List component.
   */
  index?: number;

  /** Optional style prop */
  style?: React.CSSProperties;
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
      return '#E5E7EB'; // default light gray
  }
};

// Styled components
const ListRoot = styled.ul<{
  $dense: boolean;
  $disablePadding: boolean;
  $variant: string;
  $width: string | number;
  $dividers: boolean;
  $color: string;
  $rounded: boolean;
  $hasBackground: boolean;
  $elevated: boolean;
}>`
  list-style: none;
  margin: 0;
  padding: ${props => (props.$disablePadding ? 0 : props.$dense ? '4px 0' : '8px 0')};
  width: ${props => (typeof props.$width === 'number' ? `${props.$width}px` : props.$width)};
  font-family: 'Inter', sans-serif;
  position: relative;

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'outlined':
        return `
          border: 1px solid rgba(0, 0, 0, 0.12);
        `;
      case 'glass':
        return `
          background-color: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        `;
      default: // standard
        return props.$hasBackground
          ? `background-color: ${
              props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)'
            };`
          : '';
    }
  }}

  /* Rounded corners */
  border-radius: ${props => (props.$rounded ? '8px' : '0')};

  /* Elevation/shadow */
  box-shadow: ${props => (props.$elevated ? '0 2px 10px rgba(0, 0, 0, 0.08)' : 'none')};

  /* Glass effect for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    glassSurface({
      elevation: props.$elevated ? 2 : 1,
      blurStrength: 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}),
    })}

  /* Glass glow for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    props.$color !== 'default' &&
    glassGlow({
      intensity: 'minimal',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
`;

// Update ListItemRoot to accept animation style and physics prop
const ListItemRoot = styled.li<{
  $button: boolean;
  $disabled: boolean;
  $focused: boolean;
  $selected: boolean;
  $accentLeft: boolean;
  $color: string;
  $hasIcon: boolean;
  $hasAction: boolean;
  $hasBothTexts: boolean;
  $usePhysics: boolean;
  style?: React.CSSProperties;
}>`
  display: flex;
  align-items: ${props => (props.$hasBothTexts ? 'flex-start' : 'center')};
  position: relative;
  padding: 8px 16px;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  ${props => (props.$button ? 'cursor: pointer;' : '')}
  ${props => (props.$disabled ? 'opacity: 0.5; pointer-events: none;' : '')}
  
  /* Focused/Selected styles remain */
  ${props => (props.$focused ? `background-color: rgba(0, 0, 0, 0.04);` : '')}
  ${props =>
    props.$selected
      ? `
    background-color: rgba(${props.$color === 'default' ? '0, 0, 0' : '99, 102, 241'}, 0.08);
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 2px;
      background-color: ${
        props.$color === 'default' ? 'rgba(0, 0, 0, 0.6)' : getColorByName(props.$color)
      };
    }
  `
      : ''}
  
  /* Accent left border */
  ${props =>
    props.$accentLeft &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 4px;
      background-color: ${
        props.$color === 'default' ? 'rgba(0, 0, 0, 0.6)' : getColorByName(props.$color)
      };
    }
  `}
  
  /* Remove CSS-based button hover/active styles if using physics */
  ${props =>
    props.$button &&
    !props.$disabled &&
    !props.$usePhysics && // Only apply CSS transitions if not using physics
    `
    transition: background-color 0.2s ease;
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    &:active {
      background-color: rgba(0, 0, 0, 0.08);
    }
  `}

  /* Apply physics/animation transforms */
  will-change: transform, opacity;
`;

const ListItemIcon = styled.div`
  min-width: 40px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ListItemTexts = styled.div`
  flex: 1;
  min-width: 0;
`;

const PrimaryText = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SecondaryText = styled.div`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
`;

const ListItemAction = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
`;

const Divider = styled.hr`
  margin: 0;
  flex-shrink: 0;
  border: 0;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.12);
`;

// Helper to check if entranceAnimationConfig requests staggering
const wantsStaggering = (config: Partial<AnimationSequenceConfig> | undefined): boolean => {
    return !!config?.stages?.[0] && 
           config.stages[0].type === 'stagger' && 
           (config.stages[0] as Partial<StaggerAnimationStage>).staggerDelay !== undefined &&
           (config.stages[0] as Partial<StaggerAnimationStage>).staggerDelay! > 0;
};

/**
 * List Component
 *
 * A component for displaying lists of items.
 */
export const List = forwardRef<HTMLUListElement, ListProps>((props, ref) => {
  const {
    children,
    component: Component = 'ul',
    dense = false,
    disablePadding = false,
    variant = 'standard',
    width = '100%',
    dividers = false,
    color = 'default',
    rounded = false,
    hasBackground = false,
    className,
    elevated = false,
    animateEntrance = false,
    entranceAnimationConfig,
    animationConfig: propAnimationConfig,
    disableAnimation: propDisableAnimation,
    ...rest
  } = props;

  const { defaultSpring, disableAnimation: contextDisableAnimation } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  const finalDisableAnimation = propDisableAnimation ?? contextDisableAnimation ?? prefersReducedMotion;

  const listItemsRef = useRef<HTMLLIElement[]>([]);
  
  const defaultEntranceSequence: AnimationSequenceConfig = useMemo(() => ({
    id: 'list-entrance-default',
    repeatCount: 1,
    stages: [
      {
        id: 'list-item-stagger-entrance',
        type: 'stagger',
        targets: listItemsRef as any,
        staggerDelay: 50, 
        duration: 300,
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        animations: [],
      }
    ],
  }), []);

  const finalEntranceConfig: AnimationSequenceConfig = useMemo(() => {
      const userConfig = entranceAnimationConfig ?? {};
      const defaultStage = defaultEntranceSequence.stages[0] as StaggerAnimationStage;
      const userStage = userConfig.stages?.[0] as Partial<StaggerAnimationStage> | undefined;
      
      const mergedStage: StaggerAnimationStage = {
          id: userStage?.id ?? defaultStage.id,
          type: 'stagger',
          targets: listItemsRef as any,
          staggerDelay: userStage?.staggerDelay ?? defaultStage.staggerDelay,
          duration: userStage?.duration ?? defaultStage.duration,
          from: userStage?.from ?? defaultStage.from,
          to: userStage?.to ?? defaultStage.to,
          easing: userStage?.easing ?? defaultStage.easing,
          staggerPattern: userStage?.staggerPattern ?? defaultStage.staggerPattern,
          staggerPatternFn: userStage?.staggerPatternFn ?? defaultStage.staggerPatternFn,
          staggerOverlap: userStage?.staggerOverlap ?? defaultStage.staggerOverlap,
          startTime: userStage?.startTime ?? defaultStage.startTime,
          direction: userStage?.direction ?? defaultStage.direction,
          repeatCount: userStage?.repeatCount ?? defaultStage.repeatCount,
          repeatDelay: userStage?.repeatDelay ?? defaultStage.repeatDelay,
          yoyo: userStage?.yoyo ?? defaultStage.yoyo,
          dependsOn: userStage?.dependsOn ?? defaultStage.dependsOn,
          reducedMotionAlternative: userStage?.reducedMotionAlternative ?? defaultStage.reducedMotionAlternative,
          category: userStage?.category ?? defaultStage.category,
          onStart: userStage?.onStart ?? defaultStage.onStart,
          onUpdate: userStage?.onUpdate ?? defaultStage.onUpdate,
          onComplete: userStage?.onComplete ?? defaultStage.onComplete,
      };
      
      return {
          id: userConfig.id ?? defaultEntranceSequence.id,
          repeatCount: userConfig.repeatCount ?? defaultEntranceSequence.repeatCount,
          yoyo: userConfig.yoyo ?? defaultEntranceSequence.yoyo,
          direction: userConfig.direction ?? defaultEntranceSequence.direction,
          autoplay: userConfig.autoplay ?? false, 
          onStart: userConfig.onStart,
          onUpdate: userConfig.onUpdate,
          onComplete: userConfig.onComplete,
          stages: [mergedStage],
      };
  }, [entranceAnimationConfig, defaultEntranceSequence]);

  const entranceAnimation = useAnimationSequence(finalEntranceConfig);

  useEffect(() => {
    if (animateEntrance && !finalDisableAnimation) {
      const targets = listItemsRef.current.filter(el => el !== null);
      if (targets.length > 0) {
          const timeoutId = setTimeout(() => {
             entranceAnimation.play(); 
          }, 50);
          return () => clearTimeout(timeoutId);
      }
    }
    return () => {
      entranceAnimation.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateEntrance, finalDisableAnimation, finalEntranceConfig]);

  const items = Children.toArray(children);
  const mappedChildren = items.map((child, index) => {
    let itemElement: ReactElement | null = null;
    const isLastItem = index === items.length - 1;

    if (React.isValidElement(child)) {
        const childProps: Partial<ListItemProps> = { 
            ...child.props,
            index: index,
            animationConfig: child.props.animationConfig ?? propAnimationConfig,
            disableAnimation: child.props.disableAnimation ?? finalDisableAnimation,
        };

        let physicsProps: { style?: React.CSSProperties, handlers?: object, usePhysics: boolean } = { usePhysics: false };
        if (child.props.button && !child.props.disabled) {
            physicsProps = useListItemPhysics(childProps, propAnimationConfig ?? defaultSpring); 
        }

        itemElement = cloneElement(child, {
            ...childProps,
            style: {
                ...child.props.style,
                ...physicsProps.style,
                opacity: (animateEntrance && !finalDisableAnimation) ? 0 : child.props.style?.opacity ?? 1,
            },
            ...(physicsProps.handlers),
            ref: (node: HTMLLIElement | null) => {
                listItemsRef.current[index] = node;
                const { ref: childRef } = child as any;
                if (typeof childRef === 'function') {
                    childRef(node);
                } else if (childRef) {
                    childRef.current = node;
                }
            },
        } as any);
    } else {
      // Handle non-element children (e.g., strings, numbers)
      if (typeof child === 'string' || typeof child === 'number') {
        // Wrap primitives, or handle differently if needed
        itemElement = <span>{child}</span> as ReactElement;
      } else {
        // If it's some other non-element type, maybe skip or log warning
        console.warn('Skipping non-renderable child in List:', child);
        itemElement = null; // Skip rendering this child
      }
    }
    
    // Ensure itemElement is not null before proceeding
    if (!itemElement) {
        return null; // Don't render fragment if itemElement is null
    }
    
    return (
      <React.Fragment key={(child as any)?.key ?? index}>
        {itemElement}
        {dividers && !isLastItem && <Divider />}
      </React.Fragment>
    );
  });

  return (
    <Component
      ref={ref}
      role="list"
      className={className}
      $dense={dense}
      $disablePadding={disablePadding}
      $variant={variant}
      $width={width}
      $dividers={dividers}
      $color={color}
      $rounded={rounded}
      $hasBackground={hasBackground}
      $elevated={elevated}
      {...rest}
    >
      {mappedChildren}
    </Component>
  );
});

/**
 * Internal hook to manage physics for a ListItem
 */
const useListItemPhysics = (itemProps: Partial<ListItemProps>, contextDefaultSpringConfig: Partial<SpringConfig> | keyof typeof SpringPresets | undefined): { style?: React.CSSProperties, handlers?: object, usePhysics: boolean } => {
    const { 
        animationConfig: itemAnimConfig, 
        disableAnimation: itemDisableAnim, 
    } = itemProps;

    const finalDisable = itemDisableAnim;

    const finalPhysicsOptions = useMemo(() => {
        const baseOptions: Partial<PhysicsInteractionOptions> = {
            affectsScale: true,
            scaleAmplitude: 0.03,
        };

        let resolvedConfig: Partial<SpringConfig> = {};

        // Simplify: Prioritize item prop if it's a valid SpringConfig, else use context/default
        if (typeof itemAnimConfig === 'object' && ('tension' in itemAnimConfig || 'friction' in itemAnimConfig || 'mass' in itemAnimConfig)) {
            resolvedConfig = itemAnimConfig as Partial<SpringConfig>;
        } else if (typeof contextDefaultSpringConfig === 'string' && contextDefaultSpringConfig in SpringPresets) {
             resolvedConfig = SpringPresets[contextDefaultSpringConfig as keyof typeof SpringPresets];
        } else if (typeof contextDefaultSpringConfig === 'object') {
             resolvedConfig = contextDefaultSpringConfig;
        } else {
            resolvedConfig = SpringPresets.DEFAULT;
        }
        
        const finalSpringConfig = { ...SpringPresets.DEFAULT, ...resolvedConfig };

        // Map SpringConfig to PhysicsInteractionOptions
        const interactionOptions: Partial<PhysicsInteractionOptions> = {
             stiffness: finalSpringConfig.tension,
             dampingRatio: finalSpringConfig.friction ? 
                 finalSpringConfig.friction / (2 * Math.sqrt(finalSpringConfig.tension * (finalSpringConfig.mass ?? 1))) 
                 : undefined, // Pass undefined if friction is not set
             mass: finalSpringConfig.mass,
        };

        return { 
            ...baseOptions, 
            ...interactionOptions,
            disabled: finalDisable,
        };
    }, [itemAnimConfig, contextDefaultSpringConfig, finalDisable]);

    const { style, eventHandlers } = usePhysicsInteraction(finalPhysicsOptions);
    
    return { style, handlers: eventHandlers, usePhysics: !finalDisable };
};

List.displayName = 'List';

/**
 * GlassList Component
 *
 * A list component with glass morphism styling.
 */
export const GlassList = forwardRef<HTMLUListElement, ListProps>((props, ref) => {
  const { className, variant = 'glass', hasBackground = true, ...rest } = props;

  return (
    <List
      ref={ref}
      className={`glass-list ${className || ''}`}
      variant={variant}
      hasBackground={hasBackground}
      {...rest}
    />
  );
});

GlassList.displayName = 'GlassList';

/**
 * GlassListItem Component
 *
 * A list item with glass morphism styling.
 */
export const GlassListItem = forwardRef<HTMLLIElement, ListItemProps>((props, ref) => {
  const { className, ...rest } = props;

  return <ListItem ref={ref} className={`glass-list-item ${className || ''}`} {...rest} />;
});

GlassListItem.displayName = 'GlassListItem';

// *** Add Basic ListItem Definition ***
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>((props, ref) => {
  const {
    children,
    button = false,
    disabled = false,
    focused = false,
    selected = false,
    primaryText,
    secondaryText,
    icon,
    action,
    accentLeft = false,
    onClick,
    className,
    style,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    index,
    ...rest
  } = props;

  const listContext = { color: 'default' }; // Placeholder or use actual context

  return (
    <ListItemRoot
      ref={ref}
      $button={button}
      $disabled={disabled}
      $focused={focused}
      $selected={selected}
      $accentLeft={accentLeft}
      $color={listContext.color}
      $hasIcon={!!icon}
      $hasAction={!!action}
      $hasBothTexts={!!(primaryText && secondaryText)}
      $usePhysics={button && !disabled} // Indicate if physics might be used (passed from List)
      onClick={button && !disabled ? onClick : undefined}
      className={className}
      style={style} // Apply style passed down from List
      role={button ? 'button' : 'listitem'}
      tabIndex={button && !disabled ? 0 : undefined}
      {...rest}
    >
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      {(primaryText || secondaryText) ? (
        <ListItemTexts>
          {primaryText && <PrimaryText>{primaryText}</PrimaryText>}
          {secondaryText && <SecondaryText>{secondaryText}</SecondaryText>}
        </ListItemTexts>
      ) : (
        <ListItemTexts>{children}</ListItemTexts> // Fallback to children if texts aren't provided
      )}
      {action && <ListItemAction>{action}</ListItemAction>}
    </ListItemRoot>
  );
});

ListItem.displayName = 'ListItem';
