"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/presentation/admin/ui/Card";

interface LeadOption {
  id: string;
  nombre: string | null;
  telefono: string | null;
  priority: string | null;
}

export function AppointmentForm({ leads }: { leads: LeadOption[] }) {
  const router = useRouter();
  const [leadId, setLeadId] = useState(leads[0]?.id ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!leadId || !start || !end) {
      setError("Completá lead, inicio y fin.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        scheduledStart: new Date(start).toISOString(),
        scheduledEnd: new Date(end).toISOString(),
        timezone,
        notes: notes.trim() || null,
      }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(
        data?.reason === "OVERLAP"
          ? "Ya hay una cita en ese horario."
          : data?.reason === "INVALID_RANGE"
            ? "El fin debe ser después del inicio."
            : "No se pudo crear la cita.",
      );
      return;
    }

    setStart("");
    setEnd("");
    setNotes("");
    router.refresh();
  };

  return (
    <Card title="Nueva cita">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="type-caption mb-1 block">Lead</label>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          >
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.nombre ?? "(sin nombre)"} · {lead.telefono ?? "sin teléfono"}
                {lead.priority ? ` · ${lead.priority}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div />

        <div>
          <label className="type-caption mb-1 block">Inicio</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="type-caption mb-1 block">Fin</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="type-caption mb-1 block">Notas (opcional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-caution">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || leads.length === 0}
        className="mt-4 cursor-pointer rounded-lg bg-trust px-4 py-2 text-sm font-medium text-white hover:bg-trust-dark disabled:opacity-60"
      >
        {submitting ? "Guardando…" : "Agendar"}
      </button>
      {leads.length === 0 && (
        <p className="mt-2 text-sm text-text-secondary">Todavía no hay leads para agendar.</p>
      )}
    </Card>
  );
}
