/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./public/**/*.html",
  "./src/**/*.{js,ts,jsx,tsx}"
],
  darkMode: 'class', 
  
  theme: {
    extend: {},
  },
  plugins: [
    require("tw-elements/dist/plugin")
  ],
}


