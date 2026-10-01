import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe1e4',
          500: '#d51924',
          600: '#b5121b',
          700: '#930f17',
          950: '#31060a',
        },
      },
      boxShadow: {
        soft: '0 24px 70px rgba(24, 19, 16, .09)',
        card: '0 12px 32px rgba(24, 19, 16, .07)',
      },
      fontFamily: {
        sans: ['var(--font-arabic)', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-arabic)', 'Arial', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: []
};
export default config;
