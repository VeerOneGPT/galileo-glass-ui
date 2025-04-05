/**
 * Types for the GlassMultiSelect component
 */
import React from 'react';
import { AnimationProps } from '../../animations/types'; // Import common animation props
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics'; // Import spring types

/**
 * An option for the multi-select component
 */
export interface MultiSelectOption<T = string> {
  /** Unique identifier for the option */
  id: string | number;
  
  /** Display label for the option */
  label: string;
  
  /** Additional value associated with this option */
  value: T;
  
  /** Whether this option is disabled */
  disabled?: boolean;
  
  /** Whether this option is currently focused */
  focused?: boolean;
  
  /** Optional description to display with the option */
  description?: string;
  
  /** Optional group this option belongs to (for grouping capabilities) */
  group?: string;

  /** Optional icon component to display with the option */
  icon?: React.ReactNode;
}

/**
 * Group configuration for grouped options
 */
export interface OptionGroup {
  /** Unique identifier for the group */
  id: string;
  
  /** Display label for the group */
  label: string;
  
  /** Whether this entire group is disabled */
  disabled?: boolean;
}

/**
 * Filter function type for custom filtering
 */
export type FilterFunction<T = string> = (
  option: MultiSelectOption<T>, 
  inputValue: string,
  selectedOptions: MultiSelectOption<T>[]
) => boolean;

/**
 * Props for the GlassMultiSelect component
 */
export interface MultiSelectProps<T = string> {
  /** Array of selectable options */
  options: MultiSelectOption<T>[];
  
  /** Currently selected options */
  value?: MultiSelectOption<T>[];
  
  /** Placeholder text when no options are selected */
  placeholder?: string;
  
  /** Handler for when selected options change */
  onChange?: (selected: MultiSelectOption<T>[]) => void;
  
  /** Handler for when an option is selected */
  onSelect?: (option: MultiSelectOption<T>) => void;
  
  /** Handler for when an option is removed */
  onRemove?: (option: MultiSelectOption<T>) => void;
  
  /** Width of the component (default: 300px) */
  width?: string | number;
  
  /** Whether the component should take full width of its container */
  fullWidth?: boolean;
  
  /** Size variant of the component */
  size?: 'small' | 'medium' | 'large';
  
  /** Maximum height of the dropdown list */
  maxHeight?: string | number;
  
  /** CSS class name to apply to the root element */
  className?: string;
  
  /** Component is disabled and cannot be interacted with */
  disabled?: boolean;
  
  /** Whether to display an error state */
  error?: boolean;
  
  /** Error message to display */
  errorMessage?: string;
  
  /** Label to display above the component */
  label?: string;
  
  /** Helper text to display below the component */
  helperText?: string;
  
  /** Whether to use animation effects */
  animate?: boolean;
  
  /** Whether the dropdown should be opened upward */
  openUp?: boolean;
  
  /** Custom filter function for filtering options */
  filterFunction?: FilterFunction<T>;
  
  /** Whether to allow creation of new options from input */
  creatable?: boolean;
  
  /** Handler for creating a new option */
  onCreateOption?: (inputValue: string) => MultiSelectOption<T>;
  
  /** Maximum number of options that can be selected */
  maxSelections?: number;
  
  /** Maximum number of options to display before showing "and X more" */
  maxDisplay?: number;
  
  /** Custom renderer for the selected options/tokens */
  renderToken?: (option: MultiSelectOption<T>, onRemove: (event: React.MouseEvent) => void) => React.ReactNode;
  
  /** Custom renderer for option in the dropdown */
  renderOption?: (option: MultiSelectOption<T>, state: { 
    selected: boolean;
    focused: boolean;
    disabled: boolean;
  }) => React.ReactNode;
  
  /** Custom renderer for group headers */
  renderGroup?: (group: OptionGroup) => React.ReactNode;
  
  /** Whether to close the dropdown after selecting an option */
  closeOnSelect?: boolean;
  
  /** Whether to clear the input after selecting an option */
  clearInputOnSelect?: boolean;
  
  /** Whether to enable keyboard navigation */
  keyboardNavigation?: boolean;
  
  /** Whether to show a clear button to remove all selected options */
  clearable?: boolean;
  
  /** Whether to allow searching by typing in the input */
  searchable?: boolean;
  
  /** Whether to automatically bring focus to the component on mount */
  autoFocus?: boolean;
  
  /** ID of the component for accessibility */
  id?: string;
  
  /** aria-label for the component */
  ariaLabel?: string;
  
  /** Whether to group options by their group property */
  withGroups?: boolean;
  
  /** Array of group configurations (required if withGroups is true) */
  groups?: OptionGroup[];
  
  /** Handler for when the dropdown is opened */
  onOpen?: () => void;
  
  /** Handler for when the dropdown is closed */
  onClose?: () => void;
  
  /** Handler for when the input value changes */
  onInputChange?: (value: string) => void;
  
  /** Virtualization settings for the option list */
  virtualization?: {
    /** Number of items to render at once (default: 30) */
    itemCount?: number;
    /** Height of each item (required for virtualization) */
    itemHeight: number;
    /** Whether to use virtualization (automatic if option count > 100) */
    enabled?: boolean;
  };
  
  /** Physics animation settings */
  physics?: {
    /** Spring tension for animations (higher = faster) */
    tension?: number;
    /** Spring friction for animations (higher = less bouncy) */
    friction?: number;
    /** Token animation preset */
    animationPreset?: 'gentle' | 'default' | 'snappy' | 'bouncy';
    /** Whether to use physics for token dragging rearrangement */
    dragToReorder?: boolean;
    /** Whether tokens should have subtle hover animations */
    hoverEffects?: boolean;
  };
  
  /** Async loading settings */
  async?: {
    /** Whether the options are loading */
    loading?: boolean;
    /** Loading indicator element */
    loadingIndicator?: React.ReactNode;
    /** Handler for loading more options on scroll */
    onLoadMore?: () => void;
    /** Whether all options have been loaded */
    hasMore?: boolean;
    /** Function to fetch options based on input */
    fetchOptions?: (input: string) => Promise<MultiSelectOption<T>[]>;
  };
  
  /** Whether to enable mobile-optimized touch handling */
  touchFriendly?: boolean;

  /**
   * Optional test ID for targeting elements in tests.
   */
  dataTestId?: string;

  /** 
   * Configure the animation for removing selected items (tokens).
   * Accepts a spring configuration object or a preset name.
   */
  itemRemoveAnimation?: Partial<SpringConfig> | keyof typeof SpringPresets;
}