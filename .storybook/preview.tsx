import React from 'react';
import type { Preview, Decorator } from "@storybook/react";
// Correct path for ThemeProvider based on file listing
import { ThemeProvider } from "../src/theme/ThemeProvider"; 
// Remove imports for theme objects and GlobalStyle as they aren't found/exported directly
// import { lightTheme, darkTheme } from '../src/theme/tokens'; 
// import GlobalStyle from '../src/core/GlobalStyle'; 
// Comment out AnimationProvider as the file wasn't found
// import { AnimationProvider } from '../src/providers/AnimationProvider'; 

// Remove MUI LocalizationProvider import
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

// Import OUR Localization Provider and adapter creator
import { GlassLocalizationProvider } from '../src/components/DatePicker/GlassLocalizationProvider';
import { createDateFnsAdapter } from '../src/components/DatePicker/adapters/dateFnsAdapter';

// Instantiate our internal adapter
const dateFnsAdapterInstance = createDateFnsAdapter();

// Restore ThemeProvider wrapping StoryFn, now wrapped by OUR provider
const withProviders: Decorator = (StoryFn, context) => {
  const { theme: themeKey } = context.globals; // Use theme control value if needed by ThemeProvider
  
  return (
    // Use OUR GlassLocalizationProvider with the created instance
    <GlassLocalizationProvider adapter={dateFnsAdapterInstance}>
      {/* Pass initialColorMode and initialTheme based on the globals */}
      <ThemeProvider 
        initialColorMode={themeKey === 'dark' ? 'dark' : 'light'}
        initialTheme="standard"
      > 
        <StoryFn />
      </ThemeProvider>
    </GlassLocalizationProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light', // Keep this global control
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  // Use the restored decorator
  decorators: [withProviders], 
};

export default preview;