import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/theme/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        surface: {
          primary: 'rgb(var(--theme-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--theme-bg-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--theme-bg-tertiary) / <alpha-value>)',
        },
        content: {
          primary: 'rgb(var(--theme-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--theme-text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--theme-text-tertiary) / <alpha-value>)',
          inverted: 'rgb(var(--theme-text-inverted) / <alpha-value>)',
        },
        edge: {
          primary: 'rgb(var(--theme-border-primary) / <alpha-value>)',
          secondary: 'rgb(var(--theme-border-secondary) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
