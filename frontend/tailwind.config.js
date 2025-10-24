/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "secondary-text": "var(--secondary-text)",
        "primary-accent": "var(--primary-accent)",
        "secondary-accent": "var(--secondary-accent)",
        "tertiary-accent": "var(--tertiary-accent)",
        "glass-surface": "var(--glass-surface)",
        "glass-border": "var(--glass-border)",
      },

      keyframes: {
        kenBurns: {
          "0%": { transform: "scale(1) translate(0, 0)", opacity: 0.8 },
          "100%": { transform: "scale(1.1) translate(-2%, 0)", opacity: 1 },
        },
      },
      animation: {
        kenBurns: "kenBurns 20s infinite alternate ease-in-out",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
