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
        milk: "#fbf2f5",
        cream: "#fffbfc",
        rose: "#e8b8c6",
        sage: "#8fa58b",
        wine: "#9a5b70",
        ink: "#44363b"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(125, 78, 93, 0.12)",
        petal: "0 8px 18px rgba(154, 91, 112, 0.20)"
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
