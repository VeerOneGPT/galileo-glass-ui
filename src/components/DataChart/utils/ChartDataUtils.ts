/**
 * ChartDataUtils - Utilities for processing chart data
 */
import { ChartType } from 'chart.js';
import { ChartDataset, ChartVariant } from '../types/ChartTypes';
import { ChartAnimationOptions } from '../types/ChartProps';

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
  originalVariant: ChartVariant,
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
  
  // Use the ORIGINAL intended variant for switching logic
  switch (originalVariant) {
    case 'line':
      const lineBgColor = typeof fillColor === 'string' && fillColor.startsWith('#') && safeFillOpacity > 0
        ? `rgba(${hexToRgb(fillColor)}, ${safeFillOpacity})`
        : 'transparent';
      return {
        ...baseDataset,
        fill: false, // ONLY false for explicit line charts
        backgroundColor: lineBgColor,
      };
      
    case 'bar':
      // Generate arrays for backgroundColor and hoverBackgroundColor per bar
      const backgroundColors = data.map((point, i) => {
        const color = point.color || palette[i % palette.length] || '#6366F1';
        return typeof color === 'string' && color.startsWith('#') 
          ? `${color}CC` // Apply standard opacity
          : color;      // Use original if not hex (e.g., gradient)
      });

      const hoverBackgroundColors = data.map((point, i) => {
        const color = point.color || palette[i % palette.length] || '#6366F1';
        const baseBg = typeof color === 'string' && color.startsWith('#') ? `${color}CC` : color;
        // Apply glow effect opacity if enabled and color is hex
        return style?.glowEffect && typeof color === 'string' && color.startsWith('#')
          ? `${color}E6` // Higher opacity for glow
          : baseBg;     // Otherwise, use the standard background color
      });

      return {
        ...baseDataset,
        borderRadius: 4,
        backgroundColor: backgroundColors, 
        hoverBackgroundColor: hoverBackgroundColors, 
      };
      
    case 'area':
      const areaBgColor = typeof fillColor === 'string' && fillColor.startsWith('#')
        ? `rgba(${hexToRgb(fillColor)}, ${safeFillOpacity})`
        : fillColor;
      return {
        ...baseDataset,
        fill: true, // Explicitly true for area charts
        backgroundColor: areaBgColor, 
      };
      
    case 'bubble':
      return {
        ...baseDataset,
        pointRadius: data.map(point => (point.y === null ? 0 : (point.y / 10) + 5)),
        hoverRadius: data.map(point => (point.y === null ? 0 : (point.y / 10) + 7)),
      };
      
    case 'pie':
    case 'doughnut':
      // Pie/Doughnut charts need a simpler structure:
      // data: array of numbers
      // backgroundColor: array of colors
      // IMPORTANT: Expects datasets prop to contain ONE dataset, 
      // and its data property to be DataPoint[] where the `y` values are positive numbers.
      // Labels for segments are taken from chartData.labels, which GlassDataChart generates from DataPoint.label or DataPoint.x.
      
      // --- BEGIN MODIFICATION: Aggregate small segments ---
      const MIN_PERCENTAGE_THRESHOLD = 0.005; // 0.5% threshold for aggregation
      const totalValue = data.reduce((sum, point) => sum + (point.y || 0), 0);
      
      const processedData: number[] = [];
      const processedLabels: string[] = [];
      const processedColors: string[] = [];
      let otherValue = 0;
      
      data.forEach((point, i) => {
        const pointValue = point.y || 0;
        const percentage = totalValue > 0 ? pointValue / totalValue : 0;
        
        if (percentage < MIN_PERCENTAGE_THRESHOLD) {
          otherValue += pointValue;
        } else {
          processedData.push(pointValue);
          // Use original label from the data point if available
          processedLabels.push(point.label || `Segment ${i + 1}`); 
          processedColors.push(point.color || palette[i % palette.length] || palette[0] || '#6366F1');
        }
      });
      
      // Add the 'Other' segment if it has aggregated value
      if (otherValue > 0) {
        processedData.push(otherValue);
        processedLabels.push('Other'); 
        // Use a distinct color for 'Other' - maybe a neutral gray?
        processedColors.push('#9CA3AF'); // Example: Tailwind gray-400
      }
      // --- END MODIFICATION ---

      return {
        label: label || `Dataset ${index + 1}`, 
        data: processedData, 
        backgroundColor: processedColors,
        processedLabels: processedLabels,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        hoverOffset: 10,
        order: safeOrder,
        hidden: hidden || false,
        // Conditionally add cutout for doughnut
        ...(originalVariant === 'doughnut' && { cutout: '50%' }), // Add standard cutout
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
      // Default case might need adjustment depending on desired fallback
      // For safety, assume line chart properties if type is unknown
       const defaultBgColor = typeof fillColor === 'string' && fillColor.startsWith('#') && safeFillOpacity > 0
        ? `rgba(${hexToRgb(fillColor)}, ${safeFillOpacity})`
        : 'transparent';
      return { 
          ...baseDataset,
          fill: false, 
          backgroundColor: defaultBgColor 
      };
  }
};

/**
 * Enhanced conversion with physics-based animation effects
 */
export const convertToChartJsDatasetWithEffects = (
  dataset: ChartDataset, 
  index: number, 
  originalVariant: ChartVariant,
  palette: string[],
  animations?: ChartAnimationOptions
) => {
  // Pass the originalVariant down to the base converter
  const baseDataset = convertToChartJsDataset(dataset, index, originalVariant, palette, animations);
  
  // Add SVG filter effects based on original chart type
  if (originalVariant === 'line' || originalVariant === 'area') {
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
  if (originalVariant === 'bar') {
    return {
      ...baseDataset,
      // Add glass-like effects for bars
      borderRadius: dataset.style?.glassEffect ? 8 : 4,
      // Add glow effect for bars - Reference original dataset.style
      hoverBackgroundColor: dataset.style?.glowEffect 
        ? `${palette[index % palette.length] || '#6366F1'}E6` 
        : baseDataset.backgroundColor, // Fallback to base background color if no glow
      // Sequential animation delays
      animation: {
        delay: index * (animations?.staggerDelay || 50),
      }
    };
  }
  
  return baseDataset;
}; 