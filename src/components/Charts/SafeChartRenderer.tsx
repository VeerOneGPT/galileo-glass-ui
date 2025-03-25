/**
 * SafeChartRenderer Component
 * 
 * A utility component for safely rendering charts with error boundaries,
 * loading states, and adaptive styling based on the device capabilities.
 */
import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { DeviceCapabilityTier, getDeviceCapabilityTier } from '../../utils/deviceCapabilities';

/**
 * Chart status types
 */
export type ChartRenderStatus = 'loading' | 'error' | 'empty' | 'rendered';

/**
 * Props for the SafeChartRenderer component
 */
export interface SafeChartRendererProps {
  /**
   * The chart component to render
   */
  children: ReactNode;
  
  /**
   * Whether the chart is loading
   */
  loading?: boolean;
  
  /**
   * Optional loading component
   */
  loadingComponent?: ReactNode;
  
  /**
   * Whether to fall back to a simplified version on low-end devices
   */
  adaptToCapabilities?: boolean;
  
  /**
   * Component to render when data is empty
   */
  emptyComponent?: ReactNode;
  
  /**
   * Whether chart data is empty
   */
  isEmpty?: boolean;
  
  /**
   * Minimum width for the chart
   */
  minWidth?: number | string;
  
  /**
   * Minimum height for the chart
   */
  minHeight?: number | string;
  
  /**
   * Whether to apply glass styling to the chart container
   */
  glassEffect?: boolean;
  
  /**
   * Background color for the chart container
   */
  backgroundColor?: string;
  
  /**
   * Callback for error events
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Callback for status changes
   */
  onStatusChange?: (status: ChartRenderStatus) => void;
  
  /**
   * Alt text for accessibility
   */
  altText?: string;
}

/**
 * Props for the ChartContainer styled component
 */
interface ChartContainerProps {
  minWidth?: number | string;
  minHeight?: number | string;
  glassEffect?: boolean;
  backgroundColor?: string;
}

// Styled component for the chart container
const ChartContainer = styled.div<ChartContainerProps>`
  position: relative;
  min-width: ${({ minWidth }) => typeof minWidth === 'number' ? `${minWidth}px` : minWidth || '300px'};
  min-height: ${({ minHeight }) => typeof minHeight === 'number' ? `${minHeight}px` : minHeight || '200px'};
  border-radius: 8px;
  overflow: hidden;
  
  ${({ glassEffect }) => glassEffect ? `
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  ` : `
    background-color: ${({ backgroundColor }) => backgroundColor || 'transparent'};
    border: 1px solid rgba(230, 230, 230, 0.1);
  `}
`;

// Styled component for loading state
const LoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
`;

// Default loading spinner component
const DefaultLoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: rgba(255, 255, 255, 0.8);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Empty state component
const EmptyState = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  
  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

// Default empty state component
const DefaultEmptyState: React.FC = () => (
  <EmptyState>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 21H3V3H21V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 16L8 11L13 16L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 8H21V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <div>No data available</div>
  </EmptyState>
);

// Error state component
const ErrorState = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(229, 62, 62, 0.8);
  padding: 16px;
  text-align: center;
  
  svg {
    margin-bottom: 16px;
    opacity: 0.7;
  }
  
  button {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: rgba(229, 62, 62, 0.2);
    border: 1px solid rgba(229, 62, 62, 0.5);
    border-radius: 4px;
    color: rgba(229, 62, 62, 0.8);
    cursor: pointer;
    
    &:hover {
      background-color: rgba(229, 62, 62, 0.3);
    }
  }
`;

// Default error state component
interface ErrorStateComponentProps {
  onRetry?: () => void;
}

const DefaultErrorState: React.FC<ErrorStateComponentProps> = ({ onRetry }) => (
  <ErrorState>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <div>Failed to render chart</div>
    {onRetry && (
      <button onClick={onRetry}>Retry</button>
    )}
  </ErrorState>
);

/**
 * SafeChartRenderer Component
 * 
 * Safely renders chart components with error handling and loading states
 */
export const SafeChartRenderer: React.FC<SafeChartRendererProps> = ({
  children,
  loading = false,
  loadingComponent,
  adaptToCapabilities = true,
  emptyComponent,
  isEmpty = false,
  minWidth = 300,
  minHeight = 200,
  glassEffect = true,
  backgroundColor = 'transparent',
  onError,
  onStatusChange,
  altText = 'Chart visualization'
}) => {
  // Track component status
  const [status, setStatus] = useState<ChartRenderStatus>(loading ? 'loading' : 'rendered');
  
  // Track device capability
  const [deviceTier, setDeviceTier] = useState<DeviceCapabilityTier>(DeviceCapabilityTier.MEDIUM);
  
  // Track error state
  const [error, setError] = useState<Error | null>(null);
  
  // Handle retry action
  const handleRetry = () => {
    setError(null);
    setStatus('rendered');
  };
  
  // Update status when loading or empty props change
  useEffect(() => {
    let newStatus: ChartRenderStatus = 'rendered';
    
    if (loading) {
      newStatus = 'loading';
    } else if (isEmpty) {
      newStatus = 'empty';
    } else if (error) {
      newStatus = 'error';
    }
    
    if (newStatus !== status) {
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    }
  }, [loading, isEmpty, error, status, onStatusChange]);
  
  // Detect device capability on mount
  useEffect(() => {
    const tier = getDeviceCapabilityTier();
    setDeviceTier(tier);
  }, []);
  
  // Error boundary implementation
  class ChartErrorBoundary extends React.Component<
    { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void },
    { hasError: boolean }
  > {
    constructor(props: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
      super(props);
      this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(_: Error) {
      return { hasError: true };
    }
    
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      setError(error);
      setStatus('error');
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    }
    
    render() {
      if (this.state.hasError) {
        return null; // We'll render the error state outside
      }
      
      return this.props.children;
    }
  }
  
  return (
    <ChartContainer
      minWidth={minWidth}
      minHeight={minHeight}
      glassEffect={glassEffect}
      backgroundColor={backgroundColor}
      role="img"
      aria-label={altText}
    >
      {/* Only render chart if not in loading or error state */}
      {status !== 'loading' && status !== 'error' && !isEmpty && (
        <ChartErrorBoundary onError={onError}>
          {/* If on a low-end device and adaptation is enabled, use simpler charts */}
          {adaptToCapabilities && 
           (deviceTier === DeviceCapabilityTier.LOW || deviceTier === DeviceCapabilityTier.MINIMAL) ? (
             <React.Fragment>
               {/* We'll render a simplified version of the chart with reduced effects */}
               {React.Children.map(children, child => {
                 if (React.isValidElement(child)) {
                   return React.cloneElement(child as React.ReactElement<any>, {
                     simplified: true,
                     reducedEffects: true,
                     animationDisabled: deviceTier === DeviceCapabilityTier.MINIMAL
                   });
                 }
                 return child;
               })}
             </React.Fragment>
           ) : (
             // Normal chart rendering
             <React.Fragment>{children}</React.Fragment>
           )}
        </ChartErrorBoundary>
      )}
      
      {/* Loading state */}
      {status === 'loading' && (
        <LoadingContainer>
          {loadingComponent || <DefaultLoadingSpinner />}
        </LoadingContainer>
      )}
      
      {/* Error state */}
      {status === 'error' && (
        <DefaultErrorState onRetry={handleRetry} />
      )}
      
      {/* Empty state */}
      {isEmpty && (
        <React.Fragment>
          {emptyComponent || <DefaultEmptyState />}
        </React.Fragment>
      )}
    </ChartContainer>
  );
};