import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import impactTransform from "@impact-react/signals/swc-transform";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env": {},
  },
  plugins: [
    react({
      plugins: [impactTransform()],
    }),
  ],
});
