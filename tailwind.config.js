/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: '#800020',
        gray: {
          custom: '#808080',
        }
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
