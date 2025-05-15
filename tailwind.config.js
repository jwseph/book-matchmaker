const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Keep for broader compatibility just in case
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [], // Clear safelist, rely on content scanning now
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        serif: ['var(--font-lora)', ...fontFamily.serif],
      },
      // colors object removed as colors are now defined in globals.css via @theme
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: 'var(--color-lw-text)',
            a: {
              color: 'var(--color-lw-link)',
              '&:hover': {
                color: 'var(--color-lw-link-hover)',
              },
              textDecoration: 'none', // LessWrong often has no underlines on links initially
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.sans').join(', '), // Use sans-serif for headings
              color: 'var(--color-lw-text)',
            },
            // Add more base styling here if needed
          },
        },
        dark: { // For @tailwindcss/typography dark mode if you use `prose-dark`
          css: {
            color: 'var(--color-lw-dark-text)',
            a: {
              color: 'var(--color-lw-dark-link)',
              '&:hover': {
                color: 'var(--color-lw-dark-link-hover)',
              },
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.sans').join(', '),
              color: 'var(--color-lw-dark-text)',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
}; 