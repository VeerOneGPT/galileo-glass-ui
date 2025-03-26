/**
 * CSS Vendor Prefix Declarations
 *
 * This file extends the built-in CSSStyleDeclaration interface to support
 * vendor-prefixed CSS properties used in the Galileo Glass UI library.
 *
 * IMPORTANT: When working with styled-components:
 * - Use kebab-case for CSS properties in template literals (`-webkit-backdrop-filter`)
 * - Use camelCase for inline styles (webkitBackdropFilter)
 * - Do not use PascalCase in actual CSS code
 */

declare interface CSSStyleDeclaration {
  /**
   * Backdrop filter property for Webkit browsers
   * In styled-components use: `-webkit-backdrop-filter: blur(10px);`
   * In inline styles use: `style={{ webkitBackdropFilter: 'blur(10px)' }}`
   */
  webkitBackdropFilter: string;

  /**
   * Kebab-case access for backdrop filter via index notation
   * This is the preferred way to use in styled-components
   */
  ['-webkit-backdrop-filter']: string;

  /**
   * Font smoothing property for Webkit browsers
   * In styled-components use: `-webkit-font-smoothing: antialiased;`
   */
  webkitFontSmoothing: string;
  ['-webkit-font-smoothing']: string;

  /**
   * Text fill color property for Webkit browsers
   * In styled-components use: `-webkit-text-fill-color: transparent;`
   */
  webkitTextFillColor: string;
  ['-webkit-text-fill-color']: string;

  /**
   * Text stroke property for Webkit browsers
   * In styled-components use: `-webkit-text-stroke: 1px black;`
   */
  webkitTextStroke: string;
  ['-webkit-text-stroke']: string;

  /**
   * Mask image property for Webkit browsers
   * In styled-components use: `-webkit-mask-image: url('mask.svg');`
   */
  webkitMaskImage: string;
  ['-webkit-mask-image']: string;

  /**
   * Box shadow property for Webkit browsers
   * In styled-components use: `-webkit-box-shadow: 0 0 10px rgba(0,0,0,0.5);`
   */
  webkitBoxShadow: string;
  ['-webkit-box-shadow']: string;

  /**
   * Appearance property for Webkit browsers
   * In styled-components use: `-webkit-appearance: none;`
   */
  webkitAppearance: string;
  ['-webkit-appearance']: string;

  /**
   * Backface visibility property
   * In styled-components use: `backface-visibility: hidden;`
   * For Webkit: `-webkit-backface-visibility: hidden;`
   */
  backfaceVisibility: string;
  webkitBackfaceVisibility: string;
  ['-webkit-backface-visibility']: string;

  /**
   * Mozilla-specific properties
   * Use kebab-case in styled-components: `-moz-osx-font-smoothing: grayscale;`
   */
  mozOsxFontSmoothing: string;
  ['-moz-osx-font-smoothing']: string;

  /**
   * Mozilla appearance property
   * In styled-components use: `-moz-appearance: none;`
   */
  mozAppearance: string;
  ['-moz-appearance']: string;

  /**
   * Mozilla backface visibility
   * In styled-components use: `-moz-backface-visibility: hidden;`
   */
  mozBackfaceVisibility: string;
  ['-moz-backface-visibility']: string;
}
