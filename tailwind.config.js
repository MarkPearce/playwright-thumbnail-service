/** @type {import('tailwindcss').Config} */
// NOTE: spacing / fontSize / borderRadius / gray below are mirrored from the main app's
// tailwind.config.ts so identical utility classes render identically in generated thumbnails.
// Keep in sync when the app theme changes. cyan-* and slate-* are stock Tailwind (unchanged in the app).
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        'amboss-blue': '#0066CC',
        'amboss-light-blue': '#E6F2FF',
        'amboss-gray': '#666666',
        'amboss-dark': '#333333',
        gray: {
          50: '#f5f7f9',
          100: '#eef2f5',
          200: '#e0e6eb',
          300: '#a3b2bd',
          400: '#8291a0',
          500: '#5a7183',
          600: '#40515e',
          900: '#1a1c1c',
        },
        red: {
          50: '#fde8e8',
          100: '#fad1d1',
          200: '#fad1d1',
          300: '#f07575',
          500: '#ee6160',
          600: '#dd3637',
          700: '#c02725',
        },
      },
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
        'lora': ['Lora', 'serif'],
      },
      spacing: {
        1: '2px',
        2: '4px',
        3: '8px',
        4: '12px',
        5: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.1428571429' }],
        'sm': ['14px', { lineHeight: '1.25' }],
        'base': ['16px', { lineHeight: '1.3333333' }],
        'lg': ['18px', { lineHeight: '1.4285714286' }],
        'xl': ['20px', { lineHeight: '1.5' }],
        '2xl': ['24px', { lineHeight: '1.625' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.1' }],
        '5xl': ['48px', { lineHeight: '1' }],
        '6xl': ['60px', { lineHeight: '1' }],
        '7xl': ['72px', { lineHeight: '1' }],
        '8xl': ['96px', { lineHeight: '1' }],
        '9xl': ['128px', { lineHeight: '1' }],
        'slide-title': ['3rem', { lineHeight: '1.2' }],
        'slide-subtitle': ['1.5rem', { lineHeight: '1.3' }],
        'slide-content': ['1.25rem', { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
}
