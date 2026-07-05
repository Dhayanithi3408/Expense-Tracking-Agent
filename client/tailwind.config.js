/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0E1C29', deep: '#0A141E' },
        wire:    { DEFAULT: '#21384E', soft: '#1A2E40' },
        paper:   { DEFAULT: '#F6F1E4', dim: '#ECE5D2' },
        ink:     { DEFAULT: '#1A2421', soft: '#4A5350' },
        verde:   { DEFAULT: '#3C7A6A', deep: '#2C5C50', tint: '#E4EFEA' },
        amber:   { DEFAULT: '#C97A2B', tint: '#F7E9D8' },
        pencil:  { DEFAULT: '#8FA39C', navy: '#7E97A6' },
        danger:  '#A8432F',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body:    ['IBM Plex Sans', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      }
    }
  },
  plugins: []
}
