module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "Arial", "sans-serif"],
        display: ["var(--font-manrope)", "var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};