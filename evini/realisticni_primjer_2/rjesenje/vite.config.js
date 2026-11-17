import { resolve } from 'path'

// Konfiguracija Vite razvojnog poslužitelja (pokretanje: "npm run vite").
export default {
  // root: Vite poslužuje datoteke iz mape src, pa je stranica na http://localhost:8080/
  root: resolve(import.meta.dirname, 'src'),
  build: {
    outDir: '../dist'
  },
  server: {
    port: 8080,
    // Proxy: svaki zahtjev koji počinje s /api Vite prosljeđuje Express
    // poslužitelju na portu 3000. Zato u JS-u pišemo samo "/api/movies".
    // Za rad stranice moraju biti pokrenuta OBA poslužitelja (8080 i 3000).
    proxy: {
      "/api": "http://localhost:3000"
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Utišava upozorenja novog Sass-a o staroj sintaksi koju koristi Bootstrap 5.3.
        silenceDeprecations: ['import', 'color-functions', 'global-builtin', 'if-function'],
      },
    },
  },
}
