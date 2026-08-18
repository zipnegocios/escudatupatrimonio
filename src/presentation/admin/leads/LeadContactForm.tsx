"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CANAL_LABEL, LEAD_STATUS_LABEL, PRIORITY_LABEL } from "@/presentation/admin/leads/lead-labels";

interface LeadContact {
  nombre: string | null;
  telefono: string | null;
  canal: string | null;
  priority: string | null;
  status: string;
}

export function LeadContactForm({ leadId, lead }: { leadId: string; lead: LeadContact }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(lead.nombre ?? "");
  const [telefono, setTelefono] = useState(lead.telefono ?? "");
  const [canal, setCanal] = useState(lead.canal ?? "");
  const [priority, setPriority] = useState(lead.priority ?? "");
  const [status, setStatus] = useState(lead.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_lead",
        nombre: nombre.trim() || null,
        telefono: telefono.trim() || null,
        canal: canal || null,
        priority: priority || null,
        status,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-border-card bg-bg-surface p-4">
      <h2 className="text-sm font-semibold text-text-primary">Datos de contacto</h2>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="type-caption mb-1 block">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="type-caption mb-1 block">Teléfono</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="type-caption mb-1 block">Canal preferido</label>
          <select
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {Object.entries(CANAL_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="type-caption mb-1 block">Prioridad</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="type-caption mb-1 block">Estado del lead</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          >
            {Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {saved && <p className="mt-2 text-sm text-text-secondary">Guardado.</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-lg bg-bg-primary px-4 py-2 text-sm text-text-primary disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar contacto"}
      </button>
    </div>
  );
}
