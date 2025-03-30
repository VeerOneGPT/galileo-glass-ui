/**
 * ZSpaceProvider.tsx
 * 
 * Provides a container element with the necessary CSS perspective properties
 * for child elements using the useZSpace hook.
 */

import React, { createContext, useContext, useRef, useMemo, RefObject } from 'react';
import styled from 'styled-components';

/**
 * Context for Z-space information
 */
interface ZSpaceContextValue {
  containerRef: RefObject<HTMLElement> | null;
  perspective: number;
  perspectiveOrigin: { x: number, y: number }; // Relative to container (0-1)
}

const ZSpaceContext = createContext<ZSpaceContextValue | null>(null);

/**
 * Hook to access Z-space context
 */
export const useZSpaceContext = () => {
  const context = useContext(ZSpaceContext);
  if (!context) {
    console.warn('useZSpaceContext must be used within a ZSpaceProvider');
  }
  return context;
};

/**
 * Props for ZSpaceProvider component
 */
export interface ZSpaceProviderProps {
  /** Perspective value in pixels. Higher means less distortion. */
  perspective?: number;
  /** Perspective origin X position (0-1 relative to container width). Default 0.5 */
  originX?: number;
  /** Perspective origin Y position (0-1 relative to container height). Default 0.5 */
  originY?: number;
  /** Children elements */
  children: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
}

interface StyledZSpaceContainerProps {
  $perspective: number;
  $originX: number;
  $originY: number;
}

const StyledZSpaceContainer = styled.div<StyledZSpaceContainerProps>`
  perspective: ${props => props.$perspective}px;
  perspective-origin: ${props => props.$originX * 100}% ${props => props.$originY * 100}%;
  /* Ensure child transforms are preserved */
  transform-style: preserve-3d;
  /* Overflow might need adjustment depending on use case */
  overflow: visible;
  position: relative; /* Establish positioning context */
`;

/**
 * ZSpaceProvider component
 * 
 * Creates a 3D perspective context for child elements using useZSpace.
 */
export const ZSpaceProvider: React.FC<ZSpaceProviderProps> = ({
  perspective = 1000,
  originX = 0.5,
  originY = 0.5,
  children,
  className,
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const contextValue = useMemo((): ZSpaceContextValue => ({
    containerRef,
    perspective,
    perspectiveOrigin: { x: originX, y: originY },
  }), [perspective, originX, originY]);

  return (
    <ZSpaceContext.Provider value={contextValue}>
      <StyledZSpaceContainer
        ref={containerRef}
        className={className}
        style={style}
        $perspective={perspective}
        $originX={originX}
        $originY={originY}
      >
        {children}
      </StyledZSpaceContainer>
    </ZSpaceContext.Provider>
  );
};

export default ZSpaceProvider; 