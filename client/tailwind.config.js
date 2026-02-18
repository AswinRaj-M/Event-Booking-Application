/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable manual dark mode
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a', // Dark background
        foreground: '#ededed', // Light text
        primary: {
          DEFAULT: '#7c3aed', // Violet-600
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#db2777', // Pink-600
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#1f1f1f',
          foreground: '#a1a1aa',
        },
        card: {
          DEFAULT: '#121212',
          foreground: '#ededed',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
