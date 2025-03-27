# Galileo Glass UI - Minimal Distribution

This is the minimal distribution of Galileo Glass UI, providing essential components with minimal dependencies.

## Quick Start

```jsx
import React from 'react';
import { ThemeProvider, Card, Button } from 'galileo-glass-ui-minimal';

function App() {
  return (
    <ThemeProvider>
      <Card>
        <h2>Hello Galileo Glass!</h2>
        <p>This is a minimal glass UI component</p>
        <Button>Click Me</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## Available Components

This minimal distribution includes:

- **ThemeProvider**: Required for styling components
- **Card**: A basic glass panel component
- **Button**: A simple button with glass styling

## Upgrading to Full Version

If you need more components, install the full version:

```bash
npm uninstall galileo-glass-ui-minimal
npm install github:VeerOneGPT/galileo-glass-ui#prebuild styled-components
```

See MINIMAL.md for more details.

## License

MIT