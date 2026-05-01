/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#064e3b', // Deep Forest Green
        },
        secondary: {
          600: '#d97706',
          700: '#b45309', // Terracotta/Amber
          800: '#92400e',
        },
        warm: {
          50: '#fcfaf7', // Warm Cream/Stone
          100: '#f5f5f4',
        }
      }
    },
  },
  plugins: [],
}
