import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        luxury: {
          50: "#faf8f4",
          100: "#f0e9d8",
          200: "#dfd0b0",
          300: "#d4be8e",
          400: "#c8a66c",
          500: "#b99d65",
          600: "#a78b56",
          700: "#8e7648",
          800: "#6b5934",
          900: "#4e3f24"
        },
        surface: {
          base: "#141720",
          raised: "#1a1e2e",
          card: "#1e2235",
          hover: "#252a3e"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
