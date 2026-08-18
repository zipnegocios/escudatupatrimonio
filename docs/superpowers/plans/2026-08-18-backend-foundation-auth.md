# Backend Foundation: DB + Auth + Protected Admin Shell — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `smart-form-iul` its first backend: a Postgres database via Drizzle ORM, session-cookie authentication (argon2 + JWT), and a protected `/admin` shell that only a seeded admin user can reach.

**Architecture:** Hexagonal, matching the existing layout — `src/core/ports/` declares interfaces, `src/core/use-cases/auth/` holds the pure branching logic (tested with hand-written in-memory fakes, never a real DB), `src/infrastructure/` holds the Drizzle/argon2/jose adapters plus a single composition root (`src/infrastructure/container.ts`) that wires them. Next.js route handlers under `src/app/api/auth/` and the admin server components are thin glue over those use-cases. The real auth gate is the request-scoped DAL `currentUser()`; `src/proxy.ts` only does an optimistic cookie-presence check for UX.

**Tech Stack:** Next.js 16.2.12 (App Router, `output: "standalone"`), React 19.2.4, TypeScript 5 strict, Tailwind CSS 4, Drizzle ORM + `pg` (Postgres 16), `zod` (validation), `argon2` (password hashing), `jose` (HS256 JWT), Vitest (test runner), `tsx` (script runner), `esbuild` (bundles the migration runner for Docker).

## Global Constraints

- **No `any` anywhere.** Hard project rule from `AGENTS.md`. Use `unknown` + narrowing, or an explicit cast to a named shape (`(data as { reason: unknown })`). Never `any`, never `// eslint-disable` for it.
- **Read the docs before writing Next.js code.** `AGENTS.md` says this Next.js differs from training data. The relevant guides live in `node_modules/next/dist/docs/01-app/`. Two things already confirmed for this plan: `middleware.ts` is renamed to `proxy.ts` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`), and `cookies()` from `next/headers` is **async** — always `await cookies()`.
- **Path alias:** `@/*` → `./src/*` (from `tsconfig.json`). Use it in every new file under `src/`, including files imported by `scripts/`.
- **Never read `process.env` directly** outside `src/infrastructure/config/env.ts`. The single documented exception is `scripts/seed-admin.ts` (one-shot operator inputs `ADMIN_*` that are not part of the app's runtime contract) — it carries a comment saying so.
- **Never touch existing files under `src/presentation/screens/`, `src/presentation/components/`, `src/presentation/state/`, `src/presentation/styles/`.** New admin UI goes in a new folder `src/presentation/admin/`.
- **Comments:** Spanish, and only where they explain a non-obvious *why* — matching `src/core/use-cases/availability.ts` and `src/presentation/constants.ts`. No comments that restate the code.
- **Never log or return a password or `passwordHash`.**
- **Commit messages: Spanish, no AI attribution, no `Co-Authored-By` trailer.**
- Package manager: `npm` (there is a `package-lock.json`).
- Local Postgres credentials used consistently across this entire plan: user `smartform`, password `smartform`, database `smartform`, compose service name `postgres`.

---

### Task 1: Test runner (Vitest) + tsx

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json:5-10` (scripts), `package.json:20-30` (devDependencies)
- Test: `src/core/use-cases/availability.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` runs Vitest over `src/**/*.test.ts` with the `@/*` alias resolved; `npx tsx <file>` runs TypeScript scripts.

- [ ] **Step 1: Install the dev dependencies**

```bash
npm install -D vitest tsx
```

- [ ] **Step 2: Write `vitest.config.ts`**

```ts
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
```

- [ ] **Step 3: Add the `test` script to `package.json`**

Replace the `"scripts"` block with:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
```

- [ ] **Step 4: Write the failing test**

Create `src/core/use-cases/availability.test.ts` — a real test of the existing pure function, which doubles as proof the runner and the `@/` alias work.

```ts
import { describe, expect, it } from "vitest";
import { isBusinessHours } from "@/core/use-cases/availability";

// 2026-08-18 es martes; 2026-08-16 es domingo. America/New_York está en EDT
// (UTC-4) en agosto, así que 14:00Z = 10:00 local.
describe("isBusinessHours", () => {
  it("es true un martes a las 10:00 hora local", () => {
    expect(isBusinessHours("America/New_York", new Date("2026-08-18T14:00:00Z"))).toBe(true);
  });

  it("es false un domingo aunque sea horario hábil", () => {
    expect(isBusinessHours("America/New_York", new Date("2026-08-16T14:00:00Z"))).toBe(false);
  });

  it("es false de madrugada un día hábil", () => {
    expect(isBusinessHours("America/New_York", new Date("2026-08-18T04:00:00Z"))).toBe(false);
  });

  it("es false a las 21:00 exactas (el rango cierra a las 21)", () => {
    expect(isBusinessHours("America/New_York", new Date("2026-08-19T01:00:00Z"))).toBe(false);
  });
});
```

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: PASS — `4 passed` in `src/core/use-cases/availability.test.ts`.

(If the run fails with `Cannot find package '@/core/...'`, the alias in `vitest.config.ts` is wrong — fix it before continuing; every later task depends on it.)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/core/use-cases/availability.test.ts
git commit -m "chore: agrega Vitest y tsx como runner de tests y scripts"
```

---

### Task 2: Validated environment config

**Files:**
- Create: `src/infrastructure/config/env.ts`
- Test: `src/infrastructure/config/env.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export type Env = { DATABASE_URL: string; SESSION_SECRET: string; NODE_ENV: "development" | "test" | "production" }`
  - `export function parseEnv(source: Record<string, string | undefined>): Env`
  - `export const env: Env` (parsed eagerly from `process.env` at module load; throws on invalid input)

- [ ] **Step 1: Install zod**

```bash
npm install zod
```

- [ ] **Step 2: Write the failing test**

Create `src/infrastructure/config/env.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseEnv } from "@/infrastructure/config/env";

const valid = {
  DATABASE_URL: "postgres://smartform:smartform@localhost:5432/smartform",
  SESSION_SECRET: "un-secreto-de-mas-de-16-chars",
};

describe("parseEnv", () => {
  it("devuelve un objeto tipado y aplica development como NODE_ENV por defecto", () => {
    expect(parseEnv(valid)).toEqual({
      DATABASE_URL: "postgres://smartform:smartform@localhost:5432/smartform",
      SESSION_SECRET: "un-secreto-de-mas-de-16-chars",
      NODE_ENV: "development",
    });
  });

  it("acepta el esquema postgresql:// además de postgres://", () => {
    const result = parseEnv({ ...valid, DATABASE_URL: "postgresql://a:b@h:5432/d" });
    expect(result.DATABASE_URL).toBe("postgresql://a:b@h:5432/d");
  });

  it("respeta NODE_ENV=production", () => {
    expect(parseEnv({ ...valid, NODE_ENV: "production" }).NODE_ENV).toBe("production");
  });

  it("lanza nombrando la variable faltante", () => {
    expect(() => parseEnv({ SESSION_SECRET: valid.SESSION_SECRET })).toThrowError(/DATABASE_URL/);
  });

  it("lanza si DATABASE_URL no es una URL de postgres", () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: "mysql://a:b@h/d" })).toThrowError(/DATABASE_URL/);
  });

  it("lanza si SESSION_SECRET es demasiado corto", () => {
    expect(() => parseEnv({ ...valid, SESSION_SECRET: "corto" })).toThrowError(/SESSION_SECRET/);
  });

  it("lanza listando TODAS las variables inválidas de una sola vez", () => {
    let message = "";
    try {
      parseEnv({ SESSION_SECRET: "corto" });
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toContain("DATABASE_URL");
    expect(message).toContain("SESSION_SECRET");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/infrastructure/config/env.test.ts`
Expected: FAIL with `Failed to load url @/infrastructure/config/env` / `Cannot find module`.

- [ ] **Step 4: Write the implementation**

Create `src/infrastructure/config/env.ts`:

```ts
import { z } from "zod";

/**
 * Contrato de variables de entorno de la app. Se valida una sola vez al
 * cargar el módulo: preferimos que el proceso muera al arrancar con un
 * mensaje claro antes que fallar en runtime con un `undefined` a mitad de un
 * request. NADIE más debe leer process.env — importar `env` de acá.
 */
const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "es obligatoria")
    .regex(/^postgres(ql)?:\/\//, "debe ser una URL postgres:// o postgresql://"),
  SESSION_SECRET: z.string().min(16, "debe tener al menos 16 caracteres"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(raíz)"}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Variables de entorno inválidas o faltantes:\n${details}\n` +
        "Revisá .env contra .env.example.",
    );
  }

  return result.data;
}

export const env: Env = parseEnv(process.env);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/infrastructure/config/env.test.ts`
Expected: PASS — `7 passed`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/infrastructure/config/env.ts src/infrastructure/config/env.test.ts
git commit -m "feat: valida las variables de entorno con zod al arrancar"
```

---

### Task 3: Drizzle schema, config and DB client

**Files:**
- Create: `drizzle.config.ts`, `.env.example`, `src/infrastructure/database/schema.ts`, `src/infrastructure/database/db.ts`
- Modify: `package.json` (deps + `db:generate` / `db:migrate` / `db:studio` scripts), `.gitignore` (un-ignore `.env.example`)

**Interfaces:**
- Consumes: `env` from `@/infrastructure/config/env` (Task 2).
- Produces:
  - `export const users`, `export const sessions`, `export const passwordResetTokens` (Drizzle `pgTable`s)
  - `export type User = typeof users.$inferSelect`, `export type NewUser = typeof users.$inferInsert`
  - `export type Session = typeof sessions.$inferSelect`, `export type NewSession = typeof sessions.$inferInsert`
  - `export type PasswordResetToken = typeof passwordResetTokens.$inferSelect`, `export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert`
  - `export const pool: Pool` and `export const db` from `@/infrastructure/database/db`

- [ ] **Step 1: Install dependencies**

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg dotenv
```

(`dotenv` is a devDependency because only the standalone `scripts/*.ts` and `drizzle.config.ts` need to read a `.env` file — Next.js loads `.env` itself for the app, and in Docker the vars come from the container environment.)

- [ ] **Step 2: Write the schema**

Create `src/infrastructure/database/schema.ts`:

```ts
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  displayName: text("display_name"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * `id` es el `jti` del JWT de sesión, generado por la capa de aplicación
 * (`createSession`) — por eso NO lleva `defaultRandom()`: el token y la fila
 * tienen que compartir el mismo identificador para poder revocar una sesión
 * concreta sin invalidar las demás del mismo usuario.
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

// Se guarda el hash del token, nunca el token en claro: si se filtra la tabla,
// los links de reset siguen sin ser utilizables.
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
```

- [ ] **Step 3: Write the DB client**

Create `src/infrastructure/database/db.ts`:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/infrastructure/config/env";
import * as schema from "@/infrastructure/database/schema";

// El Pool es lazy: crearlo no abre conexiones, así que importar este módulo
// durante `next build` (donde no hay Postgres) es seguro.
export const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });
```

- [ ] **Step 4: Write `drizzle.config.ts`**

Create `drizzle.config.ts` at the repo root:

```ts
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
```

- [ ] **Step 5: Write `.env.example`**

Create `.env.example` at the repo root. Placeholder values only — never a real secret.

```bash
# --- App ---------------------------------------------------------------
# Postgres de la app. En dev apunta al servicio `postgres` de
# docker-compose.yml expuesto en localhost:5432.
DATABASE_URL=postgres://user:password@host:port/dbname

# Secreto HS256 con el que se firman los JWT de sesión (mínimo 16 chars).
# Generar con: openssl rand -base64 32
SESSION_SECRET=

NODE_ENV=development

# --- Postgres local (solo docker-compose.yml) ---------------------------
POSTGRES_USER=smartform
POSTGRES_PASSWORD=smartform
POSTGRES_DB=smartform

# --- Seed del admin (solo `npm run seed:admin`, no se leen en runtime) --
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=
ADMIN_DISPLAY_NAME=Luis Moreno
```

- [ ] **Step 6: Un-ignore `.env.example` in `.gitignore`**

`.gitignore` currently has `.env*`, which also ignores `.env.example`. Change that block from:

```
# env files (can opt-in for committing if needed)
.env*
```

to:

```
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

- [ ] **Step 7: Add the db scripts to `package.json`**

Replace the `"scripts"` block with:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:studio": "drizzle-kit studio"
  },
```

- [ ] **Step 8: Manual verification — generate the SQL migration**

```bash
cp .env.example .env
```

Then edit `.env` and set:

```
DATABASE_URL=postgres://smartform:smartform@localhost:5432/smartform
SESSION_SECRET=<pegar el output de: openssl rand -base64 32>
```

Run:

```bash
npm run db:generate
ls drizzle
```

Expected: drizzle-kit prints `3 tables` and writes `drizzle/0000_*.sql` plus `drizzle/meta/`. Then:

```bash
grep -E 'CREATE TABLE' drizzle/0000_*.sql
```

Expected: exactly three matching lines, one per table (order may vary, and depending on the drizzle-kit version each may read `CREATE TABLE "x" (` or `CREATE TABLE IF NOT EXISTS "x" (` — either is fine):

```
CREATE TABLE "users" (
CREATE TABLE "sessions" (
CREATE TABLE "password_reset_tokens" (
```

If a fourth table appears, the schema has more than Milestone 1 needs — remove it before continuing.

- [ ] **Step 9: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example drizzle.config.ts drizzle src/infrastructure/database/schema.ts src/infrastructure/database/db.ts
git commit -m "feat: agrega Drizzle ORM con las tablas users, sessions y password_reset_tokens"
```

---

### Task 4: Local Postgres via docker-compose

**Files:**
- Create: `docker-compose.yml`

**Interfaces:**
- Consumes: `.env` (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) from Task 3.
- Produces: a local Postgres 16 reachable at `localhost:5432` as `smartform/smartform/smartform`, and a `web` service that builds the existing `Dockerfile`.

No unit test: this is pure scaffolding with no logic to assert.

- [ ] **Step 1: Write `docker-compose.yml`**

Create `docker-compose.yml` at the repo root:

```yaml
# SOLO DESARROLLO LOCAL. En producción (EasyPanel) el Postgres es un servicio
# externo ya provisionado y la app se despliega desde el Dockerfile a secas:
# este archivo no se usa allá.
services:
  postgres:
    image: postgres:16-alpine
    container_name: smart-form-iul-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: smart-form-iul-web
    restart: unless-stopped
    env_file: .env
    environment:
      # Dentro de la red de compose el host de Postgres es `postgres`, no
      # `localhost`. Esto pisa el DATABASE_URL de .env, que apunta a localhost
      # porque está pensado para `npm run dev` en la máquina host.
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    depends_on:
      - postgres
    ports:
      - "3000:3000"

volumes:
  postgres-data:
```

- [ ] **Step 2: Manual verification — Postgres accepts connections**

```bash
docker compose up -d postgres
docker compose exec postgres pg_isready -U smartform -d smartform
```

Expected output:

```
/var/run/postgresql:5432 - accepting connections
```

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: agrega docker-compose con Postgres local para desarrollo"
```

---

### Task 5: Migration runner script

**Files:**
- Create: `scripts/migrate.ts`

**Interfaces:**
- Consumes: `db` and `pool` from `@/infrastructure/database/db` (Task 3); the `drizzle/` folder generated in Task 3.
- Produces: `npm run db:migrate` applies all pending migrations, exits `0` on success and `1` on failure, and always closes the pool.

No unit test: the entire body is a call into Drizzle's migrator plus process lifecycle. Verified against the real local Postgres from Task 4.

- [ ] **Step 1: Write the script**

Create `scripts/migrate.ts`:

```ts
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
```

- [ ] **Step 2: Manual verification — run the migration**

```bash
docker compose up -d postgres
npm run db:migrate
```

Expected output:

```
[migrate] aplicando migraciones desde ./drizzle ...
[migrate] migraciones aplicadas correctamente.
```

Then confirm the tables exist:

```bash
docker compose exec postgres psql -U smartform -d smartform -c '\dt'
```

Expected: a table listing containing `users`, `sessions`, `password_reset_tokens` (plus Drizzle's own `__drizzle_migrations` lives in the `drizzle` schema, so it will not appear in this listing).

- [ ] **Step 3: Verify it is idempotent**

Run: `npm run db:migrate`
Expected: same success output, exit code `0`, no error about already-existing tables.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate.ts
git commit -m "feat: agrega el runner de migraciones de Drizzle"
```

---

### Task 6: PasswordHasher port + argon2 adapter

**Files:**
- Create: `src/core/ports/password-hasher.ts`, `src/infrastructure/auth/argon2-password-hasher.ts`
- Test: `src/infrastructure/auth/argon2-password-hasher.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export interface PasswordHasher { hash(plain: string): Promise<string>; verify(plain: string, hash: string): Promise<boolean>; }`
  - `export class Argon2PasswordHasher implements PasswordHasher` (zero-arg constructor)

- [ ] **Step 1: Install argon2**

```bash
npm install argon2
```

If installation fails (no prebuilt binary for this platform / no C++ toolchain), fall back to `bcryptjs`:

```bash
npm uninstall argon2
npm install bcryptjs
npm install -D @types/bcryptjs
```

and use the alternative implementation given in Step 4b instead of 4a. **Record in your final report which one you used.** The port interface, the class name, the file name and the tests stay identical either way, so nothing downstream changes.

- [ ] **Step 2: Write the port**

Create `src/core/ports/password-hasher.ts`:

```ts
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}
```

- [ ] **Step 3: Write the failing test**

Create `src/infrastructure/auth/argon2-password-hasher.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { Argon2PasswordHasher } from "@/infrastructure/auth/argon2-password-hasher";

describe("Argon2PasswordHasher", () => {
  const hasher = new Argon2PasswordHasher();

  it("verifica correctamente el mismo plaintext que hasheó", async () => {
    const hash = await hasher.hash("Sup3rSecret!");
    expect(await hasher.verify("Sup3rSecret!", hash)).toBe(true);
  });

  it("rechaza un plaintext distinto", async () => {
    const hash = await hasher.hash("Sup3rSecret!");
    expect(await hasher.verify("otra-cosa", hash)).toBe(false);
  });

  it("produce hashes distintos para el mismo plaintext (salt aleatorio)", async () => {
    const a = await hasher.hash("Sup3rSecret!");
    const b = await hasher.hash("Sup3rSecret!");
    expect(a).not.toBe(b);
  });

  it("devuelve false ante un hash con formato inválido en vez de lanzar", async () => {
    expect(await hasher.verify("Sup3rSecret!", "esto-no-es-un-hash")).toBe(false);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- src/infrastructure/auth/argon2-password-hasher.test.ts`
Expected: FAIL with `Failed to load url @/infrastructure/auth/argon2-password-hasher`.

- [ ] **Step 4a: Write the implementation (argon2 — try this first)**

Create `src/infrastructure/auth/argon2-password-hasher.ts`:

```ts
import argon2 from "argon2";
import type { PasswordHasher } from "@/core/ports/password-hasher";

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  // argon2.verify lanza si el hash no tiene un formato que reconozca (fila
  // corrupta, hash de otro algoritmo). Para el caller eso es simplemente "no
  // coincide", no un error de programa que deba propagarse.
  async verify(plain: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 4b: Fallback implementation (bcryptjs — ONLY if Step 1's argon2 install failed)**

Create `src/infrastructure/auth/argon2-password-hasher.ts` with this content instead:

```ts
import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/core/ports/password-hasher";

// FALLBACK: argon2 no compiló en este entorno, así que se usa bcryptjs (JS
// puro, sin binario nativo). El nombre de la clase y del archivo se mantienen
// para no arrastrar el cambio al resto de la app.
const COST_FACTOR = 12;

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, COST_FACTOR);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plain, hash);
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/infrastructure/auth/argon2-password-hasher.test.ts`
Expected: PASS — `4 passed`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/core/ports/password-hasher.ts src/infrastructure/auth/argon2-password-hasher.ts src/infrastructure/auth/argon2-password-hasher.test.ts
git commit -m "feat: agrega el puerto PasswordHasher y su adapter argon2"
```

---

### Task 7: SessionTokenService port + jose (JWT) adapter

**Files:**
- Create: `src/core/ports/session-token-service.ts`, `src/infrastructure/auth/jose-session-token-service.ts`
- Test: `src/infrastructure/auth/jose-session-token-service.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export interface SessionTokenPayload { sub: string; jti: string; }`
  - `export interface SessionTokenService { issue(payload: SessionTokenPayload, expiresInSeconds: number): Promise<string>; verify(token: string): Promise<SessionTokenPayload | null>; }`
  - `export class JoseSessionTokenService implements SessionTokenService` with **constructor `(secret: string)`**

- [ ] **Step 1: Install jose**

```bash
npm install jose
```

- [ ] **Step 2: Write the port**

Create `src/core/ports/session-token-service.ts`:

```ts
export interface SessionTokenPayload {
  sub: string;
  jti: string;
}

export interface SessionTokenService {
  issue(payload: SessionTokenPayload, expiresInSeconds: number): Promise<string>;
  // Devuelve null (no lanza) ante token inválido/expirado: para el caller es
  // el camino esperado, no una excepción que haya que envolver en try/catch.
  verify(token: string): Promise<SessionTokenPayload | null>;
}
```

- [ ] **Step 3: Write the failing test**

Create `src/infrastructure/auth/jose-session-token-service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { JoseSessionTokenService } from "@/infrastructure/auth/jose-session-token-service";

const SECRET = "secreto-de-prueba-de-mas-de-16-chars";

describe("JoseSessionTokenService", () => {
  const service = new JoseSessionTokenService(SECRET);

  it("hace round-trip del payload emitido", async () => {
    const token = await service.issue({ sub: "user-1", jti: "sess-1" }, 3600);
    expect(await service.verify(token)).toEqual({ sub: "user-1", jti: "sess-1" });
  });

  it("devuelve null ante un string que no es un JWT", async () => {
    expect(await service.verify("basura")).toBeNull();
  });

  it("devuelve null ante un JWT manipulado", async () => {
    const token = await service.issue({ sub: "user-1", jti: "sess-1" }, 3600);
    expect(await service.verify(`${token}x`)).toBeNull();
  });

  it("devuelve null ante un token expirado", async () => {
    const token = await service.issue({ sub: "user-1", jti: "sess-1" }, -60);
    expect(await service.verify(token)).toBeNull();
  });

  it("devuelve null ante un token firmado con otro secreto", async () => {
    const otro = new JoseSessionTokenService("otro-secreto-distinto-1234567890");
    const token = await otro.issue({ sub: "user-1", jti: "sess-1" }, 3600);
    expect(await service.verify(token)).toBeNull();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- src/infrastructure/auth/jose-session-token-service.test.ts`
Expected: FAIL with `Failed to load url @/infrastructure/auth/jose-session-token-service`.

- [ ] **Step 5: Write the implementation**

Create `src/infrastructure/auth/jose-session-token-service.ts`:

```ts
import { SignJWT, jwtVerify } from "jose";
import type {
  SessionTokenPayload,
  SessionTokenService,
} from "@/core/ports/session-token-service";

const ALGORITHM = "HS256";

export class JoseSessionTokenService implements SessionTokenService {
  private readonly secret: Uint8Array;

  // El secreto se inyecta en vez de leerlo de `env` acá: así el adapter se
  // testea sin process.env y todo el wiring queda en el composition root.
  constructor(secret: string) {
    this.secret = new TextEncoder().encode(secret);
  }

  async issue(payload: SessionTokenPayload, expiresInSeconds: number): Promise<string> {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return new SignJWT({})
      .setProtectedHeader({ alg: ALGORITHM })
      .setSubject(payload.sub)
      .setJti(payload.jti)
      .setIssuedAt(nowInSeconds)
      .setExpirationTime(nowInSeconds + expiresInSeconds)
      .sign(this.secret);
  }

  async verify(token: string): Promise<SessionTokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: [ALGORITHM],
      });

      // jose tipa sub/jti como opcionales: sin estos dos el token no sirve
      // para identificar ni la sesión ni al usuario.
      if (typeof payload.sub !== "string" || typeof payload.jti !== "string") {
        return null;
      }

      return { sub: payload.sub, jti: payload.jti };
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- src/infrastructure/auth/jose-session-token-service.test.ts`
Expected: PASS — `5 passed`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/core/ports/session-token-service.ts src/infrastructure/auth/jose-session-token-service.ts src/infrastructure/auth/jose-session-token-service.test.ts
git commit -m "feat: agrega el puerto SessionTokenService y su adapter con jose"
```

---

### Task 8: UserRepository and SessionRepository ports + Drizzle adapters

**Files:**
- Create: `src/core/ports/user-repository.ts`, `src/core/ports/session-repository.ts`, `src/infrastructure/database/repositories/drizzle-user-repository.ts`, `src/infrastructure/database/repositories/drizzle-session-repository.ts`
- Create (temporary, deleted in Step 6): `scripts/tmp-check-repos.ts`

**Interfaces:**
- Consumes: `db`, `pool`, `users`, `sessions`, `User`, `Session`, `NewSession` from Task 3.
- Produces:
  - `export interface UserRepository { findByUsernameOrEmail(identifier: string): Promise<User | null>; findById(id: string): Promise<User | null>; updateLastLogin(id: string, when: Date): Promise<void>; }` plus a re-export `export type { User }`
  - `export type NewSessionRecord = NewSession` and `export interface SessionRepository { create(session: NewSessionRecord): Promise<void>; findById(id: string): Promise<Session | null>; revoke(id: string): Promise<void>; }` plus a re-export `export type { Session }`
  - `export class DrizzleUserRepository implements UserRepository` (zero-arg constructor)
  - `export class DrizzleSessionRepository implements SessionRepository` (zero-arg constructor)

**Why manual verification instead of a unit test:** these adapters contain no branching logic of their own beyond `rows[0] ?? null` — everything else is Drizzle's query builder. A unit test would have to fake `db`, which means asserting that the mock was called the way the mock was written. The behaviour worth verifying is that the SQL actually round-trips against a real Postgres, so that is what Step 5 does.

- [ ] **Step 1: Write the user repository port**

Create `src/core/ports/user-repository.ts`:

```ts
import type { User } from "@/infrastructure/database/schema";

// Se reexporta para que las use-cases dependan del puerto y no tengan que
// importar tipos desde infrastructure.
export type { User };

export interface UserRepository {
  findByUsernameOrEmail(identifier: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateLastLogin(id: string, when: Date): Promise<void>;
}
```

- [ ] **Step 2: Write the session repository port**

Create `src/core/ports/session-repository.ts`:

```ts
import type { NewSession, Session } from "@/infrastructure/database/schema";

export type NewSessionRecord = NewSession;
export type { Session };

export interface SessionRepository {
  create(session: NewSessionRecord): Promise<void>;
  findById(id: string): Promise<Session | null>;
  revoke(id: string): Promise<void>;
}
```

- [ ] **Step 3: Write the Drizzle user repository**

Create `src/infrastructure/database/repositories/drizzle-user-repository.ts`:

```ts
import { eq, or } from "drizzle-orm";
import type { UserRepository } from "@/core/ports/user-repository";
import { db } from "@/infrastructure/database/db";
import { users, type User } from "@/infrastructure/database/schema";

export class DrizzleUserRepository implements UserRepository {
  async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier), eq(users.email, identifier)))
      .limit(1);

    return rows[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async updateLastLogin(id: string, when: Date): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: when, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}
```

- [ ] **Step 4: Write the Drizzle session repository**

Create `src/infrastructure/database/repositories/drizzle-session-repository.ts`:

```ts
import { and, eq, isNull } from "drizzle-orm";
import type { NewSessionRecord, SessionRepository } from "@/core/ports/session-repository";
import { db } from "@/infrastructure/database/db";
import { sessions, type Session } from "@/infrastructure/database/schema";

export class DrizzleSessionRepository implements SessionRepository {
  async create(session: NewSessionRecord): Promise<void> {
    await db.insert(sessions).values(session);
  }

  async findById(id: string): Promise<Session | null> {
    const rows = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return rows[0] ?? null;
  }

  // El `isNull(revokedAt)` hace la revocación idempotente: un doble logout o
  // un retry de red no debe pisar el timestamp original ni fallar.
  async revoke(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.id, id), isNull(sessions.revokedAt)));
  }
}
```

- [ ] **Step 5: Manual verification against real Postgres**

Create the temporary script `scripts/tmp-check-repos.ts`:

```ts
// TEMPORAL — se borra apenas se verifica. Ejercita los adapters Drizzle
// contra el Postgres local de docker-compose y limpia lo que crea.
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "@/infrastructure/database/db";
import { users } from "@/infrastructure/database/schema";
import { DrizzleSessionRepository } from "@/infrastructure/database/repositories/drizzle-session-repository";
import { DrizzleUserRepository } from "@/infrastructure/database/repositories/drizzle-user-repository";

async function main(): Promise<void> {
  const userRepository = new DrizzleUserRepository();
  const sessionRepository = new DrizzleSessionRepository();

  const [created] = await db
    .insert(users)
    .values({
      username: "check-user",
      email: "check-user@example.com",
      passwordHash: "no-importa",
    })
    .returning();

  console.log("findByUsernameOrEmail(username):", (await userRepository.findByUsernameOrEmail("check-user"))?.id === created.id);
  console.log("findByUsernameOrEmail(email):", (await userRepository.findByUsernameOrEmail("check-user@example.com"))?.id === created.id);
  console.log("findById:", (await userRepository.findById(created.id))?.id === created.id);
  console.log("findByUsernameOrEmail(inexistente) es null:", (await userRepository.findByUsernameOrEmail("no-existe")) === null);

  await userRepository.updateLastLogin(created.id, new Date("2026-08-18T12:00:00.000Z"));
  const afterLogin = await userRepository.findById(created.id);
  console.log("updateLastLogin:", afterLogin?.lastLoginAt?.toISOString() === "2026-08-18T12:00:00.000Z");

  const jti = randomUUID();
  await sessionRepository.create({
    id: jti,
    userId: created.id,
    userAgent: "check-script",
    ip: "127.0.0.1",
    expiresAt: new Date(Date.now() + 60_000),
  });
  const session = await sessionRepository.findById(jti);
  console.log("session create+findById:", session?.id === jti && session?.revokedAt === null && session?.userAgent === "check-script");

  await sessionRepository.revoke(jti);
  console.log("revoke:", (await sessionRepository.findById(jti))?.revokedAt instanceof Date);
  console.log("findById(inexistente) es null:", (await sessionRepository.findById(randomUUID())) === null);

  await db.delete(users).where(eq(users.id, created.id));
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await pool.end().catch(() => undefined);
    process.exit(1);
  });
```

Run it (Postgres must be up and migrated — Tasks 4 and 5):

```bash
docker compose up -d postgres
npx tsx scripts/tmp-check-repos.ts
```

Expected output — **every line must end in `true`**:

```
findByUsernameOrEmail(username): true
findByUsernameOrEmail(email): true
findById: true
findByUsernameOrEmail(inexistente) es null: true
updateLastLogin: true
session create+findById: true
revoke: true
findById(inexistente) es null: true
```

Then confirm the script cleaned up after itself:

```bash
docker compose exec postgres psql -U smartform -d smartform -c "select count(*) from users where username = 'check-user'"
```

Expected: `count` is `0`.

- [ ] **Step 6: Delete the temporary script**

```bash
rm scripts/tmp-check-repos.ts
```

- [ ] **Step 7: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/core/ports/user-repository.ts src/core/ports/session-repository.ts src/infrastructure/database/repositories
git commit -m "feat: agrega los puertos de repositorio de usuarios y sesiones con adapters Drizzle"
```

---

### Task 9: `authenticateUser` use-case (+ in-memory fakes)

**Files:**
- Create: `src/core/use-cases/auth/__fakes__/in-memory-adapters.ts`, `src/core/use-cases/auth/authenticate-user.ts`
- Test: `src/core/use-cases/auth/authenticate-user.test.ts`

**Interfaces:**
- Consumes: `PasswordHasher` (Task 6), `UserRepository`, `User` (Task 8), `SessionRepository`, `NewSessionRecord`, `Session` (Task 8), `SessionTokenService`, `SessionTokenPayload` (Task 7).
- Produces:
  - From `__fakes__/in-memory-adapters.ts`: `export function buildUser(overrides?: Partial<User>): User`, `export class InMemoryUserRepository implements UserRepository` (constructor `(users?: User[])`, `readonly users: User[]`, `readonly lastLoginCalls: Array<{ id: string; when: Date }>`), `export class FakePasswordHasher implements PasswordHasher`, `export class InMemorySessionRepository implements SessionRepository` (`readonly rows: Map<string, Session>`, `readonly revokeCalls: string[]`), `export class FakeSessionTokenService implements SessionTokenService`
  - `export type AuthenticateUserFailureReason = "NOT_FOUND" | "INVALID_PASSWORD" | "INACTIVE"`
  - `export type AuthenticateUserResult = { ok: true; user: User } | { ok: false; reason: AuthenticateUserFailureReason }`
  - `export interface AuthenticateUserDeps { userRepository: UserRepository; passwordHasher: PasswordHasher }`
  - `export interface AuthenticateUserInput { identifier: string; password: string }`
  - `export async function authenticateUser(deps: AuthenticateUserDeps, input: AuthenticateUserInput): Promise<AuthenticateUserResult>`

- [ ] **Step 1: Write the in-memory fakes**

Create `src/core/use-cases/auth/__fakes__/in-memory-adapters.ts`. (Not a `.test.ts` file, so Vitest's `include` will not pick it up as a suite; nothing in `src/app/` imports it, so it never reaches the bundle.)

```ts
import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { NewSessionRecord, SessionRepository } from "@/core/ports/session-repository";
import type {
  SessionTokenPayload,
  SessionTokenService,
} from "@/core/ports/session-token-service";
import type { User, UserRepository } from "@/core/ports/user-repository";
import type { Session } from "@/infrastructure/database/schema";

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    username: "admin",
    email: "admin@example.com",
    passwordHash: "hash:secreta",
    role: "admin",
    displayName: "Luis Moreno",
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export class InMemoryUserRepository implements UserRepository {
  readonly users: User[];
  readonly lastLoginCalls: Array<{ id: string; when: Date }> = [];

  constructor(users: User[] = []) {
    this.users = [...users];
  }

  async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    return (
      this.users.find((user) => user.username === identifier || user.email === identifier) ?? null
    );
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async updateLastLogin(id: string, when: Date): Promise<void> {
    this.lastLoginCalls.push({ id, when });
  }
}

// Hash de juguete `hash:<plain>`. Ejercita las ramas de las use-cases sin
// pagar los ~100ms de argon2 en cada assertion.
export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hash:${plain}`;
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return hash === `hash:${plain}`;
  }
}

export class InMemorySessionRepository implements SessionRepository {
  readonly rows = new Map<string, Session>();
  readonly revokeCalls: string[] = [];

  async create(session: NewSessionRecord): Promise<void> {
    this.rows.set(session.id, {
      id: session.id,
      userId: session.userId,
      userAgent: session.userAgent ?? null,
      ip: session.ip ?? null,
      createdAt: new Date(),
      expiresAt: session.expiresAt,
      revokedAt: null,
    });
  }

  async findById(id: string): Promise<Session | null> {
    return this.rows.get(id) ?? null;
  }

  async revoke(id: string): Promise<void> {
    this.revokeCalls.push(id);
    const existing = this.rows.get(id);
    if (existing !== undefined && existing.revokedAt === null) {
      this.rows.set(id, { ...existing, revokedAt: new Date() });
    }
  }
}

// Token de juguete `<sub>.<jti>.<expEnMs>`: no cifra nada, solo permite
// verificar el round-trip y la expiración desde las use-cases.
export class FakeSessionTokenService implements SessionTokenService {
  async issue(payload: SessionTokenPayload, expiresInSeconds: number): Promise<string> {
    return `${payload.sub}.${payload.jti}.${Date.now() + expiresInSeconds * 1000}`;
  }

  async verify(token: string): Promise<SessionTokenPayload | null> {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [sub, jti, expiresAtMs] = parts;
    const expiry = Number(expiresAtMs);
    if (!Number.isFinite(expiry) || expiry <= Date.now()) {
      return null;
    }

    return { sub, jti };
  }
}
```

- [ ] **Step 2: Write the failing test**

Create `src/core/use-cases/auth/authenticate-user.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { authenticateUser } from "@/core/use-cases/auth/authenticate-user";
import {
  FakePasswordHasher,
  InMemoryUserRepository,
  buildUser,
} from "@/core/use-cases/auth/__fakes__/in-memory-adapters";

describe("authenticateUser", () => {
  const passwordHasher = new FakePasswordHasher();

  it("devuelve NOT_FOUND si no hay usuario con ese identificador", async () => {
    const userRepository = new InMemoryUserRepository([]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "nadie", password: "secreta" },
    );
    expect(result).toEqual({ ok: false, reason: "NOT_FOUND" });
  });

  it("devuelve INACTIVE aunque la contraseña sea correcta", async () => {
    const userRepository = new InMemoryUserRepository([buildUser({ isActive: false })]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "admin", password: "secreta" },
    );
    expect(result).toEqual({ ok: false, reason: "INACTIVE" });
  });

  it("devuelve INVALID_PASSWORD si la contraseña no coincide", async () => {
    const userRepository = new InMemoryUserRepository([buildUser()]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "admin", password: "incorrecta" },
    );
    expect(result).toEqual({ ok: false, reason: "INVALID_PASSWORD" });
  });

  it("devuelve ok con el usuario cuando el identificador es el username", async () => {
    const user = buildUser();
    const userRepository = new InMemoryUserRepository([user]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "admin", password: "secreta" },
    );
    expect(result).toEqual({ ok: true, user });
  });

  it("acepta también el email como identificador", async () => {
    const user = buildUser();
    const userRepository = new InMemoryUserRepository([user]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "admin@example.com", password: "secreta" },
    );
    expect(result).toEqual({ ok: true, user });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/core/use-cases/auth/authenticate-user.test.ts`
Expected: FAIL with `Failed to load url @/core/use-cases/auth/authenticate-user`.

- [ ] **Step 4: Write the implementation**

Create `src/core/use-cases/auth/authenticate-user.ts`:

```ts
import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { User, UserRepository } from "@/core/ports/user-repository";

export type AuthenticateUserFailureReason = "NOT_FOUND" | "INVALID_PASSWORD" | "INACTIVE";

export type AuthenticateUserResult =
  | { ok: true; user: User }
  | { ok: false; reason: AuthenticateUserFailureReason };

export interface AuthenticateUserDeps {
  userRepository: UserRepository;
  passwordHasher: PasswordHasher;
}

export interface AuthenticateUserInput {
  identifier: string;
  password: string;
}

export async function authenticateUser(
  deps: AuthenticateUserDeps,
  input: AuthenticateUserInput,
): Promise<AuthenticateUserResult> {
  const user = await deps.userRepository.findByUsernameOrEmail(input.identifier);

  if (user === null) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  // Se corta antes de verificar el hash: una cuenta desactivada no debe poder
  // entrar ni con la contraseña correcta.
  if (!user.isActive) {
    return { ok: false, reason: "INACTIVE" };
  }

  const matches = await deps.passwordHasher.verify(input.password, user.passwordHash);
  if (!matches) {
    return { ok: false, reason: "INVALID_PASSWORD" };
  }

  return { ok: true, user };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/core/use-cases/auth/authenticate-user.test.ts`
Expected: PASS — `5 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/core/use-cases/auth
git commit -m "feat: agrega la use-case authenticateUser con fakes en memoria"
```

---

### Task 10: `createSession` use-case

**Files:**
- Create: `src/core/use-cases/auth/create-session.ts`
- Test: `src/core/use-cases/auth/create-session.test.ts`

**Interfaces:**
- Consumes: `SessionRepository` (Task 8), `SessionTokenService` (Task 7), `InMemorySessionRepository` / `FakeSessionTokenService` (Task 9).
- Produces:
  - `export interface CreateSessionDeps { sessionRepository: SessionRepository; sessionTokenService: SessionTokenService }`
  - `export interface CreateSessionInput { userId: string; userAgent: string | null; ip: string | null; ttlSeconds: number }`
  - `export interface CreateSessionResult { token: string; expiresAt: Date }`
  - `export async function createSession(deps: CreateSessionDeps, input: CreateSessionInput): Promise<CreateSessionResult>`

- [ ] **Step 1: Write the failing test**

Create `src/core/use-cases/auth/create-session.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createSession } from "@/core/use-cases/auth/create-session";
import {
  FakeSessionTokenService,
  InMemorySessionRepository,
} from "@/core/use-cases/auth/__fakes__/in-memory-adapters";

describe("createSession", () => {
  it("persiste la fila y emite un token cuyo jti apunta a esa misma fila", async () => {
    const sessionRepository = new InMemorySessionRepository();
    const sessionTokenService = new FakeSessionTokenService();

    const result = await createSession(
      { sessionRepository, sessionTokenService },
      { userId: "user-1", userAgent: "vitest", ip: "127.0.0.1", ttlSeconds: 3600 },
    );

    const payload = await sessionTokenService.verify(result.token);
    if (payload === null) {
      throw new Error("el token recién emitido debería verificar");
    }

    expect(payload.sub).toBe("user-1");

    const stored = await sessionRepository.findById(payload.jti);
    if (stored === null) {
      throw new Error("la sesión debería estar persistida bajo el jti del token");
    }

    expect(stored.userId).toBe("user-1");
    expect(stored.userAgent).toBe("vitest");
    expect(stored.ip).toBe("127.0.0.1");
    expect(stored.revokedAt).toBeNull();
  });

  it("devuelve un expiresAt coherente con el ttl y lo persiste igual", async () => {
    const sessionRepository = new InMemorySessionRepository();
    const sessionTokenService = new FakeSessionTokenService();
    const before = Date.now();

    const result = await createSession(
      { sessionRepository, sessionTokenService },
      { userId: "user-1", userAgent: null, ip: null, ttlSeconds: 60 },
    );

    const after = Date.now();
    expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 60_000);
    expect(result.expiresAt.getTime()).toBeLessThanOrEqual(after + 60_000);

    const [stored] = [...sessionRepository.rows.values()];
    expect(stored.expiresAt.getTime()).toBe(result.expiresAt.getTime());
    expect(stored.userAgent).toBeNull();
    expect(stored.ip).toBeNull();
  });

  it("genera un jti distinto en cada llamada", async () => {
    const sessionRepository = new InMemorySessionRepository();
    const sessionTokenService = new FakeSessionTokenService();
    const input = { userId: "user-1", userAgent: null, ip: null, ttlSeconds: 3600 };

    await createSession({ sessionRepository, sessionTokenService }, input);
    await createSession({ sessionRepository, sessionTokenService }, input);

    expect(sessionRepository.rows.size).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/core/use-cases/auth/create-session.test.ts`
Expected: FAIL with `Failed to load url @/core/use-cases/auth/create-session`.

- [ ] **Step 3: Write the implementation**

Create `src/core/use-cases/auth/create-session.ts`:

```ts
import { randomUUID } from "node:crypto";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenService } from "@/core/ports/session-token-service";

export interface CreateSessionDeps {
  sessionRepository: SessionRepository;
  sessionTokenService: SessionTokenService;
}

export interface CreateSessionInput {
  userId: string;
  userAgent: string | null;
  ip: string | null;
  ttlSeconds: number;
}

export interface CreateSessionResult {
  token: string;
  expiresAt: Date;
}

export async function createSession(
  deps: CreateSessionDeps,
  input: CreateSessionInput,
): Promise<CreateSessionResult> {
  // El id de la fila ES el `jti` del JWT: sin esa igualdad no se puede revocar
  // una sesión concreta, solo invalidar el secreto para todos.
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + input.ttlSeconds * 1000);

  // Primero la fila y después el token: si falla el insert nunca sale a la
  // calle un JWT que no tiene sesión detrás.
  await deps.sessionRepository.create({
    id: jti,
    userId: input.userId,
    userAgent: input.userAgent,
    ip: input.ip,
    expiresAt,
  });

  const token = await deps.sessionTokenService.issue(
    { sub: input.userId, jti },
    input.ttlSeconds,
  );

  return { token, expiresAt };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/core/use-cases/auth/create-session.test.ts`
Expected: PASS — `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/core/use-cases/auth/create-session.ts src/core/use-cases/auth/create-session.test.ts
git commit -m "feat: agrega la use-case createSession"
```

---

### Task 11: `verifySession` and `revokeSession` use-cases

**Files:**
- Create: `src/core/use-cases/auth/verify-session.ts`, `src/core/use-cases/auth/revoke-session.ts`
- Test: `src/core/use-cases/auth/verify-session.test.ts`, `src/core/use-cases/auth/revoke-session.test.ts`

**Interfaces:**
- Consumes: `SessionRepository` (Task 8), `SessionTokenService` (Task 7), `UserRepository` / `User` (Task 8), the fakes from Task 9.
- Produces:
  - `export interface VerifySessionDeps { sessionRepository: SessionRepository; sessionTokenService: SessionTokenService; userRepository: UserRepository }`
  - `export interface VerifiedSession { user: User; jti: string }`
  - `export async function verifySession(deps: VerifySessionDeps, token: string): Promise<VerifiedSession | null>`
  - `export interface RevokeSessionDeps { sessionRepository: SessionRepository }`
  - `export async function revokeSession(deps: RevokeSessionDeps, jti: string): Promise<void>`

> **Note on the return type — read before implementing.** `verifySession` returns `{ user, jti }`, **not** a bare `User`. The `POST /api/auth/logout` handler (Task 14) needs the `jti` to revoke that exact session, and the alternative (decoding the JWT without verifying it, just to read the jti) would mean acting on an unverified claim. Returning the jti alongside the user is decided here, once, so every consumer downstream (Tasks 14 and 15) uses the same shape.

- [ ] **Step 1: Write the failing test for `verifySession`**

Create `src/core/use-cases/auth/verify-session.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createSession } from "@/core/use-cases/auth/create-session";
import { verifySession } from "@/core/use-cases/auth/verify-session";
import {
  FakeSessionTokenService,
  InMemorySessionRepository,
  InMemoryUserRepository,
  buildUser,
} from "@/core/use-cases/auth/__fakes__/in-memory-adapters";

function buildDeps(users = [buildUser()]) {
  return {
    sessionRepository: new InMemorySessionRepository(),
    sessionTokenService: new FakeSessionTokenService(),
    userRepository: new InMemoryUserRepository(users),
  };
}

describe("verifySession", () => {
  it("devuelve el usuario y el jti para una sesión válida", async () => {
    const deps = buildDeps();
    const { token } = await createSession(deps, {
      userId: "user-1",
      userAgent: null,
      ip: null,
      ttlSeconds: 3600,
    });

    const result = await verifySession(deps, token);
    if (result === null) {
      throw new Error("la sesión recién creada debería verificar");
    }

    expect(result.user.id).toBe("user-1");
    expect(deps.sessionRepository.rows.has(result.jti)).toBe(true);
  });

  it("devuelve null si el token no es verificable", async () => {
    expect(await verifySession(buildDeps(), "basura")).toBeNull();
  });

  it("devuelve null si el token es válido pero no existe la fila de sesión", async () => {
    const deps = buildDeps();
    const token = await deps.sessionTokenService.issue(
      { sub: "user-1", jti: "sesion-fantasma" },
      3600,
    );
    expect(await verifySession(deps, token)).toBeNull();
  });

  it("devuelve null si la sesión fue revocada", async () => {
    const deps = buildDeps();
    const { token } = await createSession(deps, {
      userId: "user-1",
      userAgent: null,
      ip: null,
      ttlSeconds: 3600,
    });
    const [jti] = [...deps.sessionRepository.rows.keys()];
    await deps.sessionRepository.revoke(jti);

    expect(await verifySession(deps, token)).toBeNull();
  });

  it("devuelve null si la fila de sesión ya expiró aunque el token siga vivo", async () => {
    const deps = buildDeps();
    const token = await deps.sessionTokenService.issue({ sub: "user-1", jti: "sesion-1" }, 3600);
    await deps.sessionRepository.create({
      id: "sesion-1",
      userId: "user-1",
      userAgent: null,
      ip: null,
      expiresAt: new Date(Date.now() - 1000),
    });

    expect(await verifySession(deps, token)).toBeNull();
  });

  it("devuelve null si el usuario de la sesión ya no existe", async () => {
    const deps = buildDeps([]);
    const { token } = await createSession(deps, {
      userId: "user-borrado",
      userAgent: null,
      ip: null,
      ttlSeconds: 3600,
    });

    expect(await verifySession(deps, token)).toBeNull();
  });

  it("devuelve null si el usuario fue desactivado después de iniciar sesión", async () => {
    const deps = buildDeps([buildUser({ isActive: false })]);
    const { token } = await createSession(deps, {
      userId: "user-1",
      userAgent: null,
      ip: null,
      ttlSeconds: 3600,
    });

    expect(await verifySession(deps, token)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/core/use-cases/auth/verify-session.test.ts`
Expected: FAIL with `Failed to load url @/core/use-cases/auth/verify-session`.

- [ ] **Step 3: Write `verify-session.ts`**

Create `src/core/use-cases/auth/verify-session.ts`:

```ts
import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenService } from "@/core/ports/session-token-service";
import type { User, UserRepository } from "@/core/ports/user-repository";

export interface VerifySessionDeps {
  sessionRepository: SessionRepository;
  sessionTokenService: SessionTokenService;
  userRepository: UserRepository;
}

/**
 * Se devuelve el `jti` junto al usuario porque el logout necesita revocar esa
 * sesión puntual: la alternativa sería decodificar el JWT sin verificarlo solo
 * para leer el jti, o sea actuar sobre un claim no verificado.
 */
export interface VerifiedSession {
  user: User;
  jti: string;
}

export async function verifySession(
  deps: VerifySessionDeps,
  token: string,
): Promise<VerifiedSession | null> {
  const payload = await deps.sessionTokenService.verify(token);
  if (payload === null) {
    return null;
  }

  // El JWT ser válido no alcanza: la fila es la que manda, para que un logout
  // invalide el token de verdad en vez de esperar a que expire.
  const session = await deps.sessionRepository.findById(payload.jti);
  if (session === null) {
    return null;
  }

  if (session.revokedAt !== null) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  const user = await deps.userRepository.findById(session.userId);
  if (user === null) {
    return null;
  }

  if (!user.isActive) {
    return null;
  }

  return { user, jti: payload.jti };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/core/use-cases/auth/verify-session.test.ts`
Expected: PASS — `7 passed`.

- [ ] **Step 5: Write the failing test for `revokeSession`**

Create `src/core/use-cases/auth/revoke-session.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { revokeSession } from "@/core/use-cases/auth/revoke-session";
import { InMemorySessionRepository } from "@/core/use-cases/auth/__fakes__/in-memory-adapters";

describe("revokeSession", () => {
  it("delega la revocación al repositorio con el jti recibido", async () => {
    const sessionRepository = new InMemorySessionRepository();
    await revokeSession({ sessionRepository }, "sesion-1");
    expect(sessionRepository.revokeCalls).toEqual(["sesion-1"]);
  });

  it("no falla al revocar una sesión inexistente", async () => {
    const sessionRepository = new InMemorySessionRepository();
    await expect(revokeSession({ sessionRepository }, "no-existe")).resolves.toBeUndefined();
  });

  it("marca revokedAt en la fila cuando la sesión existe", async () => {
    const sessionRepository = new InMemorySessionRepository();
    await sessionRepository.create({
      id: "sesion-1",
      userId: "user-1",
      userAgent: null,
      ip: null,
      expiresAt: new Date(Date.now() + 60_000),
    });

    await revokeSession({ sessionRepository }, "sesion-1");

    expect((await sessionRepository.findById("sesion-1"))?.revokedAt).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- src/core/use-cases/auth/revoke-session.test.ts`
Expected: FAIL with `Failed to load url @/core/use-cases/auth/revoke-session`.

- [ ] **Step 7: Write `revoke-session.ts`**

Create `src/core/use-cases/auth/revoke-session.ts`:

```ts
import type { SessionRepository } from "@/core/ports/session-repository";

export interface RevokeSessionDeps {
  sessionRepository: SessionRepository;
}

export async function revokeSession(deps: RevokeSessionDeps, jti: string): Promise<void> {
  await deps.sessionRepository.revoke(jti);
}
```

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green (`availability`, `env`, `argon2-password-hasher`, `jose-session-token-service`, `authenticate-user`, `create-session`, `verify-session`, `revoke-session`).

- [ ] **Step 9: Commit**

```bash
git add src/core/use-cases/auth/verify-session.ts src/core/use-cases/auth/verify-session.test.ts src/core/use-cases/auth/revoke-session.ts src/core/use-cases/auth/revoke-session.test.ts
git commit -m "feat: agrega las use-cases verifySession y revokeSession"
```

---

### Task 12: Seed admin script

**Files:**
- Create: `scripts/seed-admin.ts`
- Modify: `package.json` (add the `seed:admin` script)

**Interfaces:**
- Consumes: `db`, `pool`, `users` (Task 3), `Argon2PasswordHasher` (Task 6).
- Produces: `npm run seed:admin` upserts the admin row by `username`.

No unit test: a one-shot operator script whose only logic is "read three env vars, hash, upsert". Verified against the real DB.

- [ ] **Step 1: Write the script**

Create `scripts/seed-admin.ts`:

```ts
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
```

- [ ] **Step 2: Add the script to `package.json`**

Replace the `"scripts"` block with:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:studio": "drizzle-kit studio",
    "seed:admin": "tsx scripts/seed-admin.ts"
  },
```

- [ ] **Step 3: Manual verification — seed the admin**

Set a password you will reuse for every remaining task's verification. This plan uses `Adm1n-Local-2026!` as that value.

bash / Git Bash:

```bash
docker compose up -d postgres
ADMIN_USERNAME=admin ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='Adm1n-Local-2026!' ADMIN_DISPLAY_NAME='Luis Moreno' npm run seed:admin
```

PowerShell:

```powershell
$env:ADMIN_USERNAME='admin'; $env:ADMIN_EMAIL='admin@example.com'; $env:ADMIN_PASSWORD='Adm1n-Local-2026!'; $env:ADMIN_DISPLAY_NAME='Luis Moreno'; npm run seed:admin
```

Expected output (uuid will differ):

```
[seed:admin] usuario listo: id=<uuid> username=admin email=admin@example.com role=admin
```

Then confirm the row and that the password was never logged:

```bash
docker compose exec postgres psql -U smartform -d smartform -c "select username, email, role, is_active from users"
```

Expected:

```
 username |       email       | role  | is_active
----------+-------------------+-------+-----------
 admin    | admin@example.com | admin | t
(1 row)
```

- [ ] **Step 4: Verify the upsert is safe to re-run**

Run the same seed command again.
Expected: same success line, still `(1 row)` in the table — no unique-violation error.

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/seed-admin.ts
git commit -m "feat: agrega el script de seed del usuario admin"
```

---

### Task 13: Composition root + `POST /api/auth/login`

**Files:**
- Create: `src/infrastructure/auth/session-cookie.ts`, `src/infrastructure/container.ts`, `src/app/api/auth/login/route.ts`

**Interfaces:**
- Consumes: `env` (Task 2), `Argon2PasswordHasher` (Task 6), `JoseSessionTokenService` (Task 7), `DrizzleUserRepository` / `DrizzleSessionRepository` (Task 8), `authenticateUser` (Task 9), `createSession` (Task 10).
- Produces:
  - From `@/infrastructure/auth/session-cookie`: `export const SESSION_COOKIE_NAME = "session"`, `export const SESSION_TTL_SECONDS: number`
  - From `@/infrastructure/container`: `export const userRepository: UserRepository`, `export const sessionRepository: SessionRepository`, `export const passwordHasher: PasswordHasher`, `export const sessionTokenService: SessionTokenService`
  - `POST /api/auth/login` → `200 { ok: true, user: { id, username, email, role } }` + `Set-Cookie: session=...`; `400 { ok: false, reason: "INVALID_BODY" }`; `401 { ok: false, reason: "NOT_FOUND" | "INVALID_PASSWORD" | "INACTIVE" }`

No unit test: framework glue. Verified with `curl` against `npm run dev`.

- [ ] **Step 1: Install `server-only`**

```bash
npm install server-only
```

- [ ] **Step 2: Write the cookie constants module**

Create `src/infrastructure/auth/session-cookie.ts`. It deliberately has **zero imports** so that `src/proxy.ts` (Task 16) can import it without dragging `pg`, `argon2` or env validation into the proxy.

```ts
export const SESSION_COOKIE_NAME = "session";

// 7 días.
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
```

- [ ] **Step 3: Write the composition root**

Create `src/infrastructure/container.ts`:

```ts
import "server-only";

import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenService } from "@/core/ports/session-token-service";
import type { UserRepository } from "@/core/ports/user-repository";
import { Argon2PasswordHasher } from "@/infrastructure/auth/argon2-password-hasher";
import { JoseSessionTokenService } from "@/infrastructure/auth/jose-session-token-service";
import { env } from "@/infrastructure/config/env";
import { DrizzleSessionRepository } from "@/infrastructure/database/repositories/drizzle-session-repository";
import { DrizzleUserRepository } from "@/infrastructure/database/repositories/drizzle-user-repository";

/**
 * Composition root: el único lugar donde el core se ata a los adapters
 * concretos. Los milestones siguientes (leads, WhatsApp, citas) extienden
 * este mismo archivo en vez de instanciar adapters sueltos por ahí.
 */
export const userRepository: UserRepository = new DrizzleUserRepository();
export const sessionRepository: SessionRepository = new DrizzleSessionRepository();
export const passwordHasher: PasswordHasher = new Argon2PasswordHasher();
export const sessionTokenService: SessionTokenService = new JoseSessionTokenService(
  env.SESSION_SECRET,
);
```

- [ ] **Step 4: Write the login route handler**

Create `src/app/api/auth/login/route.ts`:

```ts
import { cookies } from "next/headers";
import { z } from "zod";
import { authenticateUser } from "@/core/use-cases/auth/authenticate-user";
import { createSession } from "@/core/use-cases/auth/create-session";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/infrastructure/auth/session-cookie";
import { env } from "@/infrastructure/config/env";
import {
  passwordHasher,
  sessionRepository,
  sessionTokenService,
  userRepository,
} from "@/infrastructure/container";

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const result = await authenticateUser(
    { userRepository, passwordHasher },
    { identifier: parsed.data.identifier, password: parsed.data.password },
  );

  if (!result.ok) {
    return Response.json({ ok: false, reason: result.reason }, { status: 401 });
  }

  const { token, expiresAt } = await createSession(
    { sessionRepository, sessionTokenService },
    {
      userId: result.user.id,
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for"),
      ttlSeconds: SESSION_TTL_SECONDS,
    },
  );

  await userRepository.updateLastLogin(result.user.id, new Date());

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    // En dev el servidor es http://localhost, donde `secure` haría que el
    // navegador descarte la cookie.
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  // Nunca se devuelve passwordHash.
  return Response.json({
    ok: true,
    user: {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      role: result.user.role,
    },
  });
}
```

- [ ] **Step 5: Manual verification — happy path**

In one terminal:

```bash
docker compose up -d postgres
npm run dev
```

In another:

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Adm1n-Local-2026!"}'
```

Expected: `HTTP/1.1 200 OK`, a `Set-Cookie: session=eyJ...; Path=/; Expires=...; HttpOnly; SameSite=lax` header, and body:

```json
{"ok":true,"user":{"id":"<uuid>","username":"admin","email":"admin@example.com","role":"admin"}}
```

Confirm the session row landed:

```bash
docker compose exec postgres psql -U smartform -d smartform -c "select id, user_agent, revoked_at from sessions"
```

Expected: one row, `revoked_at` empty, `user_agent` showing `curl/...`.

- [ ] **Step 6: Manual verification — failure paths**

```bash
curl -i -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"admin","password":"mal"}'
```
Expected: `401`, body `{"ok":false,"reason":"INVALID_PASSWORD"}`, **no** `Set-Cookie`.

```bash
curl -i -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"nadie","password":"x"}'
```
Expected: `401`, body `{"ok":false,"reason":"NOT_FOUND"}`.

```bash
curl -i -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"admin"}'
```
Expected: `400`, body `{"ok":false,"reason":"INVALID_BODY"}`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/infrastructure/auth/session-cookie.ts src/infrastructure/container.ts src/app/api/auth/login/route.ts
git commit -m "feat: agrega el composition root y el endpoint POST /api/auth/login"
```

---

### Task 14: `POST /api/auth/logout` and `GET /api/auth/session`

**Files:**
- Create: `src/app/api/auth/logout/route.ts`, `src/app/api/auth/session/route.ts`

**Interfaces:**
- Consumes: `verifySession` → `Promise<VerifiedSession | null>` where `VerifiedSession = { user: User; jti: string }` (Task 11), `revokeSession` (Task 11), the container singletons and `SESSION_COOKIE_NAME` (Task 13).
- Produces:
  - `POST /api/auth/logout` → `200 { ok: true }`, cookie cleared, session row revoked
  - `GET /api/auth/session` → `200 { user: { id, username, email, role, displayName } }` or `200 { user: null }`

No unit test: framework glue. Verified with `curl` + a cookie jar.

- [ ] **Step 1: Write the logout route**

Create `src/app/api/auth/logout/route.ts`:

```ts
import { cookies } from "next/headers";
import { revokeSession } from "@/core/use-cases/auth/revoke-session";
import { verifySession } from "@/core/use-cases/auth/verify-session";
import { SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-cookie";
import {
  sessionRepository,
  sessionTokenService,
  userRepository,
} from "@/infrastructure/container";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token !== undefined) {
    // Se verifica en vez de solo decodificar: el `jti` a revocar tiene que
    // venir de un token con firma válida, no de un claim que cualquiera
    // podría inventar para revocar la sesión de otro.
    const verified = await verifySession(
      { sessionRepository, sessionTokenService, userRepository },
      token,
    );

    if (verified !== null) {
      await revokeSession({ sessionRepository }, verified.jti);
    }
  }

  // La cookie se borra pase lo que pase: si el token ya era inválido igual
  // queremos que el navegador deje de mandarlo.
  cookieStore.delete(SESSION_COOKIE_NAME);

  return Response.json({ ok: true });
}
```

- [ ] **Step 2: Write the session route**

Create `src/app/api/auth/session/route.ts`:

```ts
import { cookies } from "next/headers";
import { verifySession } from "@/core/use-cases/auth/verify-session";
import { SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-cookie";
import {
  sessionRepository,
  sessionTokenService,
  userRepository,
} from "@/infrastructure/container";

/**
 * Responde "¿quién soy?", no es un portón de auth: siempre 200, con
 * `user: null` cuando no hay sesión. El portón real vive en el layout de
 * /admin vía `currentUser()`.
 */
export async function GET(): Promise<Response> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (token === undefined) {
    return Response.json({ user: null });
  }

  const verified = await verifySession(
    { sessionRepository, sessionTokenService, userRepository },
    token,
  );

  if (verified === null) {
    return Response.json({ user: null });
  }

  return Response.json({
    user: {
      id: verified.user.id,
      username: verified.user.username,
      email: verified.user.email,
      role: verified.user.role,
      displayName: verified.user.displayName,
    },
  });
}
```

- [ ] **Step 3: Manual verification — full cookie round-trip**

With `npm run dev` and `docker compose up -d postgres` running:

```bash
rm -f /tmp/sf-cookies.txt

curl -s -c /tmp/sf-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Adm1n-Local-2026!"}'
echo

curl -s -b /tmp/sf-cookies.txt http://localhost:3000/api/auth/session
echo
```

Expected, in order:

```
{"ok":true,"user":{"id":"<uuid>","username":"admin","email":"admin@example.com","role":"admin"}}
{"user":{"id":"<uuid>","username":"admin","email":"admin@example.com","role":"admin","displayName":"Luis Moreno"}}
```

- [ ] **Step 4: Manual verification — logout invalidates the session**

```bash
curl -s -b /tmp/sf-cookies.txt -c /tmp/sf-cookies.txt -X POST http://localhost:3000/api/auth/logout
echo

curl -s -b /tmp/sf-cookies.txt http://localhost:3000/api/auth/session
echo
```

Expected:

```
{"ok":true}
{"user":null}
```

Also confirm the row was revoked rather than deleted:

```bash
docker compose exec postgres psql -U smartform -d smartform -c "select id, revoked_at is not null as revoked from sessions"
```

Expected: the row exists with `revoked` = `t`.

- [ ] **Step 5: Manual verification — no cookie at all**

```bash
curl -s http://localhost:3000/api/auth/session
echo
```

Expected: `{"user":null}` with status `200`.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/auth/logout/route.ts src/app/api/auth/session/route.ts
git commit -m "feat: agrega los endpoints de logout y de sesión actual"
```

---

### Task 15: `currentUser()` — the request-scoped DAL

**Files:**
- Create: `src/infrastructure/auth/current-user.ts`

**Interfaces:**
- Consumes: `verifySession` → `Promise<{ user: User; jti: string } | null>` (Task 11), the container singletons and `SESSION_COOKIE_NAME` (Task 13).
- Produces: `export const currentUser: () => Promise<User | null>` (memoized per render pass with React's `cache()`).

No standalone test: it reads request-scoped cookies through `next/headers`, so exercising it means rendering a route. Task 17's `/admin` layout is what verifies it end to end (Step 3 below points at that).

- [ ] **Step 1: Write the DAL**

Create `src/infrastructure/auth/current-user.ts`:

```ts
import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { verifySession } from "@/core/use-cases/auth/verify-session";
import { SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-cookie";
import {
  sessionRepository,
  sessionTokenService,
  userRepository,
} from "@/infrastructure/container";
import type { User } from "@/infrastructure/database/schema";

/**
 * DAL de autenticación: la ÚNICA fuente de verdad sobre quién es el usuario
 * de este request. `src/proxy.ts` solo mira si la cookie existe (chequeo
 * optimista, ver la advertencia de la doc de Next); la verificación real
 * contra la DB pasa acá.
 *
 * `cache()` memoiza por render pass: el layout, la página y cualquier server
 * component anidado pueden llamar a currentUser() sin pegarle N veces a
 * Postgres en el mismo request.
 */
export const currentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (token === undefined) {
    return null;
  }

  const verified = await verifySession(
    { sessionRepository, sessionTokenService, userRepository },
    token,
  );

  return verified?.user ?? null;
});
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Note the verification owner**

`currentUser()` has no consumer yet. Its end-to-end verification is **Task 17, Step 6** (browser flow: unauthenticated `/admin` redirects to login; authenticated `/admin` renders the welcome message built from `currentUser()`'s return value). Do not mark Task 17 complete without running that flow.

- [ ] **Step 4: Commit**

```bash
git add src/infrastructure/auth/current-user.ts
git commit -m "feat: agrega el DAL currentUser memoizado por request"
```

---

### Task 16: `src/proxy.ts` — optimistic admin guard

**Files:**
- Create: `src/proxy.ts`

**Interfaces:**
- Consumes: `SESSION_COOKIE_NAME` from `@/infrastructure/auth/session-cookie` (Task 13).
- Produces: `export function proxy(request: NextRequest): NextResponse` and `export const config = { matcher: ["/admin/:path*"] }`.

No unit test: the behaviour worth checking is Next's matcher wiring, which only exists at runtime. Verified with `curl`.

> Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` before writing this file. `middleware.ts` no longer exists in this Next.js — the file is `src/proxy.ts` and the exported function is `proxy`.

- [ ] **Step 1: Write the proxy**

Create `src/proxy.ts` (sibling of `src/app/`, as the docs require):

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-cookie";

/**
 * Chequeo OPTIMISTA: solo mira si la cookie de sesión está presente, sin
 * verificar el JWT ni tocar la DB. La doc de Next es explícita en que el
 * proxy no debe ser el único portón de auth — el portón real es
 * `currentUser()` en el layout de /admin. Acá solo evitamos el parpadeo de
 * cargar el shell del admin para alguien que ni siquiera tiene sesión.
 *
 * Por eso este archivo importa `session-cookie.ts`, que no tiene imports
 * propios: meter el container acá arrastraría pg y argon2 al proxy.
 */
export function proxy(request: NextRequest): NextResponse {
  // Sin esta salida temprana el propio /admin/login redirigiría a sí mismo.
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 2: Restart the dev server**

Proxy files are picked up at server start:

```bash
# Ctrl-C the running `npm run dev`, then:
npm run dev
```

- [ ] **Step 3: Manual verification — no cookie redirects**

```bash
curl -i -s http://localhost:3000/admin | head -5
```

Expected: status `307 Temporary Redirect` and a `location: /admin/login` header. (At this point `/admin/login` itself will 404 — Task 17 creates it. That is expected.)

- [ ] **Step 4: Manual verification — login path is not redirected**

```bash
curl -i -s http://localhost:3000/admin/login | head -3
```

Expected: `404` (page does not exist yet), **not** a `307` — proving the early return works and there is no redirect loop.

- [ ] **Step 5: Manual verification — a session cookie passes through**

```bash
rm -f /tmp/sf-cookies.txt
curl -s -c /tmp/sf-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Adm1n-Local-2026!"}' > /dev/null

curl -i -s -b /tmp/sf-cookies.txt http://localhost:3000/admin | head -3
```

Expected: **not** a `307` (it will be `404` until Task 17 creates the page) — proving the cookie-present branch calls `NextResponse.next()`.

- [ ] **Step 6: Commit**

```bash
git add src/proxy.ts
git commit -m "feat: agrega el proxy con el chequeo optimista de sesión en /admin"
```

---

### Task 17: Admin login page + protected shell

**Files:**
- Create: `src/app/admin/login/page.tsx`, `src/app/admin/(protected)/layout.tsx`, `src/app/admin/(protected)/page.tsx`, `src/presentation/admin/AdminHeader.tsx`

**Interfaces:**
- Consumes: `currentUser()` (Task 15), `POST /api/auth/login` (Task 13), `POST /api/auth/logout` (Task 14).
- Produces: `/admin/login` (public client page) and `/admin` (server-rendered, gated).

> **Route-group deviation — read this.** The obvious layout (`src/app/admin/layout.tsx` + `src/app/admin/page.tsx`) is a redirect loop: `layout.tsx` at `admin/` also wraps `/admin/login`, so an unauthenticated visitor gets redirected to a page whose own layout redirects them again. The fix is a route group: the gate lives at `src/app/admin/(protected)/layout.tsx` and only wraps what is inside the group. Route groups do not affect URLs, so `(protected)/page.tsx` still serves `/admin` and `login/page.tsx` still serves `/admin/login`.

Two global-CSS facts to respect (`src/presentation/styles/globals.css`): `body` sets `overflow: hidden` and `user-select: none` for the wizard. The admin shell must re-enable both on its own container (`h-full overflow-y-auto select-text`). Colors use the existing Tailwind 4 theme tokens (`bg-bg-primary`, `bg-bg-surface`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `border-border-card`, `bg-bg-elevated`, `text-caution`).

- [ ] **Step 1: Write the login page**

Create `src/app/admin/login/page.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

const REASON_MESSAGES: Record<string, string> = {
  NOT_FOUND: "Usuario o contraseña incorrectos.",
  INVALID_PASSWORD: "Usuario o contraseña incorrectos.",
  INACTIVE: "Esta cuenta está desactivada.",
  INVALID_BODY: "Completá usuario y contraseña.",
};

function errorMessageFor(data: unknown): string {
  if (typeof data === "object" && data !== null && "reason" in data) {
    const reason = (data as { reason: unknown }).reason;
    if (typeof reason === "string" && reason in REASON_MESSAGES) {
      return REASON_MESSAGES[reason];
    }
  }
  return "No se pudo iniciar sesión.";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        setError(errorMessageFor(data));
        return;
      }

      // `refresh()` antes de navegar: el layout de /admin es un server
      // component y tiene que re-renderizar viendo la cookie recién seteada.
      router.refresh();
      router.push("/admin");
    } catch {
      setError("No se pudo conectar con el servidor. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex h-full items-center justify-center bg-bg-primary px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-border-card bg-bg-surface p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-text-primary">Panel de administración</h1>
        <p className="mt-1 text-sm text-text-muted">Ingresá con tu usuario o email.</p>

        <label className="mt-6 block text-sm font-medium text-text-secondary" htmlFor="identifier">
          Usuario o email
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          className="mt-1 w-full rounded-lg border border-border-card bg-bg-input px-3 py-2 text-text-primary outline-none focus:border-border-focus"
        />

        <label className="mt-4 block text-sm font-medium text-text-secondary" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-lg border border-border-card bg-bg-input px-3 py-2 text-text-primary outline-none focus:border-border-focus"
        />

        {error !== null && (
          <p role="alert" className="mt-4 rounded-lg bg-caution-bg px-3 py-2 text-sm text-caution">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-lg bg-bg-trust-dark px-4 py-2.5 font-medium text-text-ondark disabled:opacity-60"
        >
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Write the admin header (client component with logout)**

Create `src/presentation/admin/AdminHeader.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminHeader({ name }: { name: string }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // `refresh()` invalida el render cacheado del server component antes de
    // navegar; sin esto el shell del admin puede volver a pintarse con el
    // usuario viejo.
    router.refresh();
    router.push("/admin/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-border-card bg-bg-surface px-4 py-3">
      <span className="text-sm font-medium text-text-primary">{name}</span>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-lg border border-border-card px-3 py-1.5 text-sm text-text-secondary disabled:opacity-60"
      >
        {isLoggingOut ? "Saliendo…" : "Cerrar sesión"}
      </button>
    </header>
  );
}
```

- [ ] **Step 3: Write the protected layout (the real auth gate)**

Create `src/app/admin/(protected)/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { currentUser } from "@/infrastructure/auth/current-user";
import { AdminHeader } from "@/presentation/admin/AdminHeader";

/**
 * Portón de auth REAL (el proxy solo hace un chequeo optimista de cookie).
 * Vive en un route group `(protected)` y no en `admin/layout.tsx` porque ese
 * último también envolvería a /admin/login y armaría un bucle de redirects.
 */
export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (user === null) {
    redirect("/admin/login");
  }

  // globals.css pone overflow:hidden y user-select:none en el body para el
  // wizard; el admin necesita scrollear y poder seleccionar texto.
  return (
    <div className="flex h-full select-text flex-col bg-bg-primary">
      <AdminHeader name={user.displayName ?? user.username} />
      <main className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Write the admin landing page**

Create `src/app/admin/(protected)/page.tsx`:

```tsx
import { currentUser } from "@/infrastructure/auth/current-user";

export default async function AdminHomePage() {
  // El layout ya redirigió si no había sesión; esta llamada sale de la caché
  // de `currentUser()` (mismo render pass) y solo sirve para estrechar el tipo.
  const user = await currentUser();
  if (user === null) {
    return null;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-text-primary">
        Bienvenido, {user.displayName ?? user.username}
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Panel de administración. Las secciones de leads, citas y WhatsApp llegan
        en los milestones siguientes.
      </p>
    </section>
  );
}
```

- [ ] **Step 5: Verify lint and types**

Run: `npm run lint && npx tsc --noEmit`
Expected: no errors, no warnings.

- [ ] **Step 6: Manual verification — full browser flow**

With `docker compose up -d postgres` and `npm run dev` running, in a browser:

1. Open `http://localhost:3000/admin` with no session (use a private window).
   Expected: redirected to `http://localhost:3000/admin/login` showing the form.
2. Submit `admin` / `Adm1n-Local-2026!`.
   Expected: navigates to `http://localhost:3000/admin` showing `Bienvenido, Luis Moreno` and a header with `Luis Moreno` + a `Cerrar sesión` button.
3. Reload `/admin`.
   Expected: still authenticated, same page (proves the cookie + DAL round-trip, not just the post-login state).
4. Click `Cerrar sesión`.
   Expected: lands on `/admin/login`.
5. Navigate back to `/admin`.
   Expected: redirected to `/admin/login` again.
6. Submit `admin` / `contraseña-mala`.
   Expected: stays on the login page and shows `Usuario o contraseña incorrectos.` inline.

Then confirm the DB reflects it:

```bash
docker compose exec postgres psql -U smartform -d smartform -c "select revoked_at is not null as revoked from sessions order by created_at"
docker compose exec postgres psql -U smartform -d smartform -c "select username, last_login_at is not null as logged_in from users"
```

Expected: at least one session row with `revoked` = `t`, and the `admin` row with `logged_in` = `t`.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin src/presentation/admin
git commit -m "feat: agrega el login y el shell protegido del panel de administración"
```

---

### Task 18: Run migrations on container boot

**Files:**
- Modify: `Dockerfile:9-25` (builder stage), `Dockerfile:36-47` (runner stage + `CMD`)
- Modify: `package.json` (add `build:migrate`), `.gitignore` (ignore the generated `migrate.cjs`)
- Modify (conditional, only if Step 6 fails): `next.config.ts`

**Interfaces:**
- Consumes: `scripts/migrate.ts` (Task 5), the `drizzle/` SQL folder (Task 3).
- Produces: the production image applies pending migrations before starting Next.

No unit test: build-and-deploy configuration. Verified by building and running the image.

**Why bundle instead of running `tsx`:** the `deps` stage installs all dependencies, but that layer is discarded — the `runner` stage only receives `.next/standalone`'s trimmed `node_modules`, which contains neither `tsx` nor `drizzle-kit` nor (reliably) `drizzle-orm`'s migrator. Bundling `scripts/migrate.ts` into a single self-contained `migrate.cjs` with esbuild — with `pg` and `drizzle-orm` bundled **in**, not marked external — removes that dependency entirely.

- [ ] **Step 1: Install esbuild**

```bash
npm install -D esbuild
```

- [ ] **Step 2: Add the `build:migrate` script to `package.json`**

Replace the `"scripts"` block with:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:studio": "drizzle-kit studio",
    "seed:admin": "tsx scripts/seed-admin.ts",
    "build:migrate": "esbuild scripts/migrate.ts --bundle --platform=node --target=node20 --format=cjs --outfile=migrate.cjs --alias:@=./src --external:pg-native --external:cloudflare:sockets"
  },
```

Flag by flag:
- `--alias:@=./src` — esbuild does not read `tsconfig.json`'s `paths`, so the `@/` imports inside `scripts/migrate.ts` and `src/infrastructure/database/db.ts` need this mapping.
- No `--packages=external` — `pg`, `drizzle-orm`, `zod` and `dotenv` get bundled into the output, which is the whole point.
- `--external:pg-native` / `--external:cloudflare:sockets` — `pg` references both behind lazy getters that never run in this code path. Without these flags esbuild fails to resolve them at build time; with them the `require()` calls stay in dead branches.

- [ ] **Step 3: Verify the bundle builds and runs locally**

```bash
npm run build:migrate
node migrate.cjs
```

Expected:

```
[migrate] aplicando migraciones desde ./drizzle ...
[migrate] migraciones aplicadas correctamente.
```

(Requires `docker compose up -d postgres` and a `.env` with the local `DATABASE_URL`.)

- [ ] **Step 4: Ignore the generated bundle**

Append to `.gitignore`:

```
# bundle generado por `npm run build:migrate`
/migrate.cjs
```

- [ ] **Step 5: Modify the Dockerfile**

Three edits. Current builder stage (`Dockerfile:9-25`):

```dockerfile
# ---- builder: compila el build standalone de Next.js ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# ... (comentario existente sobre NEXT_PUBLIC_DEPLOY_ENV, dejarlo intacto) ...
ARG NEXT_PUBLIC_DEPLOY_ENV
ENV NEXT_PUBLIC_DEPLOY_ENV=$NEXT_PUBLIC_DEPLOY_ENV
RUN npm run build
```

Replace the last three lines (`ARG`/`ENV`/`RUN npm run build`) with:

```dockerfile
ARG NEXT_PUBLIC_DEPLOY_ENV
ENV NEXT_PUBLIC_DEPLOY_ENV=$NEXT_PUBLIC_DEPLOY_ENV
# Valores dummy SOLO para el build: `next build` importa los route handlers
# para analizarlos, y esos importan src/infrastructure/config/env.ts, que
# valida process.env al cargarse. No hay Postgres en el build ni estas
# variables sobreviven a esta etapa — el runner recibe las reales de EasyPanel.
ENV DATABASE_URL=postgres://build:build@localhost:5432/build
ENV SESSION_SECRET=build-time-placeholder-secret
RUN npm run build
RUN npm run build:migrate
```

Then in the runner stage (`Dockerfile:36-38`), after the three existing `COPY --from=builder` lines, add two more:

```dockerfile
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/migrate.cjs ./migrate.cjs
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
```

Finally, replace the last line of the file:

```dockerfile
CMD ["node", "server.js"]
```

with:

```dockerfile
# Las migraciones corren antes de servir: si fallan, `&&` corta y el
# contenedor muere en vez de arrancar contra un esquema desactualizado.
CMD ["sh", "-c", "node migrate.cjs && node server.js"]
```

- [ ] **Step 6: Manual verification — build and boot the image**

```bash
docker compose down
docker volume rm smart-form-iul_postgres-data 2>/dev/null || true
docker compose up -d postgres
docker compose build web
docker compose up web
```

(The volume removal proves migrations really run on a fresh database. Compose derives the project name from the directory, so the volume is `smart-form-iul_postgres-data`; if that name does not exist, run `docker volume ls` and remove the one ending in `_postgres-data`.)

Expected in the `web` logs, **in this order**:

```
[migrate] aplicando migraciones desde ./drizzle ...
[migrate] migraciones aplicadas correctamente.
   ▲ Next.js 16.2.12
   - Local:        http://0.0.0.0:3000
 ✓ Ready in ...
```

Then, in another terminal:

```bash
docker compose exec postgres psql -U smartform -d smartform -c '\dt'
```

Expected: `users`, `sessions`, `password_reset_tokens` all listed.

- [ ] **Step 7: Manual verification — auth works inside the container**

The database is fresh, so re-seed against it and log in through the containerized app:

```bash
ADMIN_USERNAME=admin ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='Adm1n-Local-2026!' ADMIN_DISPLAY_NAME='Luis Moreno' npm run seed:admin

curl -i -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Adm1n-Local-2026!"}' | head -20
```

Expected: `200` with a `Set-Cookie: session=...` header.

**If this returns a 500 mentioning `argon2` or a missing `.node` binary**, the standalone output did not trace argon2's native module. Fix it by adding `outputFileTracingIncludes` to `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  // El binario nativo de argon2 no queda en el trace automático del build
  // standalone; sin esto el login revienta solo dentro del contenedor.
  outputFileTracingIncludes: {
    "/api/auth/**": ["./node_modules/argon2/**"],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
```

Then re-run `docker compose build web && docker compose up web` and repeat this step. (If Task 6 fell back to `bcryptjs`, this cannot happen — bcryptjs is pure JS — and no `next.config.ts` change is needed.)

- [ ] **Step 8: Full regression check**

```bash
docker compose down
npm test
npm run lint
npx tsc --noEmit
```

Expected: all tests pass, no lint errors, no type errors.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .gitignore Dockerfile next.config.ts
git commit -m "feat: corre las migraciones al arrancar el contenedor de producción"
```

---

## Definition of done for Milestone 1

- `npm test` green (8 suites: availability, env, argon2 hasher, jose token service, authenticateUser, createSession, verifySession, revokeSession).
- `npm run lint` and `npx tsc --noEmit` clean; no `any` anywhere in the diff.
- `docker compose up -d postgres && npm run db:migrate && npm run seed:admin` produces a working admin user.
- Browser flow works: `/admin` → redirect to `/admin/login` → login → `/admin` welcome → logout → `/admin/login`.
- `docker compose build web && docker compose up web` migrates on boot and serves the app.
- `.env.example` committed; no real secret in the repo.
