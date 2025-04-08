import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';

const config: StorybookConfig = {
  "stories": [
    "../examples/**/*.mdx",
    "../examples/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-webpack5-compiler-swc",
    {
      "name": "@storybook/addon-essentials",
      "options": {
        "docs": false
      }
    },
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "storybook-addon-performance"
  ],
  "framework": {
    "name": "@storybook/react-webpack5",
    "options": {}
  },
  // Add typescript config to disable react-docgen
  typescript: {
    reactDocgen: false,
    // Optionally, you can specify the checker if needed, but false is usually enough
    // check: false, 
  },
  webpackFinal: async (config) => {
    // Ensure resolve and plugins exist
    config.resolve = config.resolve || {};
    config.resolve.plugins = config.resolve.plugins || [];
    config.plugins = config.plugins || []; // Ensure plugins array exists

    // Comment out the TsconfigPathsPlugin addition
    // config.resolve.plugins.push(
    //   new TsconfigPathsPlugin({
    //     extensions: config.resolve.extensions,
    //   })
    // );

    // Add fallback for 'buffer'
    config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        "buffer": require.resolve("buffer/"),
    };

    // Add ProvidePlugin for Buffer
    config.plugins.push(
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    );

    return config; // Return the modified config
  },
};
export default config;