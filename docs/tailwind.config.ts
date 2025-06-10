import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './docs/**/*.{md,mdx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
