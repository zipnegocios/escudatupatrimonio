"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconCalendarDays } from "@/presentation/admin/icons";
import { Badge, type BadgeTone } from "@/presentation/admin/ui/Badge";
import { Card } from "@/presentation/admin/ui/Card";
import { EmptyState } from "@/presentation/admin/ui/EmptyState";

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

const STATUS_TONE: Record<string, BadgeTone> = {
  SCHEDULED: "trust",
  CONFIRMED: "success",
  RESCHEDULED: "gold",
  CANCELLED: "neutral",
  COMPLETED: "success",
  NO_SHOW: "caution",
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

  if (appointments.length === 0) {
    return (
      <div className="mt-6">
        <Card>
          <EmptyState
            icon={<IconCalendarDays size={28} />}
            message="No hay citas en los próximos 30 días."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {appointments.map((appointment) => {
        const isActive = !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.status);
        return (
          <Card key={appointment.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {leadsById[appointment.leadId]?.nombre ?? "(sin nombre)"}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {new Date(appointment.scheduledStart).toLocaleString("es-VE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {" → "}
                  {new Date(appointment.scheduledEnd).toLocaleString("es-VE", { timeStyle: "short" })}
                </p>
              </div>
              <Badge tone={STATUS_TONE[appointment.status] ?? "neutral"}>
                {STATUS_LABEL[appointment.status] ?? appointment.status}
              </Badge>
            </div>

            {isActive && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === appointment.id}
                  onClick={() => updateStatus(appointment.id, "CONFIRMED")}
                  className="cursor-pointer rounded border border-border-card px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated disabled:opacity-60"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  disabled={busyId === appointment.id}
                  onClick={() => updateStatus(appointment.id, "COMPLETED")}
                  className="cursor-pointer rounded border border-border-card px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated disabled:opacity-60"
                >
                  Completada
                </button>
                <button
                  type="button"
                  disabled={busyId === appointment.id}
                  onClick={() => updateStatus(appointment.id, "NO_SHOW")}
                  className="cursor-pointer rounded border border-border-card px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated disabled:opacity-60"
                >
                  No se presentó
                </button>
                <button
                  type="button"
                  disabled={busyId === appointment.id}
                  onClick={() => cancel(appointment.id)}
                  className="cursor-pointer rounded border border-border-card px-2 py-1 text-xs text-caution hover:bg-caution-bg disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
