/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  darkMode: 'class',
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
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

