import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env": {},
  },
  plugins: [
    react({
      plugins: [
        [
          "@impact-react/swc-transform",
          { package_name: "@impact-react/signals" },
        ],
      ],
    }),
  ],
});
