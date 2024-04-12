const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, '**/*.{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    extend: {},
  },
  plugins: [],
};
