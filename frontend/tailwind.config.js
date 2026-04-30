/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        grade: {
          A: '#16a34a',
          B: '#2563eb',
          C: '#d97706',
          D: '#ea580c',
          F: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}
