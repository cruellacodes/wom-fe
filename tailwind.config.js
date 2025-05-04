/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'terminal-black': '#1E1E1E',
        'terminal-dark': '#2D2D2D',
        'terminal-gray': '#3A3A3A',
        'terminal-green': '#00FF00',
        'terminal-blue': '#569CD6',
        'terminal-white': '#FFFFFF',
      },
      boxShadow: {
        'terminal': '0 4px 6px -1px rgba(0, 255, 0, 0.1), 0 2px 4px -1px rgba(0, 255, 0, 0.06)',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.3)', opacity: 0.7 },
        },
        blink: {
          '50%': { opacity: '0' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
        blink: 'blink 1s step-start infinite',
        typewriter: 'typewriter 2s steps(20, end) forwards',
      },
    },
  },
  plugins: [],
};
