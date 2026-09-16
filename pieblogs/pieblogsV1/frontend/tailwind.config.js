/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#667eea",
          dark: "#5563d6",
          light: "#7c93ef",
        },
        ink: "#0d0d0d",
        panel: "#111111",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        logo: ["Pacifico", "cursive"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease",
      },
    },
  },
  plugins: [],
};
