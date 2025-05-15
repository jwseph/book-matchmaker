/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    // autoprefixer can be added here if needed, e.g., 'autoprefixer': {}
    // but often not required as @tailwindcss/postcss or Next.js handles it.
  },
};

export default config; 