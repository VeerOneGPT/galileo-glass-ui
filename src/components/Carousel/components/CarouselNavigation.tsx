import React from 'react';
import { NavButton } from './styled';

export interface CarouselNavigationProps {
  /**
   * Current slide index
   */
  currentSlide: number;
  
  /**
   * Total number of slides
   */
  totalSlides: number;
  
  /**
   * Whether infinite scrolling is enabled
   */
  infinite?: boolean;
  
  /**
   * Callback for clicking the previous button
   */
  onPrevClick: () => void;
  
  /**
   * Callback for clicking the next button
   */
  onNextClick: () => void;
  
  /**
   * Color theme for buttons
   */
  color?: string;
  
  /**
   * Glass styling variant
   */
  glassVariant?: string;
  
  /**
   * Whether arrows should be shown
   */
  showArrows?: boolean;
  
  /**
   * Aria label for the previous button
   */
  prevButtonAriaLabel?: string;
  
  /**
   * Aria label for the next button
   */
  nextButtonAriaLabel?: string;
}

/**
 * Navigation arrows for the carousel
 */
const CarouselNavigation: React.FC<CarouselNavigationProps> = ({
  currentSlide,
  totalSlides,
  infinite = false,
  onPrevClick,
  onNextClick,
  color = 'primary',
  glassVariant = 'frosted',
  showArrows = true,
  prevButtonAriaLabel,
  nextButtonAriaLabel
}) => {
  // Don't render if arrows should be hidden
  if (!showArrows) {
    return null;
  }
  
  // Determine if previous/next buttons should be disabled
  const isPrevDisabled = !infinite && currentSlide <= 0;
  const isNextDisabled = !infinite && currentSlide >= totalSlides - 1;
  
  return (
    <>
      <NavButton
        type="button"
        aria-label={prevButtonAriaLabel || "Previous slide"}
        $direction="prev"
        $color={color}
        $glassVariant={glassVariant}
        onClick={onPrevClick}
        disabled={isPrevDisabled}
      />
      <NavButton
        type="button"
        aria-label={nextButtonAriaLabel || "Next slide"}
        $direction="next"
        $color={color}
        $glassVariant={glassVariant}
        onClick={onNextClick}
        disabled={isNextDisabled}
      />
    </>
  );
};

export default CarouselNavigation;