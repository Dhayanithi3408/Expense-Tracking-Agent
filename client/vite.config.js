import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("\n[PROXY ERROR] Backend not running!");
            console.log("Run this in a separate terminal: cd server && npm run dev\n");
          });
        }
      }
    }
  }
});
