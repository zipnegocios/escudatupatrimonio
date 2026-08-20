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
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  leadsThisYear: number;
  statusBreakdown: StatusCount[];
  leadsPerDay: DayCount[];
  upcomingAppointments: UpcomingAppointment[];
}

const LEADS_PER_DAY_WINDOW = 14;
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

export async function getDashboardSummary(deps: GetDashboardSummaryDeps): Promise<DashboardSummary> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

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

  const countSince = (since: Date): number =>
    leads.filter((lead: Lead) => lead.createdAt >= since).length;

  const statusCounts = new Map<string, number>();
  for (const lead of leads) {
    statusCounts.set(lead.status, (statusCounts.get(lead.status) ?? 0) + 1);
  }

  const dayCounts = new Map<string, number>();
  const windowStart = new Date(startOfToday.getTime() - (LEADS_PER_DAY_WINDOW - 1) * 24 * 60 * 60 * 1000);
  for (let i = 0; i < LEADS_PER_DAY_WINDOW; i++) {
    const day = new Date(windowStart.getTime() + i * 24 * 60 * 60 * 1000);
    dayCounts.set(dateKey(day), 0);
  }
  for (const lead of leads) {
    if (lead.createdAt < windowStart) continue;
    const key = dateKey(lead.createdAt);
    if (dayCounts.has(key)) {
      dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
    }
  }

  return {
    totalLeads: leads.length,
    leadsToday: countSince(startOfToday),
    leadsThisWeek: countSince(startOfWeek),
    leadsThisMonth: countSince(startOfMonth),
    leadsThisYear: countSince(startOfYear),
    statusBreakdown: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    leadsPerDay: Array.from(dayCounts.entries()).map(([date, count]) => ({ date, count })),
    upcomingAppointments,
  };
}
