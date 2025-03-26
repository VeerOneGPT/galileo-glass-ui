/**
 * CSS Vendor Prefix Declarations
 * 
 * This file extends the built-in CSSStyleDeclaration interface to support
 * vendor-prefixed CSS properties used in the Galileo Glass UI library.
 */

declare interface CSSStyleDeclaration {
  // The WebkitBackdropFilter CSS property with PascalCase naming
  WebkitBackdropFilter: string;
  
  // The webkit backdrop filter property with kebab case using indexing
  ['-webkit-backdrop-filter']: string;
  
  // The webkitBackdropFilter property with camelCase naming
  webkitBackdropFilter: string;
  
  // Additional WebKit prefixed properties
  WebkitAppearance: string;
  webkitAppearance: string;
  
  WebkitFontSmoothing: string;
  webkitFontSmoothing: string;
  
  WebkitTextFillColor: string; 
  webkitTextFillColor: string;
  
  WebkitTextStroke: string;
  webkitTextStroke: string;
  
  WebkitMaskImage: string;
  webkitMaskImage: string;
  
  WebkitBoxShadow: string;
  webkitBoxShadow: string;
  
  // Backface visibility properties (all cases)
  backfaceVisibility: string;
  WebkitBackfaceVisibility: string;
  webkitBackfaceVisibility: string;
  ['-webkit-backface-visibility']: string;
  
  // Mozilla prefixed properties
  MozAppearance: string;
  mozAppearance: string;
  
  MozOsxFontSmoothing: string;
  mozOsxFontSmoothing: string;
  
  MozBackdropFilter: string;
  mozBackdropFilter: string;
  
  MozBackfaceVisibility: string;
  mozBackfaceVisibility: string;
  ['-moz-backface-visibility']: string;
}