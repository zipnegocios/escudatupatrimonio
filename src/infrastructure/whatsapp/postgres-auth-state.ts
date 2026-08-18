import { and, eq } from "drizzle-orm";
import {
  BufferJSON,
  initAuthCreds,
  proto,
  type AuthenticationCreds,
  type AuthenticationState,
  type SignalDataTypeMap,
} from "@whiskeysockets/baileys";
import { db } from "@/infrastructure/database/db";
import { whatsappAuthState } from "@/infrastructure/database/schema";

/**
 * Reemplazo Postgres de `useMultiFileAuthState` de Baileys (que guarda un
 * archivo por clave en disco) — necesario porque el worker de WhatsApp corre
 * en un contenedor separado sin volumen persistente garantizado. Mismo
 * esquema de "un valor por storageKey" que la versión de archivos: 'creds'
 * para las credenciales, '{categoria}-{id}' para cada clave de Signal.
 */
async function readData<T>(sessionId: string, storageKey: string): Promise<T | null> {
  const [row] = await db
    .select()
    .from(whatsappAuthState)
    .where(
      and(eq(whatsappAuthState.sessionId, sessionId), eq(whatsappAuthState.storageKey, storageKey)),
    )
    .limit(1);
  if (!row) return null;
  return JSON.parse(row.payload, BufferJSON.reviver) as T;
}

async function writeData(sessionId: string, storageKey: string, data: unknown): Promise<void> {
  const payload = JSON.stringify(data, BufferJSON.replacer);
  await db
    .insert(whatsappAuthState)
    .values({ sessionId, storageKey, payload })
    .onConflictDoUpdate({
      target: [whatsappAuthState.sessionId, whatsappAuthState.storageKey],
      set: { payload, updatedAt: new Date() },
    });
}

async function removeData(sessionId: string, storageKey: string): Promise<void> {
  await db
    .delete(whatsappAuthState)
    .where(
      and(eq(whatsappAuthState.sessionId, sessionId), eq(whatsappAuthState.storageKey, storageKey)),
    );
}

// Se usa al re-vincular: sin esto, un logout deja las credenciales viejas
// (ya inválidas del lado de WhatsApp) guardadas, y el siguiente start()
// las recarga en vez de arrancar un pairing nuevo — nunca aparece un QR.
export async function clearAuthState(sessionId: string): Promise<void> {
  await db.delete(whatsappAuthState).where(eq(whatsappAuthState.sessionId, sessionId));
}

export async function loadPostgresAuthState(
  sessionId: string,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  const creds = (await readData<AuthenticationCreds>(sessionId, "creds")) ?? initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
          const data: { [id: string]: SignalDataTypeMap[T] } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData<SignalDataTypeMap[T]>(sessionId, `${type}-${id}`);
              // Mismo caso especial que la versión de archivos: este tipo
              // necesita reconstruirse como mensaje proto, no queda bien
              // como JSON plano.
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(
                  value as object,
                ) as unknown as SignalDataTypeMap[T];
              }
              if (value !== null) {
                data[id] = value;
              }
            }),
          );
          return data;
        },
        set: async (data) => {
          const tasks: Promise<void>[] = [];
          for (const category of Object.keys(data) as (keyof SignalDataTypeMap)[]) {
            const categoryData = data[category];
            if (!categoryData) continue;
            for (const id of Object.keys(categoryData)) {
              const value = categoryData[id];
              const storageKey = `${category}-${id}`;
              tasks.push(
                value ? writeData(sessionId, storageKey, value) : removeData(sessionId, storageKey),
              );
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData(sessionId, "creds", creds),
  };
}
