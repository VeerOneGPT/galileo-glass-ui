import React from 'react';
import { PlayPauseButton } from './styled';

export interface PlayPauseControlProps {
  /**
   * Whether autoplay is active
   */
  isPlaying: boolean;
  
  /**
   * Callback when play/pause is toggled
   */
  onToggle: () => void;
  
  /**
   * Position of the control
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  
  /**
   * Color theme
   */
  color?: string;
  
  /**
   * Glass styling variant
   */
  glassVariant?: string;
  
  /**
   * Whether the control should be shown
   */
  show?: boolean;
}

/**
 * Play/Pause control button component
 */
const PlayPauseControl: React.FC<PlayPauseControlProps> = ({
  isPlaying,
  onToggle,
  position = 'bottom-right',
  color = 'primary',
  glassVariant = 'frosted',
  show = true
}) => {
  if (!show) {
    return null;
  }
  
  return (
    <PlayPauseButton
      type="button"
      aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
      $isPlaying={isPlaying}
      $position={position}
      $color={color}
      $glassVariant={glassVariant}
      onClick={onToggle}
    />
  );
};

export default PlayPauseControl;