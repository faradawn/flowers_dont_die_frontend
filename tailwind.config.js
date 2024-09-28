/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",  // This handles all files in the app folder and its subfolders
    "./app/components/**/*.{js,jsx}",  // Ensure all JS/JSX files in the components folder are included
    "./app/screens/**/*.{js,jsx}"  // Ensure all JS/JSX files in the screens folder are included
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
