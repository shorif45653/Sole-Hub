import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactRefreshPlugin from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules', '.env*', '*.config.js'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        browser: true,
        es2022: true,
        node: true,
        React: 'readonly',
        JSX: 'readonly',
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        Intl: 'readonly',
        URLSearchParams: 'readonly',
        clearTimeout: 'readonly',
        setTimeout: 'readonly',
      },
    },
    settings: { react: { version: '18.2' } },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-useless-escape': 'off',
    },
  },
]