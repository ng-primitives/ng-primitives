const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'sans-serif'],
      },
      colors: {
        primary: {
          25: '#ffd6b6',
          50: '#fcf5ef',
          100: '#f9eccd',
          200: '#f5dfb7',
          300: '#f2d0a0',
          400: '#efc796',
          500: '#ecc38c',
          600: '#eab787',
          700: '#e7ad7d',
          800: '#e4a372',
          900: '#e19863',
        },
      },
    },
  },
  plugins: [],
};
