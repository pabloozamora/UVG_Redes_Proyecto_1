import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'strophe.js': path.resolve(__dirname, 'node_modules/strophe.js'),
    },
    mainFields: ['main', 'browser'],
  },
  define: {
    'process.env': {},
    global: {},
    "global.WebSocket": "window.WebSocket",
    "global.btoa": "window.btoa.bind(window)",
  },
})