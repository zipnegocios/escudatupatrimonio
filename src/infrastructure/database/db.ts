import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/infrastructure/config/env";
import * as schema from "@/infrastructure/database/schema";

// El Pool es lazy: crearlo no abre conexiones, así que importar este módulo
// durante `next build` (donde no hay Postgres) es seguro.
export const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });
