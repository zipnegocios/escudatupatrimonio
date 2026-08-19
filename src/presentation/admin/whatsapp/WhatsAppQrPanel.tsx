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

const STATUS_DOT: Record<string, string> = {
  DISCONNECTED: "bg-text-muted",
  PAIRING_QR: "bg-gold-primary",
  CONNECTED: "bg-wa-accent",
  LOGGED_OUT: "bg-caution",
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
    <div className="flex flex-col gap-4 rounded-xl border border-border-card bg-bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${status ? STATUS_DOT[status] ?? "bg-text-muted" : "bg-text-muted"}`}
        />
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Vínculo de WhatsApp</h2>
          {error ? (
            <p className="text-sm text-caution">{error}</p>
          ) : (
            <p className="text-sm text-text-secondary">
              {status ? (STATUS_LABEL[status] ?? status) : "Consultando estado…"}
            </p>
          )}
        </div>
      </div>

      {qrDataUrl && (
        <div className="rounded-xl border border-border-card bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Código QR de WhatsApp" className="h-40 w-40" />
        </div>
      )}

      <button
        type="button"
        onClick={handleRelink}
        className="cursor-pointer self-start rounded-full border border-border-card px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated sm:self-center"
      >
        Generar nuevo QR / re-vincular
      </button>
    </div>
  );
}
