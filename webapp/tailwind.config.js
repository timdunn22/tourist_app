/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3f0',
          100: '#fde4dc',
          200: '#fbcabb',
          300: '#f7a48f',
          400: '#f17a5f',
          500: '#E07A5F',
          600: '#c4553d',
          700: '#a34432',
          800: '#86392c',
          900: '#6f3329',
        },
        secondary: {
          50: '#f4f4f6',
          100: '#e8e9ed',
          200: '#c9cbd4',
          300: '#a6a9b7',
          400: '#7a7e94',
          500: '#3D405B',
          600: '#33364d',
          700: '#292c3f',
          800: '#202232',
          900: '#1a1b28',
        },
        accent: {
          50: '#f0f7f4',
          100: '#dbede4',
          200: '#b9dccc',
          300: '#8fc4ac',
          400: '#81B29A',
          500: '#4d9474',
          600: '#3b775c',
          700: '#31604b',
          800: '#294d3e',
          900: '#234034',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
}
