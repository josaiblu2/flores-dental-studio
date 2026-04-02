import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  integrations: [react()],
  // Quitamos Tailwind temporalmente de la config para descartar errores de Vite
});
