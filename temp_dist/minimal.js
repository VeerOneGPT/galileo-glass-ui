'use strict';

// This is a minimal placeholder that re-exports just the basic components
// with minimum dependencies for faster installation and simpler usage

var React = require('react');
var createContext = React.createContext;
var styledComponents = require('styled-components');
var Button = require('./components/Button.js').Button;
var Card = require('./components/Card.js').Card;

// Default theme
var defaultTheme = {
  colors: {
    primary: '#3f51b5',
    secondary: '#f50057',
    text: '#333333',
    background: 'rgba(255, 255, 255, 0.85)'
  },
  borderRadius: '4px',
  spacing: function(factor) { return factor * 8 + 'px'; },
  glass: {
    blur: '10px',
    transparency: 0.7
  }
};

// Minimal ThemeProvider
var ThemeContext = createContext(defaultTheme);

var ThemeProvider = function(props) {
  var children = props.children;
  var theme = props.theme || defaultTheme;
  var mergedTheme = Object.assign({}, defaultTheme, theme);
  return styledComponents.jsx(ThemeContext.Provider, { value: mergedTheme, children: children });
};

exports.Button = Button;
exports.Card = Card;
exports.ThemeProvider = ThemeProvider;
exports.ThemeContext = ThemeContext;
exports.default = { Button: Button, Card: Card, ThemeProvider: ThemeProvider, ThemeContext: ThemeContext };