/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        stonewarm: {
          50: '#FAF9F5',
          100: '#F6F4EE',
          200: '#E8E4D9',
          300: '#D5CFC0',
        },
        charcoal: {
          900: '#141413',
          800: '#1E1E1C',
          700: '#2C2C29',
        },
        terracotta: {
          500: '#C85A32',
          600: '#B04A25',
        },
        forest: {
          700: '#1F4E3D',
          800: '#163A2D',
        },
        'primary-ivi': 'var(--primary-ivi)',
        'primary-ivi-light': 'var(--primary-ivi-light)',
        'primary-ivi-deep': 'var(--primary-ivi-deep)',
      }
    },
  },
  plugins: [],
}
