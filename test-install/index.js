import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, Button } from 'galileo-glass-ui';

function App() {
  return (
    <ThemeProvider>
      <Button variant="contained" glass>
        Hello Galileo Glass
      </Button>
    </ThemeProvider>
  );
}

// If this file can be imported without errors, the installation was successful
console.log('Galileo Glass UI was successfully installed!');