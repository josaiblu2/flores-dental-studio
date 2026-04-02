import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static', // Forzamos el modo estático
  vite: {
    plugins: [tailwindcss()]
  }
});
