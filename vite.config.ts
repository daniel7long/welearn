import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// WeLearn runs on its own port so it never collides with AP Master, Langogo, iRead, etc.
// strictPort: if 5827 is busy, Vite stops with an error instead of silently hopping to another port.
const PORT = 5827

export default defineConfig({
  plugins: [react()],
  server: { port: PORT, strictPort: true, host: true },
  preview: { port: PORT, strictPort: true, host: true },
})
