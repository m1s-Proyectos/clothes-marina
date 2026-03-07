import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        luxury: {
          50: "#f7f6f2",
          100: "#ebe7da",
          500: "#b99d65",
          700: "#8e7648",
          900: "#4e3f24"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
