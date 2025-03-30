/**
 * ChartTooltip Component
 * 
 * A specialized tooltip component for data visualization with glass styling
 * and support for adaptive quality rendering.
 */
import React from 'react';
import {
  TooltipContainer,
  TooltipContent,
  TooltipHeader,
  TooltipRow,
  TooltipLabel,
  TooltipValue,
  DynamicTooltip
} from '../styles/TooltipStyles';
import { QualityTier } from '../hooks/useQualityTier';
import { formatValue } from '../../../components/DataChart/GlassDataChartUtils';
import { ChartDataset } from '../types/ChartTypes';

export interface TooltipData {
  datasetIndex: number;
  dataIndex: number;
  x: number;
  y: number;
  value: {
    dataset: string;
    label: string | number;
    value: number | null;
    color: string;
    extra?: Record<string, any>;
  };
}

export interface ChartTooltipProps {
  /** Data point being hovered */
  tooltipData: TooltipData | null;
  /** Chart datasets for additional context */
  datasets: ChartDataset[];
  /** Base color theme */
  color: string;
  /** Current quality tier */
  qualityTier: QualityTier;
  /** Tooltip style */
  tooltipStyle: 'glass' | 'frosted' | 'tinted' | 'luminous' | 'dynamic';
  /** Whether tooltip follows cursor */
  followCursor?: boolean;
}

/**
 * ChartTooltip Component
 * 
 * Displays data point information in a glass-styled tooltip
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  tooltipData,
  datasets,
  color,
  qualityTier,
  tooltipStyle,
  followCursor = false
}) => {
  if (!tooltipData) return null;

  // Get the data point's format type and options
  const currentDataset = datasets[tooltipData.datasetIndex] || datasets[0];
  const currentDataPoint = currentDataset?.data[tooltipData.dataIndex] || { x: '', y: null };
  
  // Determine the format type with fallbacks
  const formatType = currentDataPoint.formatType || currentDataset.formatType || 'number';
  
  // Merge format options with fallbacks
  const formatOptions = {
    ...(currentDataset.formatOptions || {}),
    ...(currentDataPoint.formatOptions || {}),
  };
  
  // Format the value based on type - with safe default
  const value = tooltipData.value?.value ?? 0;
  const formattedValue = formatValue(
    value,
    formatType as any, 
    formatOptions
  );

  // Ensure position values are numbers with defaults
  const xPos = tooltipData.x ?? 0;
  const yPos = tooltipData.y ?? 0;

  // Handle different tooltip styles
  if (tooltipStyle === 'dynamic') {
    return (
      <DynamicTooltip
        $color={color}
        $quality={qualityTier}
        style={{ 
          left: `${xPos}px`, 
          top: `${yPos - 10}px`,
          pointerEvents: followCursor ? 'none' : 'auto'
        }}
      >
        <TooltipHeader $color={tooltipData.value?.color || '#FFFFFF'}>
          {tooltipData.value?.dataset || 'Data'}
        </TooltipHeader>
        
        <TooltipRow>
          <TooltipLabel>{typeof tooltipData.value?.label === 'string' 
            ? tooltipData.value.label 
            : 'Value'}: </TooltipLabel>
          <TooltipValue $highlighted>{formattedValue}</TooltipValue>
        </TooltipRow>
        
        {tooltipData.value?.extra && Object.entries(tooltipData.value.extra).map(([key, value]) => (
          <TooltipRow key={key}>
            <TooltipLabel>{key}:</TooltipLabel>
            <TooltipValue>{String(value)}</TooltipValue>
          </TooltipRow>
        ))}
      </DynamicTooltip>
    );
  }

  // Standard tooltip style
  return (
    <TooltipContainer
      $tooltipStyle={tooltipStyle}
      $quality={qualityTier as 'low' | 'medium' | 'high'}
      style={{ 
        left: `${xPos}px`, 
        top: `${yPos - 10}px`,
        pointerEvents: followCursor ? 'none' : 'auto'
      }}
    >
      <TooltipContent>
        <TooltipHeader $color={tooltipData.value?.color || '#FFFFFF'}>
          {tooltipData.value?.dataset || 'Data'}
        </TooltipHeader>
        
        <TooltipRow>
          <TooltipLabel>{typeof tooltipData.value?.label === 'string' 
            ? tooltipData.value.label 
            : 'Value'}: </TooltipLabel>
          <TooltipValue $highlighted>{formattedValue}</TooltipValue>
        </TooltipRow>
        
        {tooltipData.value?.extra && Object.entries(tooltipData.value.extra).map(([key, value]) => (
          <TooltipRow key={key}>
            <TooltipLabel>{key}:</TooltipLabel>
            <TooltipValue>{String(value)}</TooltipValue>
          </TooltipRow>
        ))}
      </TooltipContent>
    </TooltipContainer>
  );
};

export default ChartTooltip; 