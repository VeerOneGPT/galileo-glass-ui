import React from 'react';
import styled from 'styled-components';

interface ChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  height?: number | string;
  className?: string;
}

// Styled container with configurable height
const ChartContainer = styled.div<{ $height?: number | string }>`
  height: ${props => typeof props.$height === 'number' ? `${props.$height}px` : props.$height || 'auto'};
  width: 100%;
  position: relative;
  overflow: hidden;
  background: rgba(17, 25, 40, 0.75);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ChartTitle = styled.h3`
  margin: 0;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ChartContent = styled.div`
  padding: 1rem;
  height: calc(100% - ${props => props.title ? '56px' : '0px'});
`;

/**
 * ChartWrapper Component
 * 
 * A container component that provides consistent styling and layout for charts,
 * especially useful when using GlassDataChart outside of the glass-showcase layout.
 */
const ChartWrapper: React.FC<ChartWrapperProps> = ({ 
  children, 
  title,
  height = 'auto',
  className
}) => {
  return (
    <ChartContainer $height={height} className={className}>
      {title && <ChartTitle>{title}</ChartTitle>}
      <ChartContent title={title}>
        {children}
      </ChartContent>
    </ChartContainer>
  );
};

export default ChartWrapper; 