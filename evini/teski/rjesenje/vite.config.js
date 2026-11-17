import { resolve } from 'path'

// Konfiguracija Vite razvojnog poslužitelja (pokretanje: "npm run vite").
export default {
  // root: Vite poslužuje datoteke iz mape src - zato je stranica na
  // http://localhost:8080/ (a ne /src/index.html).
  root: resolve(import.meta.dirname, 'src'),
  build: {
    // "npm run build" (ako se doda skripta) sprema gotovu stranicu u mapu dist.
    outDir: '../dist'
  },
  server: {
    port: 8080,
    // Proxy: svaki zahtjev koji počinje s /api Vite prosljeđuje Express
    // poslužitelju na portu 3000. Zato klijent piše "/api/expenses", a ne
    // "http://localhost:3000/api/expenses", i nema CORS problema.
    // Za rad stranice moraju biti pokrenuta OBA poslužitelja (8080 i 3000).
    proxy: {
      "/api": "http://localhost:3000"
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 koristi stariju Sass sintaksu (@import, globalne funkcije),
        // pa novi Sass ispisuje puno upozorenja. Ovo ih samo utišava, ništa ne mijenja.
        silenceDeprecations: ['import', 'color-functions', 'global-builtin', 'if-function'],
      },
    },
  },
}
