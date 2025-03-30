/**
 * ScrollButtons Component
 * 
 * Provides scroll buttons for tab bar when there are more tabs than can fit in view.
 */
import React from 'react';
import { ScrollButton } from '../styled';

interface ScrollButtonsProps {
  orientation: string;
  showLeftScroll: boolean;
  showRightScroll: boolean;
  onScroll: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

const ScrollButtons: React.FC<ScrollButtonsProps> = ({
  orientation,
  showLeftScroll,
  showRightScroll,
  onScroll
}) => {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <>
      {showLeftScroll && (
        <ScrollButton 
          $direction={isHorizontal ? 'left' : 'up'}
          onClick={() => onScroll(isHorizontal ? 'left' : 'up')}
          aria-label={isHorizontal ? 'Scroll left' : 'Scroll up'}
        >
          {isHorizontal ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          )}
        </ScrollButton>
      )}
      
      {showRightScroll && (
        <ScrollButton 
          $direction={isHorizontal ? 'right' : 'down'}
          onClick={() => onScroll(isHorizontal ? 'right' : 'down')}
          aria-label={isHorizontal ? 'Scroll right' : 'Scroll down'}
        >
          {isHorizontal ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </ScrollButton>
      )}
    </>
  );
};

export default ScrollButtons;