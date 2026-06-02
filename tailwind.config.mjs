/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,css}'],
  theme: {
    extend: {
      colors: {
        blue: {
          brand:  '#061556',   /* Royal Navy  */
          accent: '#0073BB',   /* Royal Blue  */
          house:  '#061556',   /* hero overlay — same as Navy */
          uplift: '#0a2a6e',   /* mid navy for hover states */
          light:  '#ddeeff',   /* tinted sky for backgrounds */
        },
        gold: {
          DEFAULT:  '#FEBD11', /* Royal Gold  */
          light:    '#FFD96A', /* lighter gold tint */
          lightest: '#FFFBEC', /* near-white gold wash */
        },
        canvas: {
          warm: '#f2f0eb',
          ceramic: '#edebe9',
        },
        surface: {
          white: '#ffffff',
          cool: '#f9f9f9',
        },
        ink: {
          DEFAULT: 'rgba(0, 0, 0, 0.87)',
          soft: 'rgba(0, 0, 0, 0.58)',
          rewards: '#334e68',
        },
        onDark: {
          DEFAULT: '#ffffff',
          soft: 'rgba(255, 255, 255, 0.70)',
        },
        semantic: {
          error: '#c82014',
          warning: '#fbbc05',
        },
        /* legacy alias → blue-accent */
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#7dd3fc',
          400: '#0284c7',
          500: '#0284c7',
          600: '#1e3a8a',
          700: '#1e3a5f',
          800: '#2c5282',
          900: '#1e3a5f',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '"PingFang TC"', '"PingFang SC"', 'Inter', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['"Playfair Display"', '"Iowan Old Style"', 'Georgia', 'serif'],
      },
      fontSize: {
        body: ['1rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'body-lg': ['1.1875rem', { lineHeight: '1.75', letterSpacing: '-0.01em' }],
        h1: ['1.5rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em' }],
        h2: ['1.5rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em' }],
        micro: ['0.8125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        brand: '-0.01em',
        tight: '-0.16px',
      },
      borderRadius: {
        card: '8px',
        pill: '50px',
      },
      boxShadow: {
        /* royal-blue tinted lift — creates noticeable 3D elevation */
        card: '0 4px 20px rgba(6,21,86,0.10), 0 1px 4px rgba(6,21,86,0.07)',
        'card-hover': '0 8px 32px rgba(6,21,86,0.14), 0 2px 8px rgba(6,21,86,0.09)',
        nav: '0 1px 3px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.07)',
        frap: '0 0 6px rgba(0,0,0,0.24), 0 8px 12px rgba(0,0,0,0.14)',
        'frap-active': '0 0 6px rgba(0,0,0,0.24), 0 8px 12px rgba(0,0,0,0)',
      },
      maxWidth: {
        content: '90rem',
        column: '45rem',
      },
      spacing: {
        'gutter-sm': '1.6rem',
        'gutter-md': '2.4rem',
        'gutter-lg': '4rem',
      },
      transitionDuration: {
        brand: '200ms',
      },
    },
  },
  plugins: [],
};
