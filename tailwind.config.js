/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'header': ['Rubik Mono One', 'sans-serif'],
      },
      backgroundImage: {
        header: "url('/images/header2.jpg')",
      }
    },
  },
  plugins: [],
}
