const { cyan } = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#0a0a0a",
        darkGray: "#121212",
        gray: "#1e1e1e",
        lightGray: "#2a2a2a",
        white: "#f9f9f9",
        cyan: { ...cyan, DEFAULT: "#00ffff" },
        cyanLight: "#4ef0ff",
        cyanDark: "#008b8b",
        accent: "#00e0e0",
      },
      fontFamily: {
        oswald: ["Oswald", "sans-serif"],
        mont: ["Montserrat", "sans-serif"],
        futura: ["Futura", "sans-serif"],
      },
      fontSize: {
        xs: "0.64rem",
        sm: "0.8rem",
        base: "1rem",
        xl: "1.25rem",
        "2xl": "1.563rem",
        "3xl": "1.953rem",
        "4xl": "2.441rem",
        "5xl": "3.052rem",
      },
      screens: {
        xsm: "220px",
        sm: "480px",
        md: "768px",
        lmd: "952px",
        lg: "1024px",
        xl: "1440px",
      },
    },
  },
  plugins: [],
};
