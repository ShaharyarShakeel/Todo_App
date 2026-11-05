
import js from '@eslint/js' // Provides recommended JavaScript rules
import globals from 'globals' // Provides browser global variables like window and document
import react from 'eslint-plugin-react' // Provides rules for React
import reactHooks from 'eslint-plugin-react-hooks' // Provides rules for React Hooks

export default [
  // 1. Files/folders to ignore
  // Do not check the dist folder because it contains generated build files
  { ignores: ['dist'] },

  // 2. Rules and environment for React JS/JSX files
  {
    // Apply these rules to all .js and .jsx files
    // **/* means files inside any folder or subfolder
    files: ['**/*.{js,jsx}'],

    // Tell ESLint about our JavaScript environment and syntax
    languageOptions: {
      // Allow browser variables like window, document, and console
      globals: globals.browser,

      // Allow JSX syntax used in React components
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    // React-specific settings
    settings: {
      // Automatically detect the installed React version
      react: { version: 'detect' },
    },

    // Register plugins so ESLint can use their rules
    plugins: {
      react, // React-related rules
      'react-hooks': reactHooks, // React Hooks-related rules
    },

    // Define which rules ESLint should follow
    rules: {
      // Add recommended JavaScript rules
      ...js.configs.recommended.rules,

      // Add recommended React rules
      ...react.configs.recommended.rules,

      // Add rules for the modern React JSX runtime
      // This allows JSX without importing React in every file
      ...react.configs['jsx-runtime'].rules,

      // Add recommended rules for React Hooks
      ...reactHooks.configs.recommended.rules,

      // Disable the rule that requires PropTypes
      // We are not using PropTypes for our component props
      'react/prop-types': 'off',
    },
  },
]
