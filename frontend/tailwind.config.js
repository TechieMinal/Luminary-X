/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Core design palette
        obsidian: {
          950: '#07080c',
          900: '#0d0f18',
          800: '#131622',
          700: '#1c2030',
          600: '#252a3d',
          500: '#2e3450',
        },
        electric: {
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        aurora: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Alias for backwards compat with older pages
        surface: {
          950: '#07080c',
          900: '#0d0f18',
          800: '#131622',
          200: '#94a3b8',
        },
        brand: {
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        'slide-right': 'slideRight 0.4s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':     'shimmer 1.5s infinite',
        'float':       'float 6s ease-in-out infinite',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity:'0' },                                to: { opacity:'1' } },
        slideUp:   { from: { opacity:'0', transform:'translateY(24px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        slideRight:{ from: { opacity:'0', transform:'translateX(-16px)' },to: { opacity:'1', transform:'translateX(0)' } },
        shimmer:   { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        float:     { '0%,100%':{ transform:'translateY(0px)' }, '50%':{ transform:'translateY(-12px)' } },
        glowPulse: { '0%,100%':{ boxShadow:'0 0 20px rgba(99,102,241,0.3)' }, '50%':{ boxShadow:'0 0 40px rgba(99,102,241,0.6)' } },
      },
      backgroundImage: {
        'gradient-electric': 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        'gradient-aurora':   'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-mesh':     'radial-gradient(at 40% 20%, rgba(99,102,241,0.15) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(16,185,129,0.08) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
