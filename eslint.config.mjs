import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', '.vercel/**', 'build/**', 'dist/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'react/self-closing-comp': 'error',
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  prettierConfig,
];

export default eslintConfig;
