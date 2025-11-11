/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",               // include root html file
    "./src/**/*.{js,ts,jsx,tsx}", // include all source files
  ],
  theme: {
    extend: {}, // use this to customize colors, spacing, etc.
  },
  plugins: [],
}
