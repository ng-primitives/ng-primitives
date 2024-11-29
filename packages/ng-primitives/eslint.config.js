const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.config.cjs');

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
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
      '@angular-eslint/no-host-metadata-property': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@angular-eslint/no-output-rename': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@nx/enforce-module-boundaries': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@angular-eslint/no-output-native': 'off',
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
];
