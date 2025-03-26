/**
 * Accordion Component Types
 *
 * Type definitions for the Accordion component.
 */

import React from 'react';

/**
 * Props for the Accordion component
 */
export interface AccordionProps {
  /** Content of the accordion */
  children?: React.ReactNode;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** If true, expands the accordion by default */
  defaultExpanded?: boolean;

  /** If true, the accordion will be expanded */
  expanded?: boolean;

  /** If true, the accordion will be disabled */
  disabled?: boolean;

  /** Callback fired when the expand/collapse state is changed */
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;

  /** The component used for the root node */
  component?: React.ElementType;

  /** If true, the component will have extra bottom margin */
  bottomMargin?: boolean;

  /** The elevation of the accordion component */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;

  /** Transparency of the accordion */
  transparency?: 'none' | 'low' | 'medium' | 'high';

  /** If true, applies glass morphism effect */
  glass?: boolean;

  /** If true, shows transition animations */
  enableTransitions?: boolean;

  /** Additional props */
  [key: string]: any;
}

/**
 * Props for the AccordionSummary component
 */
export interface AccordionSummaryProps {
  /** Content of the accordion summary */
  children?: React.ReactNode;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** The icon to display as the expand indicator */
  expandIcon?: React.ReactNode;

  /** If true, the component is disabled */
  disabled?: boolean;

  /** Callback fired when the component is clicked */
  onClick?: React.MouseEventHandler<HTMLDivElement>;

  /** If true, applies glass morphism effect */
  glass?: boolean;

  /** Additional props */
  [key: string]: any;
}

/**
 * Props for the AccordionDetails component
 */
export interface AccordionDetailsProps {
  /** Content of the accordion details */
  children?: React.ReactNode;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** The component used for the root node */
  component?: React.ElementType;

  /** If true, applies glass morphism effect */
  glass?: boolean;

  /** Padding size for the details */
  padding?: 'none' | 'small' | 'medium' | 'large';

  /** Additional props */
  [key: string]: any;
}
