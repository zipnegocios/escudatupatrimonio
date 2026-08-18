import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "@/infrastructure/database/db";

async function main(): Promise<void> {
  console.log("[migrate] aplicando migraciones desde ./drizzle ...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[migrate] migraciones aplicadas correctamente.");
}

// Se cierra el pool en ambas ramas: si queda abierto el proceso no termina y
// el contenedor de Docker se queda colgado antes de arrancar Next.
main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error("[migrate] fallo al aplicar migraciones:", error);
    await pool.end().catch(() => undefined);
    process.exit(1);
  });
