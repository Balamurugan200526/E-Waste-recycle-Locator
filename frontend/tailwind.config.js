/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
          300: '#86efac', 400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d',
        },
      },
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'green':  '0 4px 18px rgba(34,197,94,.22)',
        'green-lg':'0 6px 22px rgba(34,197,94,.30)',
        'card':   '0 1px 4px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04)',
        'card-lg':'0 10px 32px rgba(0,0,0,.10)',
      },
      borderRadius: {
        'xl': '16px', '2xl': '20px', '3xl': '24px',
      },
      animation: {
        'float':    'floatY 5s ease-in-out infinite',
        'slide-up': 'slideUp .4s ease-out both',
        'fade-in':  'fadeIn .35s ease-out both',
        'blink':    'blink 2s infinite',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(170deg, #f0fdf4 0%, #fff 60%)',
        'green-gradient':'linear-gradient(135deg, #22c55e, #15803d)',
        'cta-gradient':  'linear-gradient(135deg, #f0fdf4, #dcfce7)',
      },
    }
  },
  plugins: []
};
