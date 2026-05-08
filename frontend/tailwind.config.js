export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E0710",
        velvet: "#17091A",
        plum: "#26102A",
        orchid: "#D91CFF",
        cyanGlow: "#29D8FF",
        champagne: "#F4C76B",
        mist: "#F5ECFF",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 36px rgba(217, 28, 255, 0.22)",
        cyan: "0 0 26px rgba(41, 216, 255, 0.28)",
      },
    },
  },
  plugins: [],
};
