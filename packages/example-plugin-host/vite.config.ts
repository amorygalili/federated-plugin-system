import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";
import { createEsBuildAdapter } from "native-federation-esbuild";
import path from "path";

export default defineConfig(async ({ command }) => ({
  server: {
    port: 3004,
    origin: command === "serve" ? `http://localhost:3004` : undefined,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "federated-plugin-system": path.resolve(__dirname, "../plugin-system/src/index.ts"),
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
