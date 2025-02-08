/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563EB", // Rich blue
          secondary: "#4F46E5", // Indigo
          accent: "#0EA5E9", // Sky blue
          light: "#EFF6FF", // Light blue bg
          dark: "#1E293B", // Slate dark
        },
        primary: "#FFB7A0",
        "primary-dark": "#FF9B7D",
      },
      backgroundImage: {
        "auth-bg": "url('/mountain-bg.jpg')",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
