/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F97316",
        secondary: "#14B8A6",
        accent: "#38BDF8",
        surface: "#101D2E"
      },
      boxShadow: {
        glow: "0 12px 32px rgba(20,184,166,0.34)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 12% 14%, rgba(249,115,22,0.22), transparent 42%), radial-gradient(circle at 86% 2%, rgba(20,184,166,0.24), transparent 36%), radial-gradient(circle at 88% 80%, rgba(56,189,248,0.14), transparent 34%), linear-gradient(145deg, #081221 0%, #111f34 52%, #071723 100%)"
      }
    }
  },
  plugins: []
};
