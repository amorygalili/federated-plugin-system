import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";
import { createEsBuildAdapter } from "native-federation-esbuild";
import path from "path";

export default defineConfig(async ({ command }) => ({
  resolve: {
    alias: {
      '@shared/loader': path.resolve(__dirname, '../shared/loader.ts'),
    },
  },
  server: {
    port: 3004,
    origin: command === "serve" ? `http://localhost:3004` : undefined,
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
