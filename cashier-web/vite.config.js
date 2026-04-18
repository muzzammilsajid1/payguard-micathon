import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow serving files from the parent directory (for shared/)
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      // Ensure firebase imports from shared/ resolve to our node_modules
      'firebase/app': path.resolve(__dirname, 'node_modules/firebase/app'),
      'firebase/firestore': path.resolve(__dirname, 'node_modules/firebase/firestore'),
    },
  },
})

