/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#52c2ef",
          50: "#f0f9fd",
          100: "#e0f2fa",
          200: "#b8e5f6",
          300: "#7fd0ef",
          400: "#3eb0e0",
          500: "#52c2ef",
          600: "#1a92c4",
          700: "#17759f",
          800: "#166384",
          900: "#16526e",
        },
        secondary: {
          DEFAULT: "#6690a3",
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        accent: {
          DEFAULT: "#f6ae45",
        },
        brand: {
          primary: "#52c2ef",
          secondary: "#6690a3",
          accent: "#f6ae45",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
