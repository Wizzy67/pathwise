/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pw: {
          black:    'var(--black)',
          surface:  'var(--surface)',
          surface2: 'var(--surface2)',
          blue:     'var(--blue)',
          azure:    'var(--azure)',
          lavender: 'var(--lavender)',
          white:    'var(--white)',
          gray:     'var(--gray)',
          muted:    'var(--muted)',
          canvas:   'var(--canvas)',
          ink:      'var(--ink)',
          graphite: 'var(--graphite)',
          ash:      'var(--ash)',
          fog:      'var(--fog)',
          mist:     'var(--mist)',
          silver:   'var(--silver)',
          border:   'var(--border)',
        },
        // Keep solar aliases so existing references don't break
        solar: {
          bg:     'var(--black)',
          bg2:    'var(--surface)',
          orange: 'var(--blue)',
          amber:  'var(--azure)',
          teal:   'var(--lavender)',
          violet: 'var(--azure)',
          white:  'var(--white)',
          gray:   'var(--gray)',
        }
      },
      fontFamily: {
        nunito:   ['Nunito', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
        mono:     ['IBM Plex Mono', 'monospace'],
        // Keep old aliases for backward compatibility
        outfit:   ['Nunito', 'sans-serif'],
        inter:    ['Open Sans', 'sans-serif'],
      },
      backgroundImage: {
        'futurewave':     'var(--futurewave)',
        'midnight-surge': 'var(--midnight-surge)',
      },
      boxShadow: {
        'clean-sm': '0 1px 3px rgba(0,0,0,0.08)',
        'clean-md': '0 4px 12px rgba(0,0,0,0.06)',
        'clean-lg': '0 8px 24px rgba(0,0,0,0.08)',
        'card':     '0 2px 8px rgba(0,0,0,0.04)',
        // Keep old aliases
        'blue-glow': '0 4px 12px rgba(25,68,241,0.15)',
        'blue-lg':   '0 8px 24px rgba(25,68,241,0.1)',
      },
      borderRadius: {
        'pw-sm': '8px',
        'pw-md': '12px',
        'pw-lg': '16px',
        'pw-xl': '20px',
      }
    },
  },
  plugins: [],
}
