import React from 'react';
import { ThemeProvider, Button, Card } from '@veerone/galileo-glass-ui';

// Example usage of the minimal Galileo Glass UI
function App() {
  return (
    <ThemeProvider>
      <Card style={{ padding: '20px', margin: '20px' }}>
        <h2>Galileo Glass UI - Minimal Example</h2>
        <p>This example uses the minimal build.</p>
        <Button onClick={() => alert('Button clicked!')}>
          Click Me
        </Button>
      </Card>
    </ThemeProvider>
  );
}

export default App;