import React from 'react';

interface ClearIconProps {
  fontSize?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Custom ClearIcon component
 */
const ClearIcon: React.FC<ClearIconProps> = ({ fontSize = 'medium', className, style }) => {
  // Determine size based on fontSize prop
  const size = fontSize === 'small' ? 18 : fontSize === 'large' ? 24 : 20;

  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
    </svg>
  );
};

export default ClearIcon;
