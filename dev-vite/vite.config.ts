import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import impact from "@impact-react/preact/babel-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env": {},
  },
  plugins: [
    react({
      babel: {
        plugins: [impact()],
      },
    }),
  ],
});
