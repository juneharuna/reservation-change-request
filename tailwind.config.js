/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hyundai: {
          navy: '#002C5F',
          blue: '#007FA8',
          sand: '#E4DCD3',
          gold: '#99775C',
          gray: '#A2AAAD',
        }
      },
      fontFamily: {
        sans: ['"Spoqa Han Sans Neo"', '"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
