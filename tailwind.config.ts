import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neutral: {
          50: "#f8fbfd",
          100: "#172938",
          200: "#263b4a",
          300: "#405665",
          400: "#607482",
          500: "#7b8d98",
          600: "#a3b1ba",
          700: "#cfdee7",
          800: "#eaf5fb",
          900: "#ffffff",
          950: "#0f172a"
        },
        luxury: {
          50: "#f6fbff",
          100: "#eaf5fb",
          200: "#d7eaf4",
          300: "#bddce9",
          400: "#8dbbd0",
          500: "#649db7",
          600: "#427d99",
          700: "#315f77",
          800: "#274d60",
          900: "#203f50"
        },
        surface: {
          base: "#f3f8fb",
          raised: "#ffffff",
          card: "#ffffff",
          hover: "#e7f1f7"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
