/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0f1115',
          900: '#161922',
          800: '#1e222c',
          700: '#2a2f3b',
        },
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          300: '#7fc4ff',
          400: '#3fa9ff',
          500: '#1d8cf0',
          600: '#106fce',
          700: '#0d59a6',
        },
        good: '#2fbf71',
        bad: '#ef4a5f',
        flat: '#9aa3b2',
      },
      fontFamily: {
        sans: [
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,17,21,0.06), 0 1px 12px rgba(15,17,21,0.04)',
      },
    },
  },
  plugins: [],
};
