/** @type {import('tailwindcss').Config} */
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
      },
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
        'lora': ['Lora', 'serif'],
      },
      fontSize: {
        'slide-title': ['3rem', { lineHeight: '1.2' }],
        'slide-subtitle': ['1.5rem', { lineHeight: '1.3' }],
        'slide-content': ['1.25rem', { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
}
