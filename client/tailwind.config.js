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
        },
        // Keep solar aliases so any remaining references don't break
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
        outfit: ['Outfit', 'sans-serif'],
        inter:  ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'futurewave':     'var(--futurewave)',
        'midnight-surge': 'var(--midnight-surge)',
        'blue-radial':    'radial-gradient(ellipse at 30% 20%, rgba(0,86,255,0.06) 0%, transparent 65%)',
      },
      boxShadow: {
        'blue-glow': '0 0 30px rgba(0,86,255,0.12)',
        'blue-lg':   '0 0 60px rgba(0,86,255,0.08)',
        'card':      '0 4px 24px rgba(0,86,255,0.04)',
      }
    },
  },
  plugins: [],
}
