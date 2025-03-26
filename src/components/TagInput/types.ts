/**
 * TagInput Component Types
 *
 * Type definitions for the TagInput component.
 */

import React from 'react';

/**
 * Tag structure for each tag item
 */
export interface Tag {
  id: string | number;
  label: string;
  color?: string;
  disabled?: boolean;
  [key: string]: any;
}

/**
 * Props for the TagInput component
 */
export interface TagInputProps {
  /** Array of tags currently in the input */
  value?: Tag[];
  
  /** Default value for uncontrolled component */
  defaultValue?: Tag[];
  
  /** Callback fired when tags change */
  onChange?: (tags: Tag[]) => void;
  
  /** Additional suggestions to show when typing */
  suggestions?: Tag[];
  
  /** Whether new tags can be added */
  allowAdd?: boolean;
  
  /** Whether tags can be deleted */
  allowDelete?: boolean;
  
  /** Whether the input is disabled */
  disabled?: boolean;
  
  /** Whether the input is read-only */
  readOnly?: boolean;
  
  /** Label displayed above the input */
  label?: string;
  
  /** Helper text displayed below the input */
  helperText?: string;
  
  /** Error state of the input */
  error?: boolean | string;
  
  /** Placeholder text for the input */
  placeholder?: string;
  
  /** Maximum number of tags allowed */
  maxTags?: number;
  
  /** Function to validate new tags */
  validateTag?: (tag: string) => boolean;
  
  /** Function to create a tag from input text */
  createTag?: (inputValue: string) => Tag;
  
  /** Function to filter suggestions */
  filterSuggestions?: (inputValue: string, suggestions: Tag[]) => Tag[];
  
  /** Whether to show suggestions dropdown */
  showSuggestions?: boolean;
  
  /** Size of the input */
  size?: 'small' | 'medium' | 'large';
  
  /** Whether the component should take the full width of its container */
  fullWidth?: boolean;
  
  /** Enable animations */
  animate?: boolean;
  
  /** Tags can be clicked */
  clickableTags?: boolean;
  
  /** Callback fired when a tag is clicked */
  onTagClick?: (tag: Tag) => void;
  
  /** Custom tag renderer */
  renderTag?: (tag: Tag, props: { onDelete: () => void; onClick: () => void }) => React.ReactNode;
  
  /** CSS styles applied to the component */
  style?: React.CSSProperties;
  
  /** Class name for the component */
  className?: string;
  
  /** Whether the input should auto-focus */
  autoFocus?: boolean;
  
  /** Additional props */
  [key: string]: any;
}