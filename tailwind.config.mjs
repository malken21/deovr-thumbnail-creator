/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(240, 10%, 3.9%)',
        foreground: 'hsl(0, 0%, 98%)',
        card: 'hsl(240, 10%, 3.9%)',
        'card-foreground': 'hsl(0, 0%, 98%)',
        primary: 'hsl(0, 0%, 98%)',
        'primary-foreground': 'hsl(240, 5.9%, 10%)',
        secondary: 'hsl(240, 3.7%, 15.9%)',
        'secondary-foreground': 'hsl(0, 0%, 98%)',
        muted: 'hsl(240, 3.7%, 15.9%)',
        'muted-foreground': 'hsl(240, 5%, 64.9%)',
        accent: 'hsl(240, 3.7%, 15.9%)',
        'accent-foreground': 'hsl(0, 0%, 98%)',
        border: 'hsl(240, 3.7%, 15.9%)',
        input: 'hsl(240, 3.7%, 15.9%)',
        ring: 'hsl(240, 4.9%, 83.9%)',
      },
    },
  },
  plugins: [],
}
