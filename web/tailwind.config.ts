import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#f6821f',   // Cloudflare orange
          600: '#e07017',
          700: '#c85f0f',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
