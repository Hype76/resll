/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Background Layers
        slate: {
          950: '#0D1117', // Layer 1: App Background
          900: '#111827', // Layer 2: Cards, Sections, Modals
          800: '#1F2937', // Layer 3: Inner Panels, Form Boxes / Base Border
          700: '#2D3748', // Border: Subtle
          600: '#374151', // Border: Divider
        },
        // Text Colors
        gray: {
          50: '#F9FAFB',  // Text: Primary
          200: '#E5E7EB', // Text: Secondary
          400: '#9CA3AF', // Text: Muted
        },
        // Accents
        mint: {
          400: '#00D991', // Accent: Primary
          500: '#10B981', // Accent: Hover / Success
        },
        cyan: {
          500: '#0EA5E9', // Accent: Secondary / Primary Buttons / Interactive
          600: '#0284C7', // Hover state
        },
        // Semantic Status
        red: {
          500: '#EF4444', // Error
          900: '#450a0a', // Error bg
        },
        amber: {
          400: '#F59E0B', // Warning
          900: '#451a03', // Warning bg
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}