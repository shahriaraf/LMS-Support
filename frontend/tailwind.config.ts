/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f1115',
        panel: '#161922',
        accent: '#6366f1',
        danger: '#ef4444',
        warn: '#f59e0b',
        ok: '#22c55e',
      },
    },
  },
  plugins: [],
};
