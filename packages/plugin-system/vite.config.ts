import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "PluginSystem",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["@softarc/native-federation"],
      output: {
        globals: {
          "@softarc/native-federation": "NativeFederation",
        },
      },
    },
  },
});
