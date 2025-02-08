/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'success-gradient': {
          '0%': { borderColor: 'transparent' },
          '50%': { borderColor: '#22c55e' }, // green-500
          '100%': { borderColor: 'transparent' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'success-pulse': 'success-gradient 2s ease-in-out',
      },
    },
  },
  plugins: [],
};
