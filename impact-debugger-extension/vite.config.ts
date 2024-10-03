import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: "src", // Set the root directory to 'src'
  build: {
    outDir: "../dist", // Output files to 'dist' directory
    emptyOutDir: true,
    target: "es2015", // Ensure compatibility with Chrome
    rollupOptions: {
      input: {
        panel: resolve(__dirname, "src/main.tsx"),
        devtools: resolve(__dirname, "src/devtools.ts"),
        background: resolve(__dirname, "src/background.ts"),
        contentScript: resolve(__dirname, "src/contentScript.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
