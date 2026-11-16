import { resolve } from "path";

export default {
    root: resolve(__dirname, "src"),
    build: {
        outDir: "../dist"
    },css: 
    {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ["import", "global-builtin", "color-functions"]
            }
        }
    },
    server: {
        port: 8080,
        proxy: {
            "/api": "http://localhost:3000"
        }
    }
}