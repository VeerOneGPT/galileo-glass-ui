/**
 * Glass Accordion Component
 * 
 * A collapsible and expandable panel with glass morphism styling.
 */
import React, { forwardRef, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AccordionProps } from './types';

// Create context for accordion state
export interface AccordionContextProps {
  expanded: boolean;
  disabled: boolean;
  toggle: (event: React.SyntheticEvent) => void;
  glass: boolean;
}

export const AccordionContext = React.createContext<AccordionContextProps | null>(null);

// Styled components
const AccordionRoot = styled.div<{
  $expanded: boolean;
  $disabled: boolean;
  $glass: boolean;
  $elevation: number;
  $transparency: string;
  $enableTransitions: boolean;
  $bottomMargin: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  flex-direction: column;
  position: relative;
  transition: ${props => props.$enableTransitions && !props.$reducedMotion ? 'margin 0.2s ease, box-shadow 0.2s ease' : 'none'};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: ${props => props.$bottomMargin ? '16px' : '0'};
  
  /* Glass styling */
  ${props => props.$glass && glassSurface({
    elevation: props.$elevation,
    blurStrength: 'standard',
    borderOpacity: props.$transparency === 'none' ? 'none' :
                  props.$transparency === 'low' ? 'subtle' :
                  props.$transparency === 'high' ? 'strong' : 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  
  /* Non-glass styling */
  ${props => !props.$glass && `
    background-color: ${props.$expanded ? 'rgba(30, 30, 30, 0.65)' : 'rgba(18, 18, 18, 0.65)'};
    border: 1px solid rgba(255, 255, 255, ${props.$expanded ? '0.15' : '0.1'});
    box-shadow: ${
      props.$elevation === 0 ? 'none' :
      props.$elevation === 1 ? '0 2px 4px rgba(0, 0, 0, 0.1)' :
      props.$elevation === 2 ? '0 3px 6px rgba(0, 0, 0, 0.15)' :
      props.$elevation === 3 ? '0 5px 10px rgba(0, 0, 0, 0.2)' :
      props.$elevation === 4 ? '0 8px 16px rgba(0, 0, 0, 0.25)' :
      '0 12px 24px rgba(0, 0, 0, 0.3)'
    };
  `}
  
  /* Expanded state */
  ${props => props.$expanded && `
    box-shadow: ${props.$glass ? '' : '0 8px 24px rgba(0, 0, 0, 0.12)'};
  `}
  
  /* Disabled state */
  ${props => props.$disabled && `
    opacity: 0.6;
    cursor: default;
    pointer-events: none;
  `}
`;

/**
 * Accordion Component Implementation
 */
function AccordionComponent(
  props: AccordionProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    className,
    style,
    defaultExpanded = false,
    expanded: controlledExpanded,
    disabled = false,
    onChange,
    component = 'div',
    bottomMargin = true,
    elevation = 1,
    transparency = 'medium',
    glass = false,
    enableTransitions = true,
    ...rest
  } = props;
  
  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();
  
  // State for uncontrolled component
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  // Determine if component is controlled
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;
  
  // Toggle expanded state
  const toggle = useCallback((event: React.SyntheticEvent) => {
    if (disabled) return;
    
    const newExpanded = !expanded;
    
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    
    if (onChange) {
      onChange(event, newExpanded);
    }
  }, [disabled, expanded, isControlled, onChange]);
  
  // Context value
  const contextValue = useMemo(() => ({
    expanded,
    disabled,
    toggle,
    glass
  }), [expanded, disabled, toggle, glass]);
  
  // Get root component
  const Root = AccordionRoot as unknown as React.ElementType;
  
  return (
    <Root
      as={component}
      ref={ref}
      className={className}
      style={style}
      $expanded={expanded}
      $disabled={disabled}
      $glass={glass}
      $elevation={elevation}
      $transparency={transparency}
      $enableTransitions={enableTransitions}
      $bottomMargin={bottomMargin}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      <AccordionContext.Provider value={contextValue}>
        {children}
      </AccordionContext.Provider>
    </Root>
  );
}

/**
 * Accordion Component
 * 
 * A collapsible and expandable panel.
 */
const Accordion = forwardRef(AccordionComponent);

/**
 * GlassAccordion Component
 * 
 * Glass variant of the Accordion component.
 */
const GlassAccordion = forwardRef<HTMLDivElement, AccordionProps>((props, ref) => (
  <Accordion {...props} glass={true} ref={ref} />
));

GlassAccordion.displayName = 'GlassAccordion';

export default Accordion;
export { Accordion, GlassAccordion };