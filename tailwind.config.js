/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        roman: {
          red: "#8A2E25",
          oxblood: "#5D211C",
          terracotta: "#B45D47",
          // Bronze is decorative (borders, swatches); bronze-dark meets
          // WCAG 4.5:1 for small text on paper/parchment surfaces.
          bronze: { DEFAULT: "#A27A44", dark: "#7A5A2E" },
          gold: "#C39A56",
          parchment: "#F3EBDD",
          paper: "#FAF7F0",
          charcoal: "#24201D",
          stone: "#726A62",
        },
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
