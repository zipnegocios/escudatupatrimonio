import type { AppointmentRepository, AppointmentRow } from "@/core/ports/appointment-repository";
import type { Lead, LeadRepository } from "@/core/ports/lead-repository";

export interface GetDashboardSummaryDeps {
  leadRepository: LeadRepository;
  appointmentRepository: AppointmentRepository;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DayCount {
  date: string; // YYYY-MM-DD, hora local del proceso
  count: number;
}

export interface UpcomingAppointment {
  appointment: AppointmentRow;
  leadName: string | null;
}

export interface DashboardSummary {
  // Histórico completo, no reacciona al filtro de rango — es el contador
  // ancla de la home ("cuántos leads hay en total, sin importar cuándo").
  totalLeads: number;
  leadsInRange: number;
  statusBreakdown: StatusCount[];
  leadsPerDay: DayCount[];
  // Ventana propia (próximos 7 días desde ahora), no el rango histórico
  // seleccionado — no tiene sentido "filtrar hacia el pasado" la agenda futura.
  upcomingAppointments: UpcomingAppointment[];
}

const UPCOMING_APPOINTMENTS_WINDOW_DAYS = 7;

// Clave de día en hora local del proceso (no UTC) — evita que un lead creado
// tarde en la noche caiga en el día equivocado. Mismo nivel de precisión de
// timezone que ya usa el resto del admin (formatea fechas con es-VE sin
// manejo fino de TZ por lead individual).
function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getDashboardSummary(
  deps: GetDashboardSummaryDeps,
  range: { from: Date; to: Date },
): Promise<DashboardSummary> {
  const now = new Date();

  const [leads, appointments] = await Promise.all([
    deps.leadRepository.list(),
    deps.appointmentRepository.listByRange(
      now,
      new Date(now.getTime() + UPCOMING_APPOINTMENTS_WINDOW_DAYS * 24 * 60 * 60 * 1000),
    ),
  ]);

  const leadNameById = new Map(leads.map((lead) => [lead.id, lead.nombre]));
  const upcomingAppointments: UpcomingAppointment[] = appointments.map((appointment) => ({
    appointment,
    leadName: leadNameById.get(appointment.leadId) ?? null,
  }));

  const leadsInRange = leads.filter(
    (lead: Lead) => lead.createdAt >= range.from && lead.createdAt <= range.to,
  );

  const statusCounts = new Map<string, number>();
  for (const lead of leadsInRange) {
    statusCounts.set(lead.status, (statusCounts.get(lead.status) ?? 0) + 1);
  }

  const dayCounts = new Map<string, number>();
  const rangeStartDay = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate());
  const rangeEndDay = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate());
  for (
    let day = new Date(rangeStartDay);
    day.getTime() <= rangeEndDay.getTime();
    day.setDate(day.getDate() + 1)
  ) {
    dayCounts.set(dateKey(day), 0);
  }
  for (const lead of leadsInRange) {
    const key = dateKey(lead.createdAt);
    if (dayCounts.has(key)) {
      dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
    }
  }

  return {
    totalLeads: leads.length,
    leadsInRange: leadsInRange.length,
    statusBreakdown: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    leadsPerDay: Array.from(dayCounts.entries()).map(([date, count]) => ({ date, count })),
    upcomingAppointments,
  };
}
