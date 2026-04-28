import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // The Uplink to your HP Omen's Java Backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})