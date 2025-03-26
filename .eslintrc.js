module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  plugins: [
    'react',
    '@typescript-eslint',
    'react-hooks',
    'prettier',
    'import',
    'jsx-a11y',
    'testing-library'
  ],
  settings: {
    react: {
      version: 'detect'
    },
    'testing-library/custom-queries': {
      'data-testid': 'data-testid'
    },
    'testing-library/custom-renders': {
      'render': 'render'
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    'prettier/prettier': 'error',
    'react/prop-types': 'off', // We're using TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_'
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import plugin rules
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'import/order': ['warn', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
    }],
    
    // jsx-a11y rules
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/alt-text': 'error',
    
    // Turn off testing-library rules until properly set up
    'testing-library/await-async-query': 'off',
    'testing-library/no-await-sync-query': 'off',
    'testing-library/no-render-in-setup': 'off'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['warn']
      }
    },
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
      env: {
        jest: true
      },
      extends: [
        'plugin:testing-library/react'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'testing-library/prefer-screen-queries': 'warn',
        'testing-library/prefer-find-by': 'warn',
        'testing-library/no-wait-for-multiple-assertions': 'warn',
        'testing-library/await-async-query': 'off',
        'testing-library/no-await-sync-query': 'off',
        'testing-library/no-render-in-setup': 'off'
      }
    }
  ]
};