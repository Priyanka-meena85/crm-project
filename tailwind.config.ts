import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FFFBEB",
        maroon: {
          DEFAULT: "#881337",
          light: "#9F1239",
          dark: "#6B0F2B",
        },
        gold: {
          DEFAULT: "#CA8A04",
          shine: "#F59E0B",
          soft: "#FEF3C7",
        },
        charcoal: "#1C1917",
        softpink: "#FFF1F2",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        boutique: "0 10px 30px -10px rgba(136, 19, 55, 0.10), 0 4px 12px -4px rgba(202, 138, 4, 0.12)",
        "boutique-hover": "0 22px 45px -12px rgba(136, 19, 55, 0.18), 0 8px 20px -6px rgba(202, 138, 4, 0.25)",
        "gold-glow": "0 0 24px rgba(245, 158, 11, 0.45)",
      },
      borderRadius: {
        boutique: "28px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.75" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        "row-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-3px)" },
          "40%": { transform: "translateX(3px)" },
          "60%": { transform: "translateX(-2px)" },
          "80%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        marquee: "marquee 24s linear infinite",
        shimmer: "shimmer 2.8s linear infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "row-shake": "row-shake 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
