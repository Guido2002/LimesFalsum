import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Project site at https://guido2002.github.io/LimesFalsum/ — assets must be
  // served relative to the repo subpath. BASE_URL is set in the Pages workflow.
  base: process.env.BASE_URL ?? "/",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
