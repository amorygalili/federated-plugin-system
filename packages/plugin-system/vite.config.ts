import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";
import { createEsBuildAdapter } from "native-federation-esbuild";
import path from "path";

export default defineConfig(async ({ command }) => ({
  server: {
    port: 3002,
    origin: command === "serve" ? `http://localhost:3002` : undefined,
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
