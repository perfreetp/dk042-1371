/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF7F2",
          100: "#FFE8D9",
          200: "#FFD0B3",
          300: "#FFB180",
          400: "#FF8A4D",
          500: "#FF6B35",
          600: "#F25215",
          700: "#CC3E09",
          800: "#A6320A",
          900: "#852B0F",
        },
        warning: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#E63946",
          600: "#DC2626",
          700: "#B91C1C",
        },
        success: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          500: "#2A9D8F",
          600: "#0D9488",
          700: "#0F766E",
        },
        navy: {
          50: "#F1FAEE",
          100: "#E6F0EA",
          500: "#1D3557",
          600: "#152942",
          700: "#0F1E30",
        },
        cream: "#F1FAEE",
      },
      fontFamily: {
        round: [
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Hiragino Sans GB"',
          "sans-serif",
        ],
      },
      fontSize: {
        "4xl": "2.5rem",
        "5xl": "3.5rem",
        "6xl": "4.5rem",
        "7xl": "5.5rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        shake: "shake 0.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-10px)" },
          "75%": { transform: "translateX(10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
