/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This scans all your React components
  ],
  theme: {
    extend: {
      // You can extend default Tailwind theme here
      colors: {
        primary: '#646cff', // Your existing color
        secondary: '#535bf2', // Your hover color
      },
    },
  },
  plugins: [], 
} 