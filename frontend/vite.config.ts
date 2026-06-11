import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Use a different path for Vite's HMR WebSocket so it doesn't
    // collide with the backend's /ws proxy.
    hmr: {
      path: '/__vite_hmr',
    },
    proxy: {
      // REST API requests → backend
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
      // WebSocket → backend
      '/ws': {
        target: 'ws://localhost:3333',
        ws: true,
        // Suppress ECONNRESET when backend restarts or WS drops
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && 'writeHead' in res && typeof res.writeHead === 'function') {
              try { res.writeHead(502); res.end(); } catch { /* already closed */ }
            }
          });
        },
      },
    },
  },
});