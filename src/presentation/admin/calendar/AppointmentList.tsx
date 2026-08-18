"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Appointment {
  id: string;
  leadId: string;
  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;
  status: string;
  notes: string | null;
}

interface LeadOption {
  id: string;
  nombre: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Agendada",
  CONFIRMED: "Confirmada",
  RESCHEDULED: "Reagendada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
  NO_SHOW: "No se presentó",
};

export function AppointmentList({
  appointments,
  leadsById,
}: {
  appointments: Appointment[];
  leadsById: Record<string, LeadOption>;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string): Promise<void> => {
    setBusyId(id);
    await fetch(`/api/admin/calendar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", status }),
    });
    setBusyId(null);
    router.refresh();
  };

  const cancel = async (id: string): Promise<void> => {
    setBusyId(id);
    await fetch(`/api/admin/calendar/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: null }),
    });
    setBusyId(null);
    router.refresh();
  };

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg-surface text-text-secondary">
          <tr>
            <th className="px-4 py-3">Lead</th>
            <th className="px-4 py-3">Inicio</th>
            <th className="px-4 py-3">Fin</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const isActive = !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.status);
            return (
              <tr key={appointment.id} className="border-t border-border-card">
                <td className="px-4 py-3 text-text-primary">
                  {leadsById[appointment.leadId]?.nombre ?? "(sin nombre)"}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(appointment.scheduledStart).toLocaleString("es-VE")}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(appointment.scheduledEnd).toLocaleString("es-VE")}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {STATUS_LABEL[appointment.status] ?? appointment.status}
                </td>
                <td className="px-4 py-3">
                  {isActive && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === appointment.id}
                        onClick={() => updateStatus(appointment.id, "CONFIRMED")}
                        className="rounded border border-border-card px-2 py-1 text-xs text-text-secondary disabled:opacity-60"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        disabled={busyId === appointment.id}
                        onClick={() => updateStatus(appointment.id, "COMPLETED")}
                        className="rounded border border-border-card px-2 py-1 text-xs text-text-secondary disabled:opacity-60"
                      >
                        Completada
                      </button>
                      <button
                        type="button"
                        disabled={busyId === appointment.id}
                        onClick={() => updateStatus(appointment.id, "NO_SHOW")}
                        className="rounded border border-border-card px-2 py-1 text-xs text-text-secondary disabled:opacity-60"
                      >
                        No se presentó
                      </button>
                      <button
                        type="button"
                        disabled={busyId === appointment.id}
                        onClick={() => cancel(appointment.id)}
                        className="rounded border border-border-card px-2 py-1 text-xs text-caution disabled:opacity-60"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {appointments.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-text-secondary">
                No hay citas en los próximos 30 días.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
