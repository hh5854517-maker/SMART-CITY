/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070b14',
          900: '#0d1322',
          850: '#11192e',
          800: '#16203a',
          750: '#1c2848',
          700: '#223055',
          600: '#324474',
          500: '#465d9c',
        },
        traffic: {
          green: '#10b981',
          yellow: '#f59e0b',
          orange: '#f97316',
          red: '#ef4444',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' }
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
        'radar-sweep': 'radar-sweep 8s linear infinite',
        'fade-in': 'fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    },
  },
  plugins: [],
}
