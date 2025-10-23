/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          pink: "#ff4b6e",
          teal: "#0fffc4",
        },
      },
    },
  },
  plugins: [],
};
