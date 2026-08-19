"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Baileys (la librería que usamos para WhatsApp) no puede iniciar llamadas
// de voz/video reales — WhatsApp usa un protocolo aparte para eso que
// ninguna librería no oficial implementa. "Llamar" acá abre WhatsApp (para
// que vos apretes el botón de llamada real ahí) o el marcador del teléfono
// para una llamada normal.
export function LeadWhatsAppActions({ leadId, telefono }: { leadId: string; telefono: string | null }) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = telefono?.replace(/\D/g, "") ?? "";
  const waDigits = digits.length === 10 ? `1${digits}` : digits;

  const handleWriteWhatsApp = async (): Promise<void> => {
    setStarting(true);
    setError(null);
    const response = await fetch("/api/admin/whatsapp/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    setStarting(false);
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.reason === "LEAD_HAS_NO_PHONE" ? "El lead no tiene teléfono cargado." : "No se pudo abrir la conversación.");
      return;
    }
    router.push(`/admin/whatsapp?leadId=${leadId}`);
  };

  if (!telefono) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleWriteWhatsApp}
        disabled={starting}
        className="rounded-lg bg-bg-primary px-3 py-1.5 text-sm text-text-primary disabled:opacity-60"
      >
        {starting ? "Abriendo…" : "Escribir por WhatsApp"}
      </button>
      <a
        href={`https://wa.me/${waDigits}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-border-card px-3 py-1.5 text-sm text-text-secondary"
      >
        Llamar por WhatsApp
      </a>
      <a
        href={`tel:+${waDigits}`}
        className="rounded-lg border border-border-card px-3 py-1.5 text-sm text-text-secondary"
      >
        Llamar (teléfono)
      </a>
      {error && <p className="w-full text-sm text-caution">{error}</p>}
    </div>
  );
}
