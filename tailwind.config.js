/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        panel: '#111827',
        accent: '#facc15',
        positive: '#22c55e',
        danger: '#ef4444',
      },
      fontSize: {
        base: ['20px', '1.6'],
      },
      boxShadow: {
        focus: '0 0 0 4px rgba(250, 204, 21, 0.5)',
      },
    },
  },
  plugins: [],
}

