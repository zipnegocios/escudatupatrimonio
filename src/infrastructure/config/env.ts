import { z } from "zod";

// Algunos paneles (EasyPanel incluido) guardan una variable "sin completar"
// como string vacío en vez de no definirla — `z.string().optional()` por sí
// solo NO trata "" como ausente, así que una var opcional sin valor real
// rompía el arranque igual. Este helper normaliza "" a undefined antes de
// validar, para que "no configurada" se comporte igual venga como falte la
// key o como key con valor vacío.
function optionalString() {
  return z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  );
}

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
  WHATSAPP_WORKER_URL: optionalString(),
  WHATSAPP_WORKER_SECRET: optionalString(),
  // Opcionales: solo hacen falta si el módulo de email está activo.
  RESEND_API_KEY: optionalString(),
  RESEND_WEBHOOK_SECRET: optionalString(),
  EMAIL_FROM_ADDRESS: optionalString(),
  EMAIL_NOTIFY_TO: optionalString(),
  // Opcionales: solo hacen falta si el envío/recepción de medios de
  // WhatsApp (fotos, notas de voz, video) está activo.
  R2_ACCOUNT_ID: optionalString(),
  R2_ACCESS_KEY_ID: optionalString(),
  R2_SECRET_ACCESS_KEY: optionalString(),
  R2_BUCKET: optionalString(),
  R2_ENDPOINT: optionalString(),
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
