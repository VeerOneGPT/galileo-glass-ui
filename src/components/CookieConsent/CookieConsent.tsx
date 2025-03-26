import React, { forwardRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { CookieConsentProps } from './types';
import { Box } from '../Box';
import { Button } from '../Button';
import { Typography } from '../Typography';
import { Link } from '../Link';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassBorder } from '../../core/mixins/glassBorder';
// Import correct path for glowEffects
import { glowEffects } from '../../core/mixins/effects/glowEffects';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Cookie management utility
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

const StyledCookieConsent = styled.div<{
  $position: CookieConsentProps['position'];
  $animate: boolean;
  $glassIntensity: number;
}>`
  position: fixed;
  z-index: 1000;
  padding: 1.25rem;
  border-radius: 10px;
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
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
          right: 20px;
        `;
    }
  }}
  
  ${({ theme, $glassIntensity }) => {
    const themeContext = createThemeContext(theme);
    return glassSurface({
      elevation: 2,
      backgroundOpacity: 'medium',
      blurStrength: 'medium',
      themeContext
    });
  }}
  
  ${({ theme }) => {
    const themeContext = createThemeContext(theme);
    return glassBorder({
      width: '1px',
      opacity: 0.3,
      themeContext
    });
  }}
  
  ${({ theme, $glassIntensity }) => {
    const themeContext = createThemeContext(theme);
    return glowEffects.glassGlow({
      intensity: $glassIntensity * 0.3,
      themeContext
    });
  }}
  
  ${({ $animate, $position }) => $animate && `
    animation: slideIn 0.5s ease forwards;
    
    @keyframes slideIn {
      0% {
        opacity: 0;
        transform: ${$position?.includes('top') 
          ? 'translateY(-20px)' 
          : $position?.includes('bottom') 
            ? 'translateY(20px)' 
            : 'translateY(20px)'} ${$position?.includes('left') || $position?.includes('right') ? '' : 'translateX(-50%)'};
      }
      100% {
        opacity: 1;
        transform: translateY(0) ${$position === 'bottom' || $position === 'top' ? 'translateX(-50%)' : ''};
      }
    }
  `}
  
  @media (max-width: 480px) {
    max-width: 100%;
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
    transform: none;
    
    ${({ $position }) => 
      ($position === 'top' || $position === 'bottom') && `
        left: 20px;
        right: 20px;
        width: calc(100% - 40px);
        transform: none;
      `
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  justify-content: flex-end;
  
  @media (max-width: 480px) {
    flex-direction: column;
    
    & > button {
      width: 100%;
    }
  }
`;

/**
 * Cookie Consent component for displaying cookie consent banners
 */
export const CookieConsent = forwardRef<HTMLDivElement, CookieConsentProps>(
  (
    {
      title = 'Cookie Consent',
      message = 'We use cookies to improve your experience on our site.',
      position = 'bottom-right',
      acceptButtonText = 'Accept',
      declineButtonText = 'Decline',
      settingsButtonText = 'Customize',
      onAccept,
      onDecline,
      onSettings,
      enableSettings = false,
      glassIntensity = 0.7,
      privacyPolicyUrl,
      privacyPolicyText = 'Privacy Policy',
      className,
      animate = true,
      delay = 500,
      timeout = 0,
      onTimeout,
      dismissible = true,
      cookieExpiration = 365,
      style,
      ...rest
    }: CookieConsentProps,
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = animate && !prefersReducedMotion;
    
    useEffect(() => {
      // Check if user has already made a choice
      const consentValue = getCookie('cookie-consent');
      if (!consentValue) {
        // Show the consent banner after delay
        const timer = setTimeout(() => {
          setVisible(true);
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }, [delay]);
    
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
    
    const handleAccept = () => {
      setCookie('cookie-consent', 'accepted', cookieExpiration);
      setVisible(false);
      if (onAccept) {
        onAccept();
      }
    };
    
    const handleDecline = () => {
      setCookie('cookie-consent', 'declined', cookieExpiration);
      setVisible(false);
      if (onDecline) {
        onDecline();
      }
    };
    
    const handleSettings = () => {
      if (onSettings) {
        onSettings();
      }
    };
    
    if (!visible) {
      return null;
    }
    
    return (
      <StyledCookieConsent
        ref={ref}
        $position={position}
        $animate={shouldAnimate}
        $glassIntensity={glassIntensity}
        className={className}
        style={style}
        {...rest}
      >
        <Box>
          {title && (
            <Typography variant="h6" style={{ marginBottom: '8px', fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          
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
          
          <ButtonContainer>
            {dismissible && (
              <Button variant="outlined" onClick={handleDecline} size="small">
                {declineButtonText}
              </Button>
            )}
            
            {enableSettings && (
              <Button variant="outlined" onClick={handleSettings} size="small">
                {settingsButtonText}
              </Button>
            )}
            
            <Button variant="contained" onClick={handleAccept} size="small">
              {acceptButtonText}
            </Button>
          </ButtonContainer>
        </Box>
      </StyledCookieConsent>
    );
  }
);

CookieConsent.displayName = 'CookieConsent';

// Glass version of the CookieConsent component
export const GlassCookieConsent = forwardRef<HTMLDivElement, CookieConsentProps>(
  (props: CookieConsentProps, ref) => (
    <CookieConsent
      ref={ref}
      glassIntensity={0.8}
      {...props}
    />
  )
);

GlassCookieConsent.displayName = 'GlassCookieConsent';