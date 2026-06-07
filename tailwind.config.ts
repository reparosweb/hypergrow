import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060c",
          900: "#0a0c16",
          800: "#11131f",
          700: "#1a1d2e",
        },
        brand: {
          50: "#eef2ff",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
        accent: {
          cyan: "#22d3ee",
          violet: "#a855f7",
          pink: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "mesh":
          "radial-gradient(60% 60% at 20% 10%, rgba(99,102,241,0.25) 0%, transparent 60%), radial-gradient(50% 50% at 85% 20%, rgba(34,211,238,0.18) 0%, transparent 55%), radial-gradient(60% 60% at 50% 100%, rgba(168,85,247,0.20) 0%, transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
