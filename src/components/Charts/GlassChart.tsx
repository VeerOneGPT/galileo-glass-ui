/**
 * GlassChart Component
 * 
 * A unified chart container with glass styling, physics-based interactions,
 * and Z-Space layering. Acts as a wrapper for all chart types.
 */
import React, { useMemo, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { AreaChart } from './AreaChart';
import { PieChart } from './PieChart';
import SimpleChart from './SimpleChart';
import GlassTooltip, { GlassTooltipContent } from './GlassTooltip';
import EnhancedGlassTabs from './EnhancedGlassTabs';
import { BaseChartProps } from './types';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeUtils';
import { zSpaceLayer } from '../../core/mixins/depth/zSpaceLayer';
import { useGlassTheme, useReducedMotion, useGlassPerformance } from '../../hooks';
import { useMouseMagneticEffect, usePhysicsInteraction } from '../../animations/hooks';
import { useZSpaceAnimation } from '../../hooks/useZSpaceAnimation';

/**
 * GlassChart props interface
 */
export interface GlassChartProps extends BaseChartProps {
  /**
   * The type of chart to render
   */
  type: 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar' | 'bubble';
  
  /**
   * Data for the chart
   */
  data: any;
  
  /**
   * Whether to use simplified rendering
   */
  forcedSimplified?: boolean;
  
  /**
   * Z-Space elevation of the chart
   */
  zElevation?: 0 | 1 | 2 | 3 | 4;
  
  /**
   * Apply magnetic effect on hover
   */
  magneticEffect?: boolean;
  
  /**
   * Strength of the magnetic effect
   */
  magneticStrength?: number;
  
  /**
   * Whether to enable depth animations
   */
  depthAnimation?: boolean;
  
  /**
   * Tabs for chart navigation
   */
  tabs?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  
  /**
   * Active tab ID
   */
  activeTab?: string;
  
  /**
   * Callback when tab changes
   */
  onTabChange?: (tabId: string) => void;
  
  /**
   * Chart-specific props
   */
  chartProps?: Record<string, any>;
  
  /**
   * Chart toolbar items to display
   */
  toolbarItems?: React.ReactNode;
  
  /**
   * Allow chart switching
   */
  allowTypeSwitch?: boolean;
  
  /**
   * Available chart types for switching
   */
  availableTypes?: Array<'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar' | 'bubble'>;
  
  /**
   * Enable interactive focus mode with zoom
   */
  focusMode?: boolean;
  
  /**
   * Whether to show a download button
   */
  allowDownload?: boolean;
  
  /**
   * Custom download function
   */
  onDownload?: () => void;
}

/**
 * Styled container with glass effects
 */
const ChartContainer = styled.div<{
  zElevation: number;
  height?: string | number;
  width?: string | number;
  theme: any;
  focused: boolean;
}>`
  position: relative;
  width: ${props => typeof props.width === 'number' ? `${props.width}px` : props.width || '100%'};
  height: ${props => typeof props.height === 'number' ? `${props.height}px` : props.height || '400px'};
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  ${props => glassSurface({
    elevation: props.zElevation,
    blurStrength: 'standard',
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  
  ${props => zSpaceLayer({
    layer: props.zElevation,
    themeContext: createThemeContext(props.theme)
  })}
  
  ${props => props.focused && `
    transform: scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  `}
`;

/**
 * Chart header section
 */
const ChartHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

/**
 * Styled title and description
 */
const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: ${props => props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
`;

const ChartDescription = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  color: ${props => props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
`;

/**
 * Chart control bar with tabs and actions
 */
const ChartControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`;

const TabsContainer = styled.div`
  flex: 1;
`;

const ToolbarContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

/**
 * Chart type selector button
 */
const ChartTypeButton = styled.button<{ active: boolean; theme: any }>`
  background: ${props => props.active 
    ? props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' 
    : 'transparent'};
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
  }
`;

/**
 * Chart content container
 */
const ChartContent = styled.div<{ focused: boolean }>`
  position: relative;
  width: 100%;
  height: ${props => props.focused ? 'calc(100% - 120px)' : 'calc(100% - 80px)'};
  overflow: hidden;
`;

/**
 * Footer content with legend or additional info
 */
const FooterContent = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  color: ${props => props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
  text-align: center;
`;

/**
 * Chart SVG icons for type switching
 */
const ChartTypeIcons = {
  bar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 18V7M12 18V11M16 18V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  line: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 14L8 10L12 14L20 6M20 6V12M20 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  area: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 14L8 10L12 14L20 6M20 6V12M20 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 14V20H20V6L12 14L8 10L4 14Z" fill="currentColor" fillOpacity="0.2"/>
    </svg>
  ),
  pie: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12V2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 12L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 12L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

/**
 * GlassChart Component
 */
export const GlassChart: React.FC<GlassChartProps> = ({
  type = 'bar',
  data,
  width = '100%',
  height = 400,
  glass = true,
  title,
  description,
  forcedSimplified = false,
  zElevation = 2,
  magneticEffect = false,
  magneticStrength = 0.3,
  depthAnimation = false,
  adaptToCapabilities = true,
  tabs,
  activeTab,
  onTabChange,
  chartProps = {},
  toolbarItems,
  allowTypeSwitch = false,
  availableTypes = ['bar', 'line', 'area', 'pie'],
  focusMode = false,
  allowDownload = false,
  onDownload,
  onError,
  style,
  className
}) => {
  // Access theme context
  const { isDarkMode, theme } = useGlassTheme();
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Get device performance capabilities
  const { isLowPerformanceDevice, deviceCapabilityTier } = useGlassPerformance();
  
  // Determine if simplified rendering should be used
  const useSimplified = useMemo(() => {
    return forcedSimplified || (adaptToCapabilities && isLowPerformanceDevice);
  }, [forcedSimplified, adaptToCapabilities, isLowPerformanceDevice]);
  
  // State for active tab
  const [currentTab, setCurrentTab] = useState(activeTab || (tabs?.length ? tabs[0].id : ''));
  
  // State for current chart type when switching is allowed
  const [currentType, setCurrentType] = useState(type);
  
  // State for focus mode
  const [isFocused, setIsFocused] = useState(false);
  
  // Refs for chart container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use magnetic effect if enabled
  const magneticProps = useMemo(() => {
    if (magneticEffect && !prefersReducedMotion) {
      return useMouseMagneticEffect({
        type: 'attract',
        strength: magneticStrength,
        radius: 200,
        maxDisplacement: 10,
        affectsRotation: false,
        affectsScale: false,
        smooth: true
      });
    }
    return null;
  }, [magneticEffect, magneticStrength, prefersReducedMotion]);
  
  // Use depth animation if enabled
  const { animate, styles: depthStyles } = useZSpaceAnimation({
    fromLayer: 2,
    toLayer: 3,
    trajectory: 'forward',
    atmosphericFog: true,
    depthShadows: true,
    duration: 0.5
  });
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };
  
  // Handle chart type change
  const handleTypeChange = (newType: GlassChartProps['type']) => {
    setCurrentType(newType);
  };
  
  // Handle focus mode toggle
  const handleFocusToggle = () => {
    if (focusMode) {
      setIsFocused(!isFocused);
      if (depthAnimation && !isFocused) {
        animate();
      }
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download implementation - would need canvas conversion
      console.log('Download chart - custom implementation required');
    }
  };
  
  // Render chart based on type and simplified mode
  const renderChart = useCallback(() => {
    const commonProps = {
      data,
      width: '100%',
      height: '100%',
      glass,
      title: undefined, // We're handling title in the container
      description: undefined, // We're handling description in the container
      adaptToCapabilities,
      simplified: useSimplified,
      onError,
      ...chartProps
    };
    
    if (useSimplified) {
      return (
        <SimpleChart
          type={currentType}
          data={data}
          glass={glass}
          title={undefined}
          height="100%"
          width="100%"
          {...chartProps}
        />
      );
    }
    
    switch (currentType) {
      case 'bar':
        return <BarChart {...commonProps} />;
      case 'line':
        return <LineChart {...commonProps} />;
      case 'area':
        return <AreaChart {...commonProps} fillArea={true} {...chartProps} />;
      case 'pie':
        return <PieChart {...commonProps} />;
      default:
        return <BarChart {...commonProps} />;
    }
  }, [currentType, data, glass, chartProps, useSimplified]);
  
  return (
    <ChartContainer
      ref={containerRef}
      zElevation={zElevation}
      width={width}
      height={height}
      theme={theme || {}}
      focused={isFocused}
      style={{
        ...style,
        ...(magneticProps ? magneticProps.transform : {}),
        ...(isFocused && depthAnimation ? depthStyles : {})
      }}
      className={className}
      {...(magneticProps ? { ref: magneticProps.ref } : {})}
      onClick={handleFocusToggle}
    >
      <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Chart header */}
        {(title || description) && (
          <ChartHeader>
            {title && <ChartTitle>{title}</ChartTitle>}
            {description && <ChartDescription>{description}</ChartDescription>}
          </ChartHeader>
        )}
        
        {/* Chart controls (tabs & toolbar) */}
        {(tabs?.length || allowTypeSwitch || toolbarItems) && (
          <ChartControls>
            {/* Tabs for chart navigation */}
            {tabs?.length && (
              <TabsContainer>
                <EnhancedGlassTabs
                  tabs={tabs}
                  activeTab={currentTab}
                  onChange={handleTabChange}
                  variant="default"
                  size="small"
                  color="primary"
                  physicsEnabled={!prefersReducedMotion}
                />
              </TabsContainer>
            )}
            
            {/* Action buttons toolbar */}
            <ToolbarContainer>
              {allowTypeSwitch && (
                <>
                  {availableTypes.includes('bar') && (
                    <ChartTypeButton
                      active={currentType === 'bar'}
                      onClick={() => handleTypeChange('bar')}
                      title="Bar chart"
                      theme={{}}
                    >
                      {ChartTypeIcons.bar}
                    </ChartTypeButton>
                  )}
                  {availableTypes.includes('line') && (
                    <ChartTypeButton
                      active={currentType === 'line'}
                      onClick={() => handleTypeChange('line')}
                      title="Line chart"
                      theme={{}}
                    >
                      {ChartTypeIcons.line}
                    </ChartTypeButton>
                  )}
                  {availableTypes.includes('area') && (
                    <ChartTypeButton
                      active={currentType === 'area'}
                      onClick={() => handleTypeChange('area')}
                      title="Area chart"
                      theme={{}}
                    >
                      {ChartTypeIcons.area}
                    </ChartTypeButton>
                  )}
                  {availableTypes.includes('pie') && (
                    <ChartTypeButton
                      active={currentType === 'pie'}
                      onClick={() => handleTypeChange('pie')}
                      title="Pie chart"
                      theme={{}}
                    >
                      {ChartTypeIcons.pie}
                    </ChartTypeButton>
                  )}
                </>
              )}
              
              {allowDownload && (
                <ChartTypeButton
                  active={false}
                  onClick={handleDownload}
                  title="Download chart"
                  theme={{}}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </ChartTypeButton>
              )}
              
              {/* Custom toolbar items */}
              {toolbarItems}
            </ToolbarContainer>
          </ChartControls>
        )}
        
        {/* Main chart content */}
        <ChartContent focused={isFocused}>
          {renderChart()}
        </ChartContent>
        
        {/* Footer content (optional) */}
        {isFocused && (
          <FooterContent>
            Click to exit focused view
          </FooterContent>
        )}
      </div>
    </ChartContainer>
  );
};

export default GlassChart;