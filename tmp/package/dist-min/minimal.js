'use strict';

// This is a minimal placeholder that re-exports just the basic components
// to ensure successful installation without heavy dependencies

Object.defineProperty(exports, '__esModule', { value: true });

const React = require('react');
const styled = require('styled-components');

// Basic theme context
const defaultTheme = {
  colors: {
    primary: '#3f51b5',
    secondary: '#f50057',
    background: 'rgba(255, 255, 255, 0.8)',
    text: '#212121'
  },
  glass: {
    opacity: 0.7,
    blur: '10px',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  }
};

const ThemeContext = React.createContext(defaultTheme);

// Minimal ThemeProvider
const ThemeProvider = ({ children, theme }) => {
  return styled.jsx(
    ThemeContext.Provider,
    { value: theme || defaultTheme },
    children
  );
};

// Simple Button implementation
const Button = styled.styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    opacity: 0.9;
  }
`;

// Simple Card implementation
const Card = styled.styled.div`
  background: ${props => props.theme.glass.background || 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(${props => props.theme.glass.blur || '10px'});
  border-radius: 8px;
  border: ${props => props.theme.glass.border || '1px solid rgba(255, 255, 255, 0.3)'};
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

exports.Button = Button;
exports.Card = Card;
exports.ThemeContext = ThemeContext;
exports.ThemeProvider = ThemeProvider;
exports.defaultTheme = defaultTheme;