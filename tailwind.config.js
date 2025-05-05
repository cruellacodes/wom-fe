/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        terminal: {
          black: "#1E1E1E",
          dark: "#2D2D2D",
          gray: "#3A3A3A",
          green: "#00FF00",
          blue: "#569CD6",
          white: "#FFFFFF",
        },
      },
      boxShadow: {
        terminal: "0 4px 6px -1px rgba(0, 255, 0, 0.1), 0 2px 4px -1px rgba(0, 255, 0, 0.06)",
      },
      keyframes: {
        heartbeat: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.12)", opacity: "1" },
        },
        blink: {
          "50%": { opacity: "0" },
        },
        typewriter: {
          "0%": { width: "0" },
          "60%": { width: "22ch" },
          "75%": { width: "22ch" },
          "100%": { width: "0" },
        },
        flicker: {
          "0%, 100%": { opacity: "0.9", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
      animation: {
        heartbeat: "heartbeat 1.6s ease-in-out infinite",
        blink: "blink 1s step-start infinite",
        typewriter: "typewriter 4s steps(22, end) infinite",
        flicker: "flicker 1.6s infinite ease-in-out",
        "spin-glow": "spin 3s linear infinite, flicker 1.6s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
