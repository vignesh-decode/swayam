/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#25D366',   // WA green
          600: '#128C7E',   // WA teal
          700: '#075E54',   // WA dark
          800: '#054640',
          900: '#022d28',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        surface: '#F0F2F5',
        card:    '#FFFFFF',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
        float: '0 8px 24px rgba(7,94,84,0.18)',
      },
      animation: {
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.68,-0.55,0.265,1.55)',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: 0 },
          to:   { transform: 'translateY(0)',    opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        bounceIn: {
          from: { transform: 'scale(0.8)', opacity: 0 },
          to:   { transform: 'scale(1)',   opacity: 1 },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37,211,102,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(37,211,102,0)' },
        },
      },
    },
  },
  plugins: [],
}
