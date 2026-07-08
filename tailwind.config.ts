import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        milk: "#f8f2ea",
        cream: "#fffaf4",
        rose: "#d79aaa",
        sage: "#8fa58b",
        wine: "#7b2d43",
        ink: "#2f2725"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(87, 55, 47, 0.10)",
        petal: "0 8px 18px rgba(123, 45, 67, 0.14)"
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
