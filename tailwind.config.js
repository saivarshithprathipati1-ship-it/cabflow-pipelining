/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1020',
        panel: '#111827',
        cab: '#FFC107',
        pipe: '#00D4FF',
        ok: '#22C55E',
        warn: '#F59E0B',
        bad: '#EF4444',
        paper: '#F8FAFC',
        stage: {
          1: '#00D4FF',
          2: '#6C8CFF',
          3: '#B57BFF',
          4: '#F59E0B',
          5: '#22C55E',
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,212,255,0.45), 0 0 24px -4px rgba(0,212,255,0.45)',
        'glow-ok': '0 0 0 1px rgba(34,197,94,0.5), 0 0 24px -4px rgba(34,197,94,0.45)',
        'glow-cab': '0 0 0 1px rgba(255,193,7,0.5), 0 0 22px -6px rgba(255,193,7,0.55)',
      },
    },
  },
  plugins: [],
};
