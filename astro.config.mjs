import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://contenedoresescombros.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
