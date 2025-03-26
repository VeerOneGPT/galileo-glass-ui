import React, { forwardRef, useState, useEffect } from 'react';
import styled from 'styled-components';

import { glowEffects } from '../../core/mixins/effects/glowEffects';
import { glassBorder } from '../../core/mixins/glassBorder';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Box } from '../Box';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Link } from '../Link';
import { Modal } from '../Modal';
import { Typography } from '../Typography';
// Dialog component may need to be implemented or imported from the correct path
// import { Dialog } from '../Dialog';
// Import correct path for glowEffects

import { GlobalCookieConsentProps, CookieCategory } from './types';

// Cookie management utilities
const setCookie = (name: string, value: string, days: number): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const StyledGlobalCookieConsent = styled.div<{
  $position: GlobalCookieConsentProps['position'];
  $animate: boolean;
  $glassIntensity: number;
}>`
  position: fixed;
  z-index: 1000;
  padding: 1.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);

  ${({ $position }) => {
    switch ($position) {
      case 'bottom':
        return `
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'top':
        return `
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'bottom-left':
        return `
          bottom: 20px;
          left: 20px;
        `;
      case 'bottom-right':
        return `
          bottom: 20px;
          right: 20px;
        `;
      case 'top-left':
        return `
          top: 20px;
          left: 20px;
        `;
      case 'top-right':
        return `
          top: 20px;
          right: 20px;
        `;
      default:
        return `
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}

  ${({ theme, $glassIntensity }) => {
    const themeContext = createThemeContext(theme);
    return glassSurface({
      elevation: 2,
      backgroundOpacity: 'medium',
      blurStrength: 'medium',
      themeContext,
    });
  }}
  
  ${({ theme }) => {
    const themeContext = createThemeContext(theme);
    return glassBorder({
      width: '1px',
      opacity: 0.35,
      themeContext,
    });
  }}
  
  ${({ theme, $glassIntensity }) => {
    const themeContext = createThemeContext(theme);
    return glowEffects.glassGlow({
      intensity: $glassIntensity * 0.4,
      themeContext,
    });
  }}
  
  ${({ $animate, $position }) =>
    $animate &&
    `
    animation: slideIn 0.6s ease forwards;
    
    @keyframes slideIn {
      0% {
        opacity: 0;
        transform: ${
          $position?.includes('top')
            ? 'translateY(-30px)'
            : $position?.includes('bottom')
            ? 'translateY(30px)'
            : 'translateY(30px)'
        } ${$position?.includes('left') || $position?.includes('right') ? '' : 'translateX(-50%)'};
      }
      100% {
        opacity: 1;
        transform: translateY(0) ${
          $position === 'bottom' || $position === 'top' ? 'translateX(-50%)' : ''
        };
      }
    }
  `}
  
  @media (max-width: 540px) {
    max-width: 100%;
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
    transform: none;

    ${({ $position }) =>
      ($position === 'top' || $position === 'bottom') &&
      `
        left: 20px;
        right: 20px;
        width: calc(100% - 40px);
        transform: none;
      `}
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.25rem;
  justify-content: flex-end;

  @media (max-width: 540px) {
    flex-direction: column;

    & > button {
      width: 100%;
    }
  }
`;

const CategoryContainer = styled.div`
  margin-top: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const CategoryItem = styled.div`
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  background: rgba(255, 255, 255, 0.07);

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CategoryDescription = styled.div`
  margin-left: 2rem;
  font-size: 0.875rem;
  opacity: 0.85;
`;

const CookieDetailContainer = styled.div`
  margin-top: 0.75rem;
  margin-left: 2rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
`;

const DetailsToggle = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 0.5rem;
  display: block;
  margin-left: 2rem;

  &:hover {
    opacity: 1;
  }
`;

/**
 * Global Cookie Consent component for comprehensive cookie consent management
 */
export const GlobalCookieConsent = forwardRef<HTMLDivElement, GlobalCookieConsentProps>(
  (
    {
      title = 'Manage Cookie Preferences',
      message = 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.',
      position = 'bottom',
      acceptButtonText = 'Accept All',
      declineButtonText = 'Decline All',
      settingsButtonText = 'Save Preferences',
      onAccept,
      onDecline,
      onSave,
      onCategoryChange,
      enableSettings = true,
      glassIntensity = 0.8,
      privacyPolicyUrl,
      privacyPolicyText = 'Privacy Policy',
      className,
      animate = true,
      delay = 700,
      timeout = 0,
      onTimeout,
      dismissible = true,
      cookieExpiration = 365,
      style,
      cookieCategories = [],
      customContent,
      initiallyExpanded = false,
      useModalForDetails = false,
      defaultSelectedCategories = [],
      ...rest
    }: GlobalCookieConsentProps,
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(initiallyExpanded);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = animate && !prefersReducedMotion;

    // Set initial selected categories
    useEffect(() => {
      const initialCategories = [...defaultSelectedCategories];

      // Always include required categories
      cookieCategories
        .filter(category => category.required)
        .forEach(category => {
          if (!initialCategories.includes(category.id)) {
            initialCategories.push(category.id);
          }
        });

      setSelectedCategories(initialCategories);
    }, [cookieCategories, defaultSelectedCategories]);

    // Check if consent was previously given
    useEffect(() => {
      const consentValue = getCookie('cookie-consent');
      if (!consentValue) {
        const timer = setTimeout(() => {
          setVisible(true);
        }, delay);

        return () => clearTimeout(timer);
      }
    }, [delay]);

    // Handle timeout
    useEffect(() => {
      if (visible && timeout > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          if (onTimeout) {
            onTimeout();
          }
        }, timeout);

        return () => clearTimeout(timer);
      }
    }, [visible, timeout, onTimeout]);

    const handleToggleCategory = (categoryId: string, required = false) => {
      if (required) return; // Can't toggle required categories

      setSelectedCategories(prevSelected => {
        const newSelected = prevSelected.includes(categoryId)
          ? prevSelected.filter(id => id !== categoryId)
          : [...prevSelected, categoryId];

        if (onCategoryChange) {
          onCategoryChange(newSelected);
        }

        return newSelected;
      });
    };

    const handleAcceptAll = () => {
      const allCategoryIds = cookieCategories.map(category => category.id);
      setCookie('cookie-consent', 'accepted', cookieExpiration);
      setCookie('cookie-categories', JSON.stringify(allCategoryIds), cookieExpiration);
      setVisible(false);

      if (onAccept) {
        onAccept();
      }
    };

    const handleDeclineAll = () => {
      // Only include required categories when declining all
      const requiredCategoryIds = cookieCategories
        .filter(category => category.required)
        .map(category => category.id);

      setCookie('cookie-consent', 'declined', cookieExpiration);
      setCookie('cookie-categories', JSON.stringify(requiredCategoryIds), cookieExpiration);
      setVisible(false);

      if (onDecline) {
        onDecline();
      }
    };

    const handleSavePreferences = () => {
      setCookie('cookie-consent', 'customized', cookieExpiration);
      setCookie('cookie-categories', JSON.stringify(selectedCategories), cookieExpiration);
      setVisible(false);

      if (onSave) {
        onSave(selectedCategories);
      }
    };

    const toggleExpanded = () => {
      setExpanded(!expanded);
    };

    const handleShowDetails = () => {
      if (useModalForDetails) {
        setShowDetailsModal(true);
      } else {
        setExpanded(true);
      }
    };

    if (!visible) {
      return null;
    }

    // Create the categories section
    const renderCategories = () => (
      <CategoryContainer>
        {cookieCategories.map(category => (
          <CategoryItem key={category.id}>
            <CategoryHeader>
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleToggleCategory(category.id, category.required)}
                disabled={category.required}
              />
              <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                {category.name} {category.required && <em>(Required)</em>}
              </Typography>
            </CategoryHeader>

            <CategoryDescription>
              <Typography variant="body2">{category.description}</Typography>
            </CategoryDescription>

            {category.cookies && category.cookies.length > 0 && (
              <>
                <DetailsToggle
                  onClick={() => {
                    // Logic to show cookie details could be expanded here
                  }}
                >
                  Show cookie details
                </DetailsToggle>

                {/* Cookie details could be expanded here */}
              </>
            )}
          </CategoryItem>
        ))}
      </CategoryContainer>
    );

    return (
      <>
        <StyledGlobalCookieConsent
          ref={ref}
          $position={position}
          $animate={shouldAnimate}
          $glassIntensity={glassIntensity}
          className={className}
          style={style}
          {...rest}
        >
          <Box>
            <Typography variant="h6" style={{ marginBottom: '8px', fontWeight: 600 }}>
              {title}
            </Typography>

            <Typography variant="body2">
              {message}
              {privacyPolicyUrl && (
                <>
                  {' '}
                  <Link href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
                    {privacyPolicyText}
                  </Link>
                </>
              )}
            </Typography>

            {customContent && <Box mt={1.5}>{customContent}</Box>}

            {!expanded && cookieCategories.length > 0 && (
              <Button variant="text" onClick={handleShowDetails} size="small">
                Customize settings
              </Button>
            )}

            {(expanded || initiallyExpanded) && cookieCategories.length > 0 && renderCategories()}

            <ButtonContainer>
              {dismissible && (
                <Button variant="outlined" onClick={handleDeclineAll} size="small">
                  {declineButtonText}
                </Button>
              )}

              {expanded && enableSettings && (
                <Button variant="outlined" onClick={handleSavePreferences} size="small">
                  {settingsButtonText}
                </Button>
              )}

              <Button variant="contained" onClick={handleAcceptAll} size="small">
                {acceptButtonText}
              </Button>
            </ButtonContainer>
          </Box>
        </StyledGlobalCookieConsent>

        {useModalForDetails && (
          <Modal open={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
            <div className="dialog-container">
              <div className="dialog-header">
                <Typography variant="h6">Cookie Settings</Typography>
                <Button variant="text" onClick={() => setShowDetailsModal(false)}>
                  ×
                </Button>
              </div>
              <div className="dialog-content">{renderCategories()}</div>
              <div className="dialog-actions">
                <Button variant="outlined" onClick={() => setShowDetailsModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    handleSavePreferences();
                    setShowDetailsModal(false);
                  }}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }
);

GlobalCookieConsent.displayName = 'GlobalCookieConsent';

// Glass version of the GlobalCookieConsent
export const GlassGlobalCookieConsent = forwardRef<HTMLDivElement, GlobalCookieConsentProps>(
  (props: GlobalCookieConsentProps, ref) => (
    <GlobalCookieConsent ref={ref} glassIntensity={0.9} {...props} />
  )
);

GlassGlobalCookieConsent.displayName = 'GlassGlobalCookieConsent';
