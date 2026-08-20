import Link from "next/link";
import type { UpcomingAppointment } from "@/core/use-cases/dashboard/get-dashboard-summary";
import { IconCalendarDays } from "@/presentation/admin/icons";
import { Avatar } from "@/presentation/admin/ui/Avatar";
import { Badge, type BadgeTone } from "@/presentation/admin/ui/Badge";
import { Card } from "@/presentation/admin/ui/Card";
import { EmptyState } from "@/presentation/admin/ui/EmptyState";

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

const MAX_VISIBLE = 5;

export function UpcomingAppointments({ appointments }: { appointments: UpcomingAppointment[] }) {
  const visible = appointments.slice(0, MAX_VISIBLE);

  return (
    <Card title="Próximas citas" action={<Link href="/admin/calendar" className="text-xs text-trust">Ver agenda →</Link>}>
      {visible.length === 0 ? (
        <EmptyState icon={<IconCalendarDays size={28} />} message="No hay citas en los próximos días." />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map(({ appointment, leadName }) => (
            <li key={appointment.id} className="flex items-center gap-3">
              <Avatar name={leadName ?? "?"} size={32} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/leads/${appointment.leadId}`}
                  className="block truncate text-sm font-medium text-text-primary"
                >
                  {leadName ?? "Lead sin nombre"}
                </Link>
                <p className="text-xs text-text-muted">
                  {new Date(appointment.scheduledStart).toLocaleString("es-VE", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Badge tone={STATUS_TONE[appointment.status] ?? "neutral"}>
                {STATUS_LABEL[appointment.status] ?? appointment.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
