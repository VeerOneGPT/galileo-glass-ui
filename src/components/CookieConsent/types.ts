import { ReactNode } from 'react';
import { DefaultTheme } from 'styled-components';
import { AnimationProps } from '../../animations/types'; // Import AnimationProps

/**
 * Props for the CookieConsent component
 */
export interface CookieConsentProps extends AnimationProps {
  /** Title of the cookie consent banner */
  title?: string;
  /** Main message to display */
  message: string;
  /** CSS position property for the banner */
  position?: 'bottom' | 'top' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Button text for accepting cookies */
  acceptButtonText?: string;
  /** Button text for declining cookies */
  declineButtonText?: string;
  /** Button text for customizing cookie settings */
  settingsButtonText?: string;
  /** Callback fired when cookies are accepted */
  onAccept?: () => void;
  /** Callback fired when cookies are declined */
  onDecline?: () => void;
  /** Callback fired when settings button is clicked */
  onSettings?: () => void;
  /** Whether cookie settings are enabled */
  enableSettings?: boolean;
  /** Theme object for styling */
  theme?: DefaultTheme;
  /** Customizes the glass effect intensity (0-1) */
  glassIntensity?: number;
  /** Optional privacy policy URL */
  privacyPolicyUrl?: string;
  /** Optional privacy policy link text */
  privacyPolicyText?: string;
  /** Custom CSS class name */
  className?: string;
  /** Whether to animate the banner entrance */
  animate?: boolean;
  /** How long to delay showing the banner (ms) */
  delay?: number;
  /** How long the banner should be displayed (ms, 0 for indefinite) */
  timeout?: number;
  /** Callback after banner timeout */
  onTimeout?: () => void;
  /** Whether or not the banner should be dismissible */
  dismissible?: boolean;
  /** Cookie expiration time in days */
  cookieExpiration?: number;
  /** Custom styling for the container */
  style?: React.CSSProperties;
}

/**
 * Props for the GlobalCookieConsent component
 */
export interface GlobalCookieConsentProps extends CookieConsentProps, AnimationProps {
  /** List of available cookie categories */
  cookieCategories?: CookieCategory[];
  /** Additional custom content to display */
  customContent?: ReactNode;
  /** Whether to show details in expanded view initially */
  initiallyExpanded?: boolean;
  /** Whether to use a modal dialog for details */
  useModalForDetails?: boolean;
  /** Callback when user changes category selections */
  onCategoryChange?: (selectedCategories: string[]) => void;
  /** Callback when settings are saved */
  onSave?: (selectedCategories: string[]) => void;
  /** Array of IDs of initially selected categories */
  defaultSelectedCategories?: string[];
}

/**
 * Props for the CompactCookieNotice component
 */
export interface CompactCookieNoticeProps extends AnimationProps {
  /** Main message to display */
  message: string;
  /** Button text for accepting */
  acceptText?: string;
  /** Button text for more info */
  moreInfoText?: string;
  /** Callback when accepted */
  onAccept?: () => void;
  /** Callback when more info is requested */
  onMoreInfo?: () => void;
  /** Custom styling for the container */
  style?: React.CSSProperties;
  /** Custom CSS class */
  className?: string;
  /** Whether to animate the notice entrance */
  animate?: boolean;
  /** Customizes the glass effect intensity (0-1) */
  glassIntensity?: number;
  /** Position of the notice */
  position?: 'bottom' | 'top' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Theme object for styling */
  theme?: DefaultTheme;
}

/**
 * Cookie category structure
 */
export interface CookieCategory {
  /** Unique identifier for the category */
  id: string;
  /** Display name of the category */
  name: string;
  /** Description of what this category does */
  description: string;
  /** Whether this category is required/essential */
  required?: boolean;
  /** Detailed information about the cookies in this category */
  cookies?: CookieInfo[];
}

/**
 * Individual cookie information
 */
export interface CookieInfo {
  /** Name of the cookie */
  name: string;
  /** Purpose of the cookie */
  purpose: string;
  /** Domain the cookie belongs to */
  domain?: string;
  /** Cookie expiration time */
  expiry?: string;
  /** Cookie type */
  type?: string;
}
