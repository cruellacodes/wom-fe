import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['apexcharts', 'react-apexcharts'],
          utils: ['d3', 'fuse.js']
        }
      }
    }
  },
  // Optimize deps for faster dev server
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'apexcharts',
      'react-apexcharts',
      '@supabase/supabase-js'
    ]
  }
})