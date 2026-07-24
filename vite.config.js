import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes the build work on any static host (Netlify drop, GitHub Pages, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
})
