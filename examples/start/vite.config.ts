import solid from '@solidjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { fileRoutes } from 'filesystem-routing/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // Start mode with streaming SSR: the plugin generates the entries around src/App.tsx, in
  // src/Document.tsx, and `vite build` also writes the Node server `npm start` runs.
  plugins: [
    tailwindcss(),
    solid({ start: { nodeServer: true }, ssr: true, extensions: ['.tsx'] }),
    fileRoutes({ types: true }),
  ],
})
