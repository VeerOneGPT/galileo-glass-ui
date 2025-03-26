/**
 * SpeedDial Component Types
 *
 * Type definitions for the SpeedDial component.
 */

import React from 'react';

/**
 * Action for the SpeedDial
 */
export interface SpeedDialAction {
  /** Name of the action, used for accessibility */
  name: string;
  
  /** Icon for the action */
  icon: React.ReactNode;
  
  /** Tooltip text for the action */
  tooltipTitle?: string;
  
  /** Additional props for the action */
  [key: string]: any;
}

/**
 * Props for the SpeedDial component
 */
export interface SpeedDialProps {
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** The icon to display in the SpeedDial Floating Action Button */
  icon: React.ReactNode;
  
  /** Actions that will be displayed when the SpeedDial is open */
  actions: SpeedDialAction[];
  
  /** If true, the SpeedDial will be opened by default */
  defaultOpen?: boolean;
  
  /** If true, the component is open */
  open?: boolean;
  
  /** The direction in which the actions will be displayed */
  direction?: 'up' | 'down' | 'left' | 'right';
  
  /** If true, the component is disabled */
  disabled?: boolean;
  
  /** Callback fired when the component opens or closes */
  onOpen?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /** Callback fired when the component closes */
  onClose?: (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
  
  /** Callback fired when an action is clicked */
  onActionClick?: (event: React.MouseEvent<HTMLDivElement>, actionName: string) => void;
  
  /** If true, the SpeedDial will be hidden on scroll */
  hideOnScroll?: boolean;
  
  /** The position of the SpeedDial */
  position?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  
  /** The size of the SpeedDial button */
  size?: 'small' | 'medium' | 'large';
  
  /** The color of the SpeedDial button */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;
  
  /** If true, applies glass morphism effect to the main button */
  glass?: boolean;
  
  /** If true, applies glass morphism effect to the actions */
  glassActions?: boolean;
  
  /** If true, tooltips will be shown for actions */
  showTooltips?: boolean;
  
  /** Aria label for the SpeedDial */
  ariaLabel: string;
  
  /** If true, will transition animations */
  transition?: boolean;
  
  /** Additional props */
  [key: string]: any;
}

/**
 * Props for the SpeedDialAction component
 */
export interface SpeedDialActionProps {
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** Icon for the action */
  icon: React.ReactNode;
  
  /** Tooltip title for the action */
  tooltipTitle?: string;
  
  /** If true, the component is disabled */
  disabled?: boolean;
  
  /** Callback fired when the action is clicked */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  
  /** If true, applies glass morphism effect */
  glass?: boolean;
  
  /** The index of the action (used for animations) */
  index: number;
  
  /** Total number of actions (used for animations) */
  totalActions: number;
  
  /** The direction of the SpeedDial */
  direction: 'up' | 'down' | 'left' | 'right';
  
  /** If true, will enable transitions */
  transition?: boolean;
  
  /** If true, tooltips will be shown */
  showTooltip?: boolean;
  
  /** The size of the action button */
  size?: 'small' | 'medium' | 'large';
  
  /** Additional props */
  [key: string]: any;
}

/**
 * Props for the SpeedDialIcon component
 */
export interface SpeedDialIconProps {
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** The icon to display in the closed state */
  icon?: React.ReactNode;
  
  /** The icon to display in the open state */
  openIcon?: React.ReactNode;
  
  /** If true, the icon is in the open state */
  open?: boolean;
  
  /** Additional props */
  [key: string]: any;
}