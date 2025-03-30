import React from 'react';
import { IndicatorsContainer, Indicator } from './styled';

export interface CarouselIndicatorsProps {
  /**
   * Total number of slides
   */
  totalSlides: number;
  
  /**
   * Current active slide index
   */
  activeSlide: number;
  
  /**
   * Callback when an indicator is clicked
   */
  onChange: (index: number) => void;
  
  /**
   * Indicator type/style
   */
  indicatorType?: 'dots' | 'lines' | 'numbers';
  
  /**
   * Color theme for indicators
   */
  color?: string;
  
  /**
   * Position of indicators
   */
  position?: 'top' | 'bottom';
  
  /**
   * Custom renderer for indicators
   */
  renderIndicator?: (index: number, isActive: boolean, onClick: () => void) => React.ReactNode;
}

/**
 * Carousel indicators/dots component
 */
const CarouselIndicators: React.FC<CarouselIndicatorsProps> = ({
  totalSlides,
  activeSlide,
  onChange,
  indicatorType = 'dots',
  color = 'primary',
  position = 'bottom',
  renderIndicator
}) => {
  // Generate array of slide indices
  const slides = Array.from({ length: totalSlides }, (_, index) => index);
  
  return (
    <IndicatorsContainer 
      $type={indicatorType}
      $position={position}
      role="tablist"
      aria-label="Slides"
    >
      {slides.map(index => {
        const isActive = index === activeSlide;
        const handleClick = () => onChange(index);
        
        // Use custom renderer if provided
        if (renderIndicator) {
          return renderIndicator(index, isActive, handleClick);
        }
        
        return (
          <Indicator
            key={index}
            type="button"
            $isActive={isActive}
            $type={indicatorType}
            $color={color}
            onClick={handleClick}
            aria-selected={isActive}
            aria-label={`Slide ${index + 1}`}
            role="tab"
          >
            {indicatorType === 'numbers' ? index + 1 : null}
          </Indicator>
        );
      })}
    </IndicatorsContainer>
  );
};

export default CarouselIndicators;