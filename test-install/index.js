// Testing Galileo Glass UI import
import React from 'react';
import { Button, Card, ThemeProvider } from 'galileo-glass-ui';

// Testing that basic components work
console.log('Basic components are available:');
console.log('Button:', typeof Button === 'function');
console.log('Card:', typeof Card === 'function');
console.log('ThemeProvider:', typeof ThemeProvider === 'function');

// If we got this far, the package is successfully installed
console.log('✅ Galileo Glass UI installation test succeeded!');

// For chart components, users would need to:
// npm install chart.js react-chartjs-2

// For physics animations, users would need to:
// npm install react-spring

// For advanced animations, users would need to:
// npm install framer-motion popmotion