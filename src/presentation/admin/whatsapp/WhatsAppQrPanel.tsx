"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";

interface SessionStatusResponse {
  ok: boolean;
  status?: string;
  qr?: string | null;
  message?: string;
}

const POLL_MS = 3000;

const STATUS_LABEL: Record<string, string> = {
  DISCONNECTED: "Desconectado",
  PAIRING_QR: "Esperando que escanees el código QR",
  CONNECTED: "Conectado",
  LOGGED_OUT: "Sesión cerrada",
};

export function WhatsAppQrPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/whatsapp/session", { cache: "no-store" });
      const data: SessionStatusResponse = await response.json();
      if (!data.ok) {
        setError(data.message ?? "El worker de WhatsApp no está disponible.");
        setStatus(null);
        setQrDataUrl(null);
        return;
      }
      setError(null);
      setStatus(data.status ?? null);
      if (data.qr) {
        setQrDataUrl(await QRCode.toDataURL(data.qr));
      } else {
        setQrDataUrl(null);
      }
    } catch {
      setError("No se pudo consultar el estado de WhatsApp.");
    }
  }, []);

  useEffect(() => {
    const tick = (): void => {
      poll();
    };
    tick();
    const interval = setInterval(tick, POLL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  const handleRelink = async (): Promise<void> => {
    await fetch("/api/admin/whatsapp/session", { method: "POST" });
    poll();
  };

  return (
    <div className="rounded-xl border border-border-card bg-bg-surface p-4">
      <h2 className="text-sm font-semibold text-text-primary">Vínculo de WhatsApp</h2>

      {error && <p className="mt-2 text-sm text-caution">{error}</p>}

      {!error && (
        <p className="mt-2 text-sm text-text-secondary">
          {status ? (STATUS_LABEL[status] ?? status) : "Consultando estado…"}
        </p>
      )}

      {qrDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrDataUrl} alt="Código QR de WhatsApp" className="mt-4 h-56 w-56" />
      )}

      {status === "CONNECTED" && (
        <p className="mt-2 text-sm text-text-secondary">
          Número vinculado. Los mensajes entrantes aparecen en el inbox debajo.
        </p>
      )}

      <button
        type="button"
        onClick={handleRelink}
        className="mt-4 rounded-lg border border-border-card px-3 py-1.5 text-sm text-text-secondary"
      >
        Generar nuevo QR / re-vincular
      </button>
    </div>
  );
}
