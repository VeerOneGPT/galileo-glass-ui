/**
 * ToggleButtonGroup Component
 *
 * A group of toggle buttons with glass morphism styling.
 */
import React, {
  forwardRef,
  Children,
  isValidElement,
  cloneElement,
  useState,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { ToggleButtonGroupProps, ToggleButtonProps } from './types';

// Styled components
const GroupRoot = styled.div<{
  $orientation: 'horizontal' | 'vertical';
  $fullWidth: boolean;
}>`
  display: inline-flex;
  flex-direction: ${props => (props.$orientation === 'vertical' ? 'column' : 'row')};
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  border-radius: 4px;

  /* Prevent double borders */
  & > button + button {
    ${props => (props.$orientation === 'horizontal' ? 'margin-left: -1px;' : 'margin-top: -1px;')}
  }
`;

/**
 * ToggleButtonGroup Component Implementation
 */
function ToggleButtonGroupComponent(
  props: ToggleButtonGroupProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    value: controlledValue,
    defaultValue,
    onChange,
    exclusive = false,
    orientation = 'horizontal',
    className,
    style,
    glass = false,
    color = 'primary',
    size = 'medium',
    fullWidth = false,
    variant = 'outlined',
    ...rest
  } = props;

  // State for uncontrolled component
  const [internalValue, setInternalValue] = useState<any | any[]>(
    defaultValue !== undefined
      ? exclusive && Array.isArray(defaultValue)
        ? defaultValue[0] ?? null
        : defaultValue
      : null
  );

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Handle button selection
  const handleButtonSelection = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, buttonValue: any) => {
      // Always stop propagation to prevent parent handlers from being notified
      event.stopPropagation();

      let newValue: any | any[];

      if (exclusive) {
        // In exclusive mode, only one button can be selected
        newValue = value === buttonValue ? null : buttonValue;
      } else {
        // In non-exclusive mode, multiple buttons can be selected
        const valueArray = Array.isArray(value) ? value : value ? [value] : [];

        if (valueArray.includes(buttonValue)) {
          newValue = valueArray.filter(v => v !== buttonValue);
          if (newValue.length === 0) newValue = null;
        } else {
          newValue = [...valueArray, buttonValue];
        }
      }

      // Update internal value if uncontrolled
      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Notify parent if callback provided
      if (onChange) {
        onChange(event, newValue);
      }
    },
    [value, exclusive, isControlled, onChange]
  );

  // Prepare children with additional props
  const childrenCount = Children.count(children);
  const childrenWithProps = Children.map(children, (child, index) => {
    if (!isValidElement<ToggleButtonProps>(child)) {
      return child;
    }

    // Calculate group position flags
    const isGroupStart = index === 0;
    const isGroupEnd = index === childrenCount - 1;

    // Create props for the child button
    const childProps = {
      color,
      size,
      fullWidth,
      variant,
      glass,
      selected: child.props.value === value,
      onChange: handleButtonSelection,
      grouped: true,
      groupOrientation: orientation,
      isGroupStart,
      isGroupEnd,
    };

    return cloneElement(child, childProps);
  });

  return (
    <GroupRoot
      ref={ref}
      role="group"
      className={className}
      style={style}
      $orientation={orientation}
      $fullWidth={fullWidth}
      {...rest}
    >
      {childrenWithProps}
    </GroupRoot>
  );
}

/**
 * ToggleButtonGroup Component
 *
 * A group of toggle buttons.
 */
const ToggleButtonGroup = forwardRef(ToggleButtonGroupComponent);

/**
 * GlassToggleButtonGroup Component
 *
 * Glass variant of the ToggleButtonGroup component.
 */
const GlassToggleButtonGroup = forwardRef<HTMLDivElement, ToggleButtonGroupProps>((props, ref) => (
  <ToggleButtonGroup {...props} glass={true} ref={ref} />
));

GlassToggleButtonGroup.displayName = 'GlassToggleButtonGroup';

export default ToggleButtonGroup;
export { ToggleButtonGroup, GlassToggleButtonGroup };
