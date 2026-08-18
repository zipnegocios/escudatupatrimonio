import { currentUser } from "@/infrastructure/auth/current-user";
import { fetchWorkerStatus, relinkViaWorker } from "@/infrastructure/whatsapp/worker-client";

export async function GET(): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const status = await fetchWorkerStatus();
    return Response.json({ ok: true, ...status });
  } catch (error) {
    return Response.json(
      { ok: false, reason: "WORKER_UNAVAILABLE", message: (error as Error).message },
      { status: 503 },
    );
  }
}

export async function POST(): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    await relinkViaWorker();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { ok: false, reason: "WORKER_UNAVAILABLE", message: (error as Error).message },
      { status: 503 },
    );
  }
}
