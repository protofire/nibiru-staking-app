import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nibiru-cyan': '#1de9b6',
        'nibiru-blue': '#0ea5e9',
        'nibiru-cyan-dark': '#0891b2',
        'nibiru-blue-dark': '#0284c7',
        'nibiru-cyan-light': '#67e8f9',
        'nibiru-blue-light': '#7dd3fc',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'nibiru-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #1de9b6 100%)',
        'nibiru-gradient-reverse': 'linear-gradient(135deg, #1de9b6 0%, #0ea5e9 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
