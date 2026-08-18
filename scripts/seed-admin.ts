import "dotenv/config";
import { Argon2PasswordHasher } from "@/infrastructure/auth/argon2-password-hasher";
import { db, pool } from "@/infrastructure/database/db";
import { users } from "@/infrastructure/database/schema";

// Excepción documentada a la regla "nadie lee process.env fuera de env.ts":
// estas tres son entradas del operador para una corrida puntual, no parte del
// contrato de runtime de la app, así que no van al esquema de env.ts.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Falta la variable ${name}. Uso: ` +
        "ADMIN_USERNAME=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin",
    );
  }
  return value;
}

async function main(): Promise<void> {
  const username = requireEnv("ADMIN_USERNAME");
  const email = requireEnv("ADMIN_EMAIL");
  const password = requireEnv("ADMIN_PASSWORD");
  const displayName = process.env.ADMIN_DISPLAY_NAME ?? username;

  const passwordHash = await new Argon2PasswordHasher().hash(password);

  // Upsert por `username`: re-correr el seed rota la contraseña en vez de
  // reventar con un unique violation.
  const [row] = await db
    .insert(users)
    .values({ username, email, passwordHash, role: "admin", displayName, isActive: true })
    .onConflictDoUpdate({
      target: users.username,
      set: { email, passwordHash, displayName, isActive: true, updatedAt: new Date() },
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
    });

  console.log(
    `[seed:admin] usuario listo: id=${row.id} username=${row.username} email=${row.email} role=${row.role}`,
  );
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error("[seed:admin] error:", error instanceof Error ? error.message : error);
    await pool.end().catch(() => undefined);
    process.exit(1);
  });
