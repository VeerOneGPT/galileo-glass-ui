/**
 * Chart rendering status enumeration
 */
export enum ChartRenderStatus {
  /**
   * Chart is ready to render
   */
  READY = 'ready',
  
  /**
   * Chart is loading data
   */
  LOADING = 'loading',
  
  /**
   * Chart data is empty
   */
  EMPTY = 'empty',
  
  /**
   * Chart encountered an error
   */
  ERROR = 'error',
  
  /**
   * Chart is rendering
   */
  RENDERING = 'rendering',
  
  /**
   * Chart has been rendered successfully
   */
  RENDERED = 'rendered'
}