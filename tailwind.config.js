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
        bg: {
          primary: '#0F1419',
          card: '#1A2332',
          cardHover: '#1E2A3A',
          elevated: '#243447',
        },
        accent: {
          primary: '#00D4AA',
          dim: '#00A88A',
          glow: '#00FFCC',
        },
        risk: {
          red: '#FF4757',
          redBg: '#3D1519',
          yellow: '#FFA502',
          yellowBg: '#3D2E0A',
          green: '#2ED573',
          greenBg: '#0D3D1F',
        },
        text: {
          primary: '#E8ECF1',
          secondary: '#8899AA',
          muted: '#556677',
        },
        border: {
          default: '#2A3A4A',
          focus: '#00D4AA',
        },
      },
      fontFamily: {
        mono: ['"DIN Alternate"', '"Roboto Mono"', 'monospace'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'count-up': 'countUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
