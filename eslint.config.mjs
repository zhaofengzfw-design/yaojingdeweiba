import { globalIgnores } from 'eslint/config'
import js from '@eslint/js'

export default [
  globalIgnores(['dist', 'node_modules', '**/components/ui/**']),
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'off',
    },
  },
]
