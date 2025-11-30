/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#F5F1E8',
        'orange-primary': '#FF6B35',
        'text-dark': '#1A1A1A',
        'text-gray': '#666666',
      },
    },
  },
  plugins: [],
}