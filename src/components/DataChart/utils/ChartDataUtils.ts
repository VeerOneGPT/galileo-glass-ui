/**
 * ChartDataUtils - Utilities for processing chart data
 */
import { ChartType } from 'chart.js';
import { ChartDataset , ChartAnimationOptions } from '../types';

/**
 * Helper function to generate chart dataset colors
 */
export const generateColors = (count: number, palette: string[], baseOpacity = 0.7): string[] => {
  // If palette has enough colors, use them
  if (palette.length >= count) {
    return palette.slice(0, count);
  }
  
  // Otherwise, generate colors based on the palette
  const colors: string[] = [...palette];
  
  // Generate more colors by adjusting lightness of palette colors
  while (colors.length < count) {
    const baseColor = palette[colors.length % palette.length];
    
    // Convert hex to rgba with adjusted alpha
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Adjust the alpha based on how many times we've cycled through the palette
    const cycleCount = Math.floor(colors.length / palette.length);
    const adjustedOpacity = Math.max(0.3, baseOpacity - cycleCount * 0.15);
    
    colors.push(`rgba(${r}, ${g}, ${b}, ${adjustedOpacity})`);
  }
  
  return colors;
};

/**
 * Convert hex color to RGB components
 */
export const hexToRgb = (hex: string): string => {
  // Provide a default color if hex is undefined or invalid
  const safeHex = hex?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? hex : '#FFFFFF';
  
  // Parse the hex code
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(safeHex);
  
  // Return RGB components as string
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255';
};

/**
 * Helper to convert dataset to Chart.js format with enhanced styling
 */
export const convertToChartJsDataset = (
  dataset: ChartDataset, 
  index: number, 
  chartType: ChartType | string,
  palette: string[],
  animations?: ChartAnimationOptions
) => {
  const { id, label, data, style, useRightYAxis, order, hidden } = dataset;
  
  // Generate color from palette if not specified with fallback
  const baseColor = style?.lineColor || (palette[index % palette.length] || '#6366F1');
  const fillColor = style?.fillColor || baseColor;
  
  // Line dash settings based on style
  let lineDash: number[] = [];
  if (style?.lineStyle === 'dashed') {
    lineDash = [5, 5];
  } else if (style?.lineStyle === 'dotted') {
    lineDash = [2, 2];
  }
  
  // Make values for optional numeric properties safe
  const safeLineWidth = style?.lineWidth || 2;
  const safePointSize = style?.pointSize || 3;
  const safeOrder = order || index;
  
  // Ensure fill opacity is a valid number
  const safeFillOpacity = style?.fillOpacity !== undefined && !isNaN(style.fillOpacity) 
    ? Math.max(0, Math.min(1, style.fillOpacity)) 
    : 0.4;
  
  // Common dataset properties with safe defaults
  const baseDataset = {
    id,
    label,
    data: data.map(point => ({ 
      x: point.x, 
      y: point.y,
      extra: point.extra
    })),
    backgroundColor: fillColor,
    borderColor: style?.lineColor || baseColor,
    pointBackgroundColor: style?.pointColor || baseColor,
    borderWidth: safeLineWidth,
    pointRadius: safePointSize,
    pointStyle: style?.pointStyle || 'circle',
    order: safeOrder,
    hidden: hidden || false,
    yAxisID: useRightYAxis ? 'y1' : 'y',
    borderDash: lineDash,
    hoverBorderWidth: safeLineWidth + 1,
    hoverBorderColor: style?.glowEffect ? baseColor : undefined,
    hoverBackgroundColor: style?.glowEffect ? baseColor : undefined,
    tension: 0.4, // Smooth lines a bit
  };
  
  // Type-specific properties
  switch (chartType) {
    case 'line':
      return {
        ...baseDataset,
        fill: safeFillOpacity > 0,
        backgroundColor: safeFillOpacity > 0 
          ? `${baseColor}${Math.round(safeFillOpacity * 255).toString(16).padStart(2, '0')}` 
          : 'transparent',
      };
      
    case 'bar':
      return {
        ...baseDataset,
        borderRadius: 4,
        hoverBackgroundColor: style?.glowEffect ? `${baseColor}E6` : `${baseColor}CC`,
      };
      
    case 'area':
      // Area is a custom type that maps to 'line' with fill
      return {
        ...baseDataset,
        fill: true,
        type: 'line' as ChartType, // Explicitly cast to ChartType
        backgroundColor: Array.isArray(fillColor) 
          ? { colors: fillColor }
          : typeof fillColor === 'string'
            ? `${fillColor}${Math.round((safeFillOpacity) * 255).toString(16).padStart(2, '0')}`
            : fillColor,
      };
      
    case 'bubble':
      return {
        ...baseDataset,
        pointRadius: data.map(point => (point.y === null ? 0 : (point.y / 10) + 5)),
        hoverRadius: data.map(point => (point.y === null ? 0 : (point.y / 10) + 7)),
      };
      
    case 'pie':
    case 'doughnut':
      return {
        ...baseDataset,
        backgroundColor: data.map((point, i) => 
          point.color || palette[i % palette.length] || palette[0] || '#6366F1'
        ),
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        hoverOffset: 10,
      };
      
    case 'radar':
      return {
        ...baseDataset,
        fill: true,
        backgroundColor: `${baseColor}66`,
      };
      
    case 'polarArea':
      return {
        ...baseDataset,
        backgroundColor: data.map((point, i) => 
          `${point.color || palette[i % palette.length] || palette[0] || '#6366F1'}C0`
        ),
      };
      
    default:
      return baseDataset;
  }
};

/**
 * Enhanced conversion with physics-based animation effects
 */
export const convertToChartJsDatasetWithEffects = (
  dataset: ChartDataset, 
  index: number, 
  chartType: ChartType | string,
  palette: string[],
  animations?: ChartAnimationOptions
) => {
  const baseDataset = convertToChartJsDataset(dataset, index, chartType, palette, animations);
  
  // Add SVG filter effects based on chart type
  if (chartType === 'line' || chartType === 'area') {
    return {
      ...baseDataset,
      borderWidth: dataset.style?.lineWidth || 2,
      // Use the SVG filter for the line if glow effect is enabled
      borderColor: dataset.style?.glowEffect 
        ? palette[index % palette.length] || '#6366F1'
        : baseDataset.borderColor,
      // Sequential animation delays based on dataset index
      animation: {
        delay: index * (animations?.staggerDelay || 100),
      }
    };
  }
  
  // Add enhanced effects for bar charts
  if (chartType === 'bar') {
    return {
      ...baseDataset,
      // Add glass-like effects for bars
      borderRadius: dataset.style?.glassEffect ? 8 : 4,
      // Add glow effect for bars
      hoverBackgroundColor: dataset.style?.glowEffect 
        ? `${palette[index % palette.length] || '#6366F1'}E6` 
        : baseDataset.hoverBackgroundColor,
      // Sequential animation delays
      animation: {
        delay: index * (animations?.staggerDelay || 50),
      }
    };
  }
  
  return baseDataset;
}; 