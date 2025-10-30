import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";
import { createEsBuildAdapter } from "native-federation-esbuild";

export default defineConfig(async ({ command }) => ({
  server: {
    port: 3003,
    origin: command === "serve" ? `http://localhost:3003` : undefined,
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: "src/plugin.ts",
      output: {
        minifyInternalExports: false,
      },
    },
  },
  plugins: [
    await federation({
      options: {
        workspaceRoot: __dirname,
        outputPath: "dist",
        tsConfig: "tsconfig.json",
        federationConfig: "src/federation.ts",
        verbose: false,
        dev: command === "serve",
      },
      adapter: createEsBuildAdapter({
        plugins: [],
      }),
    }),
  ],
}));
