/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#10b981',
          hover: '#059669',
        },
        accent: {
          DEFAULT: '#f97316',
          hover: '#ea580c',
        },
        background: {
          DEFAULT: '#0f172a',
          lighter: '#1e293b',
        },
        foreground: {
          DEFAULT: '#1e293b',
          lighter: '#334155',
        },
      },
      boxShadow: {
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 25px rgba(99, 102, 241, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'floating': 'floating 6s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        floating: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundImage: {
        'hero-pattern': 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: '#94a3b8',
            h1: {
              color: '#818cf8',
            },
            h2: {
              color: '#818cf8',
            },
            h3: {
              color: '#818cf8',
            },
            strong: {
              color: '#f1f5f9',
            },
            a: {
              color: '#60a5fa',
              '&:hover': {
                color: '#93c5fd',
              },
            },
            code: {
              color: '#f59e0b',
              backgroundColor: '#1e293b',
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              paddingTop: '0.125rem',
              paddingBottom: '0.125rem',
              borderRadius: '0.25rem',
            },
            blockquote: {
              borderLeftColor: '#6366f1',
              color: '#cbd5e1',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
} 