// Proceso aparte, de vida larga: Baileys mantiene un WebSocket persistente
// que no encaja en el modelo request/response de Next.js. Este worker vive
// en su propio contenedor (ver Dockerfile.whatsapp-worker) y expone una API
// HTTP interna mínima, alcanzable solo desde la red interna de Docker, para
// que el panel admin pida el QR o mande mensajes sin tocar el socket
// directamente. Se corre compilado con esbuild (ver build:whatsapp-worker en
// package.json) — nunca con tsx, que tiene un bug de resolución con una
// dependencia de Baileys (whatsapp-rust-bridge).
import "dotenv/config";
import { createServer, type IncomingMessage } from "node:http";
import { receiveWhatsAppMessage } from "@/core/use-cases/whatsapp/receive-whatsapp-message";
import { sendWhatsAppMessage } from "@/core/use-cases/whatsapp/send-whatsapp-message";
import { env } from "@/infrastructure/config/env";
import { pool } from "@/infrastructure/database/db";
import { DrizzleLeadRepository } from "@/infrastructure/database/repositories/drizzle-lead-repository";
import { DrizzleWhatsAppRepository } from "@/infrastructure/database/repositories/drizzle-whatsapp-repository";
import { BaileysGateway } from "@/infrastructure/whatsapp/baileys-gateway";

const PORT = 4001;
const SESSION_LABEL = "principal";

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => {
      raw += chunk.toString("utf-8");
    });
    req.on("end", () => {
      try {
        resolve(raw.length > 0 ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function main(): Promise<void> {
  if (!env.WHATSAPP_WORKER_SECRET) {
    throw new Error(
      "WHATSAPP_WORKER_SECRET no está configurado — obligatorio para correr este worker.",
    );
  }
  const secret = env.WHATSAPP_WORKER_SECRET;

  const whatsAppRepository = new DrizzleWhatsAppRepository();
  const leadRepository = new DrizzleLeadRepository();
  const session = await whatsAppRepository.getOrCreateSession(SESSION_LABEL);
  const gateway = new BaileysGateway(session.id);

  gateway.onStatusChange(async (status, phoneNumber) => {
    await whatsAppRepository.updateSessionStatus(session.id, status, phoneNumber);
    console.log(
      `[whatsapp-worker] estado: ${status}${phoneNumber ? ` (${phoneNumber})` : ""}`,
    );
  });

  gateway.onMessage(async (message) => {
    await receiveWhatsAppMessage({ whatsAppRepository, leadRepository }, session.id, message);
  });

  await gateway.start();

  const server = createServer((req, res) => {
    if (req.headers.authorization !== `Bearer ${secret}`) {
      res.writeHead(401).end();
      return;
    }

    void (async () => {
      try {
        if (req.method === "GET" && req.url === "/internal/status") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: gateway.getStatus(), qr: gateway.getQr() }));
          return;
        }

        if (req.method === "POST" && req.url === "/internal/send") {
          const body = (await readJsonBody(req)) as {
            conversationId: string;
            remoteJid: string;
            text: string;
          };
          await sendWhatsAppMessage(
            { whatsAppGateway: gateway, whatsAppRepository },
            body.conversationId,
            body.remoteJid,
            body.text,
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        if (req.method === "POST" && req.url === "/internal/relink") {
          await gateway.logout();
          await gateway.start();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        res.writeHead(404).end();
      } catch (error) {
        console.error("[whatsapp-worker] error en request interno:", error);
        res.writeHead(500).end();
      }
    })();
  });

  server.listen(PORT, () => {
    console.log(`[whatsapp-worker] escuchando en :${PORT}`);
  });
}

main().catch(async (error: unknown) => {
  console.error("[whatsapp-worker] fallo fatal:", error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
