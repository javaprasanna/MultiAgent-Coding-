/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D1117",
        surface: "#161B22",
        primary: "#00E5FF",
        "primary-dark": "#00B8CC"
      },
      fontFamily: {
        mono: ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
        sans: ['"Geist"', '"DM Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
