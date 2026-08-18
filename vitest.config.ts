import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Ningún test unitario toca la DB, pero cualquier import transitivo de
    // `@/infrastructure/config/env` valida process.env al cargarse. Estos
    // valores dummy evitan que ese side-effect tumbe la suite entera.
    env: {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      SESSION_SECRET: "test-session-secret-0123456789",
      NODE_ENV: "test",
    },
  },
});
