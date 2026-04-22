import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api/auth': {
        target: process.env.VITE_AUTH_URL || 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/assessment': {
        target: process.env.VITE_ASSESSMENT_URL || 'http://localhost:3002',
        changeOrigin: true
      },
      '/api/therapist': {
        target: process.env.VITE_THERAPIST_URL || 'http://localhost:3003',
        changeOrigin: true
      }
    }
  }
})
