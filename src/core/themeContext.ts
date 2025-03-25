/**
 * Theme Context Creator for Glass UI
 */

/**
 * Creates a theme context object for use with Glass mixins
 */
export const createThemeContext = (theme: any, forceDarkMode = false) => {
  // If there's no theme, return a basic context
  if (!theme) {
    return {
      isDarkMode: forceDarkMode || false,
      getColor: (path: string, fallback: string) => fallback,
      getShadow: (level: number, color: string) => `0 ${level * 2}px ${level * 4}px rgba(0, 0, 0, 0.1)`,
      getSpacing: (size: number) => `${size * 8}px`,
      getBreakpoint: (name: string) => 0,
    };
  }
  
  // Get the color mode from the theme or use forceDarkMode
  const isDarkMode = forceDarkMode || (theme.palette?.mode === 'dark');
  
  // Create the context with theme-aware getters
  return {
    theme,
    isDarkMode,
    
    // Get a color from the theme by path
    getColor: (path: string, fallback: string) => {
      const parts = path.split('.');
      let value = theme;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          return fallback;
        }
      }
      
      return typeof value === 'string' ? value : fallback;
    },
    
    // Get a shadow from the theme
    getShadow: (level: number, color: string) => {
      if (theme.shadows && Array.isArray(theme.shadows) && theme.shadows[level]) {
        return theme.shadows[level];
      }
      
      return `0 ${level * 2}px ${level * 4}px rgba(0, 0, 0, 0.1)`;
    },
    
    // Get spacing from the theme
    getSpacing: (size: number) => {
      if (typeof theme.spacing === 'function') {
        return theme.spacing(size);
      }
      
      if (typeof theme.spacing === 'number') {
        return `${theme.spacing * size}px`;
      }
      
      return `${size * 8}px`;
    },
    
    // Get a breakpoint from the theme
    getBreakpoint: (name: string) => {
      if (theme.breakpoints?.values && theme.breakpoints.values[name]) {
        return theme.breakpoints.values[name];
      }
      
      const breakpoints: Record<string, number> = {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      };
      
      return breakpoints[name] || 0;
    },
  };
};