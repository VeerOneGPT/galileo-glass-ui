// This is a minimal placeholder that re-exports just the basic components
// with minimum dependencies for faster installation and simpler usage

import React, { createContext } from 'react';
import { jsx } from 'styled-components';
import { Button } from './components/Button.esm.js';
import { Card } from './components/Card.esm.js';

// Default theme
const defaultTheme = {
  colors: {
    primary: '#3f51b5',
    secondary: '#f50057',
    text: '#333333',
    background: 'rgba(255, 255, 255, 0.85)'
  },
  borderRadius: '4px',
  spacing: (factor) => `${factor * 8}px`,
  glass: {
    blur: '10px',
    transparency: 0.7
  }
};

// Minimal ThemeProvider
const ThemeContext = createContext(defaultTheme);

const ThemeProvider = ({ children, theme = defaultTheme }) => {
  const mergedTheme = { ...defaultTheme, ...theme };
  return jsx(ThemeContext.Provider, { value: mergedTheme, children });
};

export { Button, Card, ThemeProvider, ThemeContext };
export default { Button, Card, ThemeProvider, ThemeContext };