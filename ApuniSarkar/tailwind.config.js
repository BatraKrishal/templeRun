/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navbar: {
          DEFAULT: '#0e3d6e',
          dark: '#082545',
          divider: 'rgba(255, 255, 255, 0.15)',
        },
        primary: {
          DEFAULT: '#8c431d',
          hover: '#733414',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f7e6d5',
          foreground: '#8c431d',
        },
        accent: {
          DEFAULT: '#8c431d',
          hover: '#733414',
          foreground: '#ffffff',
        },
        ink: {
          900: '#0f172a',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          300: '#cbd5e1',
          100: '#94a3b8',
        },
        ring: '#8c431d',
        uk: {
          saffron: '#f58220',
          green: '#2A7A4B',
          blue: '#3568A8',
          gold: '#B8860B',
          lightOrange: '#FFE8D6',
          lightGreen: '#DCEEDE',
          lightBlue: '#DCE8F7',
          lightGold: '#F8EFD0',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Noto Sans Devanagari',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
