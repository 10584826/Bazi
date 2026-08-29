/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f5efe3",
        ink: "#1c1b18",
        gold: "#c8a96a",
        fire: "#d96b4c",
        wood: "#7bb36a",
        water: "#5b7bd5",
        metal: "#b9b9c0",
        earth: "#c9a46a"
      },
      boxShadow: {
        oriental: "0 10px 30px rgba(0,0,0,.12)"
      }
    }
  },
  plugins: []
};