/**
 * GlassChart Component
 *
 * A unified chart container with glass styling, physics-based interactions,
 * and Z-Space layering. Acts as a wrapper for all chart types.
 */
import React, { useMemo, useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import styled, { DefaultTheme } from 'styled-components';

import { useMouseMagneticEffect, usePhysicsInteraction } from '../../animations/hooks';
import { zSpaceLayer } from '../../core/mixins/depth/zSpaceLayer';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeUtils';
import { useGlassTheme } from '../../hooks/useGlassTheme';
import { useReducedMotion } from '../../animations/accessibility/useReducedMotion';
import { useZSpaceAnimation } from '../../hooks/useZSpaceAnimation';
import { FlexibleElementRef } from '../../utils/elementTypes';
import { asCoreThemeContext } from '../../utils/themeHelpers';
import { useTheme } from '../../theme';

import { AreaChart } from './AreaChart';
import { BarChart } from './BarChart';
import EnhancedGlassTabs from './EnhancedGlassTabs';
import GlassTooltip, { GlassTooltipContent } from './GlassTooltip';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';
import SimpleChart from './SimpleChart';
import { BaseChartProps, ChartSeries, SeriesDataPoint } from './types';

// Ref interface
export interface GlassChartRef {
  /** Gets the main chart container DOM element */
  getContainerElement: () => HTMLDivElement | null;
  /** Gets the currently rendered chart type */
  getCurrentChartType: () => GlassChartProps['type'];
  /** Programmatically changes the rendered chart type */
  setChartType: (type: GlassChartProps['type']) => void;
  /** Programmatically sets the active tab (if tabs are used) */
  setActiveTab: (tabId: string) => void;
  /** Programmatically triggers the download function (if configured) */
  downloadChart: () => void;
  /** Toggles the focus mode (if enabled) */
  toggleFocusMode: () => void;
}

/**
 * GlassChart props interface
 */
export interface GlassChartProps extends BaseChartProps {
  /**
   * The type of chart to render
   */
  type: 'bar' | 'line' | 'area' | 'pie' | 'scatter';

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
  availableTypes?: Array<'bar' | 'line' | 'area' | 'pie' | 'scatter'>;

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

  /**
   * Theme object for the chart
   */
  theme?: DefaultTheme | any;
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
  width: ${props => (typeof props.width === 'number' ? `${props.width}px` : props.width || '100%')};
  height: ${props =>
    typeof props.height === 'number' ? `${props.height}px` : props.height || '400px'};
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  ${props =>
    glassSurface({
      elevation: props.zElevation,
      blurStrength: 'standard',
      borderOpacity: 'medium',
      themeContext: asCoreThemeContext(createThemeContext(props.theme)),
    })}

  ${props =>
    zSpaceLayer({
      layer: String(props.zElevation) as any, // Convert to string for layer
      themeContext: asCoreThemeContext(createThemeContext(props.theme)),
    })}
  
  ${props =>
    props.focused &&
    `
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
  color: ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)')};
`;

const ChartDescription = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  color: ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)')};
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
const ChartTypeButton = styled.button<{ active: boolean; theme?: any }>`
  background: ${props =>
    props.active
      ? props.theme?.isDarkMode ?? false
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)'
      : 'transparent'};
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props =>
      props.theme?.isDarkMode ?? false ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
  }
`;

/**
 * Chart content container
 */
const ChartContent = styled.div<{ focused: boolean }>`
  position: relative;
  width: 100%;
  height: ${props => (props.focused ? 'calc(100% - 120px)' : 'calc(100% - 80px)')};
  overflow: hidden;
`;

/**
 * Footer content with legend or additional info
 */
const FooterContent = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  color: ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)')};
  text-align: center;
`;

/**
 * Chart SVG icons for type switching
 */
const ChartTypeIcons = {
  bar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 18V7M12 18V11M16 18V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  line: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 14L8 10L12 14L20 6M20 6V12M20 6H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  area: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 14L8 10L12 14L20 6M20 6V12M20 6H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 14V20H20V6L12 14L8 10L4 14Z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  ),
  pie: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 12V2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12L19 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12L8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

// Add this helper function to ensure we have a properly typed theme
const ensureValidTheme = (themeInput: any): DefaultTheme => {
  // If the theme is already a valid DefaultTheme, return it
  if (
    themeInput && 
    typeof themeInput === 'object' && 
    'isDarkMode' in themeInput && 
    'colorMode' in themeInput && 
    'themeVariant' in themeInput && 
    'colors' in themeInput && 
    'zIndex' in themeInput
  ) {
    return themeInput as DefaultTheme;
  }
  
  // Otherwise, create a new theme object
  return {
    isDarkMode: false,
    colorMode: 'light',
    themeVariant: 'nebula',
    colors: {
      nebula: {
        accentPrimary: '#6366F1',
        accentSecondary: '#8B5CF6',
        accentTertiary: '#EC4899',
        stateCritical: '#EF4444',
        stateOptimal: '#10B981',
        stateAttention: '#F59E0B',
        stateInformational: '#3B82F6',
        neutralBackground: '#F9FAFB',
        neutralForeground: '#1F2937',
        neutralBorder: '#E5E7EB',
        neutralSurface: '#FFFFFF'
      },
      glass: {
        light: {
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          highlight: 'rgba(255, 255, 255, 0.3)',
          shadow: 'rgba(0, 0, 0, 0.1)',
          glow: 'rgba(255, 255, 255, 0.2)'
        },
        dark: {
          background: 'rgba(0, 0, 0, 0.2)',
          border: 'rgba(255, 255, 255, 0.1)',
          highlight: 'rgba(255, 255, 255, 0.1)',
          shadow: 'rgba(0, 0, 0, 0.3)',
          glow: 'rgba(255, 255, 255, 0.1)'
        },
        tints: {
          primary: 'rgba(99, 102, 241, 0.1)',
          secondary: 'rgba(139, 92, 246, 0.1)'
        }
      }
    },
    zIndex: {
      hide: -1,
      auto: 'auto',
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      skipLink: 1600,
      toast: 1700,
      tooltip: 1800,
      glacial: 9999
    }
  };
};

/**
 * Helper function to transform Chart.js data format to ChartSeries[]
 */
const transformChartJsData = (chartJsData: any): ChartSeries[] => {
  if (!chartJsData || !Array.isArray(chartJsData.datasets) || !Array.isArray(chartJsData.labels)) {
    // Return empty or handle error if format is unexpected
    // console.warn('Invalid data format passed to transformChartJsData');
    return []; 
  }

  return chartJsData.datasets.map((dataset: any, index: number) => ({
    id: dataset.id || `dataset-${index}`,
    name: dataset.label || `Dataset ${index + 1}`,
    color: dataset.borderColor || dataset.backgroundColor, // Use borderColor or backgroundColor as series color
    data: dataset.data.map((value: number, pointIndex: number) => ({
      // Use value directly if data is just numbers
      // Use point object if data is {x, y} or similar (needs adjustment if x is not index)
      // Assuming simple numeric data corresponding to labels for now
      value: value,
      label: chartJsData.labels[pointIndex] || `Point ${pointIndex + 1}`,
      // Optionally include original point data if needed: ...point 
    })),
    // Add other potential ChartSeries properties if needed
    // visible: dataset.hidden !== undefined ? !dataset.hidden : true,
  }));
};

// Mock implementation for useGlassPerformance
const useGlassPerformance = () => ({
  isPerformanceConstrained: false,
  canUseBlur: true,
  canUseGlassEffects: true,
  canUseAdvancedAnimations: true,
  isPoorPerformance: false
});

/**
 * GlassChart Component
 */
export const GlassChart = forwardRef<GlassChartRef, GlassChartProps>(({
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
  className,
  theme: providedTheme,
}, ref) => {
  // Get theme from context or use the provided theme, and ensure it's valid
  const contextTheme = useTheme();
  const theme = ensureValidTheme(providedTheme || contextTheme);

  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Get device performance capabilities
  const performanceContext = useGlassPerformance();
  const isLowPerformanceDevice = performanceContext?.isPoorPerformance || false;

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

  // Use depth animation if enabled
  const zAnimationResult = useZSpaceAnimation({
    plane: 'midground', // Use standard options
    interactive: true,
    intensity: 0.2,
    perspectiveDepth: 1000,
    duration: 0.5,
  });

  // Store animation functions in a ref to avoid recreation
  const animationFunctionsRef = useRef({
    animate: () => {
      // Set a custom position to create animation effect
      zAnimationResult.setCustomPosition(0, 10, 20);
      setTimeout(() => zAnimationResult.reset(), 500);
    }
  });

  // Update the ref when zAnimationResult changes
  useEffect(() => {
    animationFunctionsRef.current.animate = () => {
      zAnimationResult.setCustomPosition(0, 10, 20);
      setTimeout(() => zAnimationResult.reset(), 500);
    };
  }, [zAnimationResult]);

  const depthStyles = zAnimationResult.style;

  // Flag to know if original data was Chart.js format
  const isChartJsDataFormat = useMemo(() => 
    data && typeof data === 'object' && !Array.isArray(data) && data.datasets && data.labels,
    [data]
  );

  // Prepare data for non-pie charts (target: ChartSeries[])
  const chartSeriesData = useMemo(() => {
    if (isChartJsDataFormat) {
      return transformChartJsData(data);
    }
    // If not Chart.js format, assume it might be ChartSeries[] or SeriesDataPoint[]
    // We'll let child components (like LineChart) handle SeriesDataPoint[] case if needed
    return data as ChartSeries[]; // Assume ChartSeries[] for typing here
  }, [data, isChartJsDataFormat]);

  // --- Handler Functions ---
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
        animationFunctionsRef.current.animate();
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

  // --- Imperative Handle (Moved After Handlers) ---
  useImperativeHandle(ref, () => ({
    getContainerElement: () => containerRef.current,
    getCurrentChartType: () => currentType,
    setChartType: (newType) => {
      if (availableTypes.includes(newType)) {
        handleTypeChange(newType);
      }
    },
    setActiveTab: (tabId) => {
      if (tabs?.some(tab => tab.id === tabId)) {
        handleTabChange(tabId);
      }
    },
    downloadChart: () => {
      if (allowDownload) {
        handleDownload();
      }
    },
    toggleFocusMode: () => {
      if (focusMode) {
        handleFocusToggle();
      }
    },
  }), [
    containerRef, 
    currentType, 
    availableTypes, 
    handleTypeChange, // Dependency
    tabs, 
    handleTabChange,  // Dependency
    allowDownload, 
    handleDownload,   // Dependency
    focusMode, 
    handleFocusToggle // Dependency
  ]);

  // Call the magnetic effect hook directly at component level
  const magneticEffectProps = magneticEffect && !prefersReducedMotion ? {
    type: 'magnetic' as const,
    strength: magneticStrength,
    radius: 200,
    maxDisplacement: 10,
    affectsRotation: false,
    affectsScale: false,
    smooth: true,
  } : null;

  // Always call the hook, but conditionally pass null
  const magneticProps = useMouseMagneticEffect<HTMLDivElement>(
    magneticEffectProps || {
      type: 'magnetic' as const,
      strength: 0,
      radius: 0,
      maxDisplacement: 0,
      affectsRotation: false,
      affectsScale: false,
      smooth: false,
    }
  );

  // Render chart based on type and simplified mode
  const renderChart = useCallback(() => {
    // Prepare props common to most charts
    const commonProps = {
      // We'll override data prop specifically where needed
      width: '100%',
      height: '100%',
      glass,
      title: undefined,
      description: undefined,
      adaptToCapabilities,
      simplified: useSimplified,
      onError,
      ...chartProps,
    };

    // Handle Pie/Doughnut data preparation separately (target: SeriesDataPoint[])
    if (currentType === 'pie') { // Add doughnut later if needed
      let pieData: SeriesDataPoint[] = [];

      if (isChartJsDataFormat) {
        const firstDataset = data.datasets[0];
        if (firstDataset && Array.isArray(firstDataset.data)) {
          pieData = firstDataset.data.map((value: number, index: number) => ({
            label: data.labels[index] || `Slice ${index + 1}`,
            value: value,
            color: Array.isArray(firstDataset.backgroundColor) 
                     ? firstDataset.backgroundColor[index % firstDataset.backgroundColor.length] 
                     : firstDataset.backgroundColor, 
          }));
        }
      } else if (Array.isArray(data) && data.length > 0 && data[0].value !== undefined) {
        // Check if input data looks like SeriesDataPoint[] directly
        pieData = data as SeriesDataPoint[];
      } else if (Array.isArray(chartSeriesData) && chartSeriesData.length > 0) {
        // If input was ChartSeries[], extract data from the first series
        pieData = chartSeriesData[0].data;
      }
      
      if (useSimplified) {
         return <SimpleChart type="pie" data={pieData} {...commonProps} />;
      }
      return <PieChart {...commonProps} data={pieData} />;
    }
    
    // Handle other chart types, passing chartSeriesData
    const chartDataForOtherTypes = chartSeriesData;

    if (useSimplified) {
      return (
        <SimpleChart
          type={currentType}
          data={chartDataForOtherTypes} // Pass ChartSeries[] to SimpleChart
          {...commonProps}
        />
      );
    }

    switch (currentType) {
      case 'bar':
        return <BarChart {...commonProps} data={chartDataForOtherTypes} />;
      case 'line':
        return <LineChart {...commonProps} data={chartDataForOtherTypes} />;
      case 'area':
        const { fillArea, ...otherAreaProps } = chartProps;
        return <AreaChart {...commonProps} data={chartDataForOtherTypes} {...otherAreaProps} />;
      // Pie case handled above
      default:
        // Fallback or handle scatter etc.
        return <BarChart {...commonProps} data={chartDataForOtherTypes} />;
    }
  // Separate dependencies for chartSeriesData calculation from renderChart
  }, [currentType, isChartJsDataFormat, data, chartSeriesData, glass, chartProps, useSimplified, adaptToCapabilities, onError]); 

  return (
    <ChartContainer
      ref={(element: HTMLDivElement | null) => { 
        // Assign to internal ref
        containerRef.current = element; 
        // Assign to magnetic ref if it exists
        if (magneticProps && magneticProps.ref) {
          (magneticProps.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
        }
      }}
      zElevation={zElevation}
      width={width}
      height={height}
      theme={theme}
      focused={isFocused}
      style={{
        ...style,
        ...(magneticProps ? magneticProps.style : {}),
        ...(isFocused && depthAnimation ? depthStyles : {}),
      }}
      className={className}
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
            {tabs?.length ? (
              <TabsContainer>
                <EnhancedGlassTabs
                  tabs={tabs}
                  activeTab={currentTab}
                  onChange={handleTabChange}
                  size="small"
                  color="primary"
                  variant="default"
                  showIndicator={true}
                  physicsEnabled={false} // Disable physics to prevent loops
                />
              </TabsContainer>
            ) : null}

            {/* Action buttons toolbar */}
            <ToolbarContainer>
              {allowTypeSwitch && (
                <>
                  {availableTypes.includes('bar') && (
                    <ChartTypeButton
                      active={currentType === 'bar'}
                      onClick={() => handleTypeChange('bar')}
                      title="Bar chart"
                      theme={theme}
                    >
                      {ChartTypeIcons.bar}
                    </ChartTypeButton>
                  )}
                  {availableTypes.includes('line') && (
                    <ChartTypeButton
                      active={currentType === 'line'}
                      onClick={() => handleTypeChange('line')}
                      title="Line chart"
                      theme={theme}
                    >
                      {ChartTypeIcons.line}
                    </ChartTypeButton>
                  )}
                  {availableTypes.includes('area') && (
                    <ChartTypeButton
                      active={currentType === 'area'}
                      onClick={() => handleTypeChange('area')}
                      title="Area chart"
                      theme={theme}
                    >
                      {ChartTypeIcons.area}
                    </ChartTypeButton>
                  )}
                  {availableTypes.includes('pie') && (
                    <ChartTypeButton
                      active={currentType === 'pie'}
                      onClick={() => handleTypeChange('pie')}
                      title="Pie chart"
                      theme={theme}
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
                  theme={theme}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 10L12 15L17 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15V3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </ChartTypeButton>
              )}

              {/* Custom toolbar items */}
              {toolbarItems}
            </ToolbarContainer>
          </ChartControls>
        )}

        {/* Main chart content */}
        <ChartContent focused={isFocused}>{renderChart()}</ChartContent>

        {/* Footer content (optional) */}
        {isFocused && <FooterContent>Click to exit focused view</FooterContent>}
      </div>
    </ChartContainer>
  );
});

// Add displayName
GlassChart.displayName = 'GlassChart';

export default GlassChart;
