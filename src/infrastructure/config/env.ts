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
  // Opcionales: solo hacen falta si el módulo de WhatsApp está activo. La app
  // (y las rutas admin que no dependen de WhatsApp) deben poder arrancar sin
  // ellas — las rutas que sí las necesitan fallan explícitamente si faltan.
  WHATSAPP_WORKER_URL: z.string().min(1).optional(),
  WHATSAPP_WORKER_SECRET: z.string().min(1).optional(),
  // Opcionales: solo hacen falta si el módulo de email está activo.
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_WEBHOOK_SECRET: z.string().min(1).optional(),
  EMAIL_FROM_ADDRESS: z.string().min(1).optional(),
  EMAIL_NOTIFY_TO: z.string().min(1).optional(),
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
