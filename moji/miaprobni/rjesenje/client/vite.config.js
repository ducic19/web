// ============================================================
//  vite.config.js — konfiguracija razvojnog poslužitelja klijenta
// ============================================================

import { resolve } from "path";

export default {
    // korijen je mapa src (index.html, js/, scss/)
    root: resolve(__dirname, "src"),
    build: {
        outDir: "../dist"
    },
    server: {
        // klijent radi na http://localhost:8080
        port: 8080,
        // VEZA S POSLUŽITELJEM: svi zahtjevi na /api prosljeđuju se
        // Expressu na portu 3000 (GET /api/todos i PUT /api/todos).
        // Zato u script.js nije potreban puni URL niti CORS.
        proxy: {
            "/api": "http://localhost:3000"
        }
    }
}
