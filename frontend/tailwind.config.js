/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'custom-indigo': '#4B5EAA',
        'custom-purple': '#6B46C1',
      },
    },
  },
  plugins: [],
};