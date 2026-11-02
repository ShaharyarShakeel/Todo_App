//The file where we configure how Vite runs and builds our React application means how vite works with react or any other framework.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'BASE_URL'], //tells Vite which environment variable prefixes are allowed to be exposed to your frontend code.
})

