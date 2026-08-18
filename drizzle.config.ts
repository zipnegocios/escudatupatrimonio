import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./src/infrastructure/config/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infrastructure/database/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
