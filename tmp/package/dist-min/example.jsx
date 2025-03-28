import React from 'react';
import { ThemeProvider, Card, Button } from 'galileo-glass-ui-minimal';

// Simple example component showing how to use the minimal version
function GlassExample() {
  return (
    <ThemeProvider>
      <div style={{ padding: '2rem', background: 'linear-gradient(45deg, #f3f4f6, #dbeafe)' }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>Galileo Glass UI - Minimal Example</h2>
          <p>This is a minimal example using the core components</p>
          <Button>Click Me</Button>
        </Card>
      </div>
    </ThemeProvider>
  );
}

export default GlassExample;