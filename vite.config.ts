import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', { target: '19' }],
        ],
      },
    }),
    tailwindcss(),
    // bundle visualizer - generates dist/stats.html after build
    visualizer({ filename: 'dist/stats.html', open: false }),
  ],
})
