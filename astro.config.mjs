import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify'; // Importamos el adapter oficial

export default defineConfig({
  output: 'server', // Le decimos que sí, que use un servidor
  adapter: netlify(), // Usamos el motor de Netlify
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});
