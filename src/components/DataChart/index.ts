/**
 * DataChart Component Exports
 */

// Export the original component
export { GlassDataChart } from './GlassDataChart';

// Export the new modular implementation
export { ModularGlassDataChart } from './ModularGlassDataChart';

// Export types
export type { GlassDataChartProps, GlassDataChartRef } from './types/ChartProps';
export type { ChartVariant, DataPoint, ChartDataset, DatasetStyle } from './types/ChartTypes';

// Export utilities for advanced usage
export * from './utils';

// Export hooks for advanced customization
export * from './hooks';

// Export modular components for advanced usage
export * from './components';