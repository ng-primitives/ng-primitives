const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.config.cjs');

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.*?.json'],
      },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'ngp',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'ngp',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-class-suffix': 'off',
      '@angular-eslint/component-class-suffix': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@angular-eslint/no-output-rename': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@nx/enforce-module-boundaries': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@nx/workspace-prefer-state': 'error',
      '@nx/workspace-avoid-model': 'error',
      '@nx/workspace-avoid-early-state': 'error',
      '@nx/workspace-prefer-entrypoint-imports': 'error',
      '@nx/workspace-require-state-generic': 'error',
      '@nx/workspace-avoid-state-emit': 'error',
      '@nx/workspace-take-until-destroyed': 'error',
      '@nx/workspace-rxjs-compat': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-empty-pattern': 'off',
      '@angular-eslint/no-uncalled-signals': 'error',
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': 'off',
    },
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
  },
  {
    files: ['./package.json', './generators.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/prefer-standalone': 'off',
    },
  },
];
