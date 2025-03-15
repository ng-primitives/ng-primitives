const playwright = require('eslint-plugin-playwright');
const baseConfig = require('../../eslint.config.cjs');

module.exports = [
  playwright.configs['flat/recommended'],

  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    // Override or add rules here
    rules: {},
  },
];
