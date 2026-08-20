import { isDateRangePreset, resolveDateRange } from "@/core/use-cases/dashboard/date-range";
import { getDashboardSummary } from "@/core/use-cases/dashboard/get-dashboard-summary";
import { getFunnelSummary } from "@/core/use-cases/dashboard/get-funnel-summary";
import { listFunnelSessions } from "@/core/use-cases/dashboard/list-funnel-sessions";
import { currentUser } from "@/infrastructure/auth/current-user";
import { appointmentRepository, funnelEventRepository, leadRepository } from "@/infrastructure/container";
import {
  IconCalendarDays,
  IconCheck,
  IconChartBar,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from "@/presentation/admin/icons";
import { BarChart } from "@/presentation/admin/dashboard/charts/BarChart";
import { FunnelChart } from "@/presentation/admin/dashboard/charts/FunnelChart";
import { formatDuration, FunnelSessionsTable } from "@/presentation/admin/dashboard/FunnelSessionsTable";
import { RangeFilter } from "@/presentation/admin/dashboard/RangeFilter";
import { UpcomingAppointments } from "@/presentation/admin/dashboard/UpcomingAppointments";
import { Card } from "@/presentation/admin/ui/Card";
import { MetricCard } from "@/presentation/admin/ui/MetricCard";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  // El layout ya redirigió si no había sesión; esta llamada sale de la caché
  // de `currentUser()` (mismo render pass) y solo sirve para estrechar el tipo.
  const user = await currentUser();
  if (user === null) {
    return null;
  }

  const { range: rangeParam } = await searchParams;
  const preset = isDateRangePreset(rangeParam) ? rangeParam : "month";
  const range = resolveDateRange(preset);

  const [dashboard, funnel, sessions] = await Promise.all([
    getDashboardSummary({ leadRepository, appointmentRepository }, range),
    getFunnelSummary({ funnelEventRepository }, range),
    listFunnelSessions({ funnelEventRepository }, range),
  ]);

  // Verdad de negocio (leads reales) contra sesiones que llegaron a Landing
  // en el mismo período — null cuando todavía no hay datos de embudo, para
  // no mostrar 0% falso.
  const completionRate =
    funnel.sessionsStarted > 0 ? Math.round((dashboard.leadsInRange / funnel.sessionsStarted) * 100) : null;

  const completedDurations = sessions
    .filter((session) => session.completed && session.totalDurationMs !== null)
    .map((session) => session.totalDurationMs as number);
  const avgCompletedDurationMs =
    completedDurations.length > 0
      ? completedDurations.reduce((sum, ms) => sum + ms, 0) / completedDurations.length
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Bienvenido, {user.displayName ?? user.username}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Resumen del programa y estado del embudo.</p>
        </div>
        <RangeFilter active={preset} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard icon={<IconUsers size={18} />} label="Leads totales" value={dashboard.totalLeads} />
        <MetricCard
          icon={<IconCalendarDays size={18} />}
          label="Leads en el período"
          value={dashboard.leadsInRange}
        />
        <MetricCard
          icon={<IconChartBar size={18} />}
          label="Sesiones iniciadas"
          value={funnel.sessionsStarted}
        />
        <MetricCard icon={<IconCheck size={18} />} label="Sesiones completadas" value={funnel.completedSessions} />
        <MetricCard
          icon={<IconTrendingUp size={18} />}
          label="Tasa de completitud"
          value={completionRate === null ? "—" : `${completionRate}%`}
        />
        <MetricCard
          icon={<IconClock size={18} />}
          label="Duración promedio"
          value={formatDuration(avgCompletedDurationMs)}
          trend="de las sesiones completadas"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Leads por día">
            <BarChart data={dashboard.leadsPerDay} />
          </Card>
          <Card title="Embudo del formulario">
            <FunnelChart
              stages={funnel.byStage}
              sessionsStarted={funnel.sessionsStarted}
              disqualified={funnel.disqualified}
            />
          </Card>
          <Card title="Sesiones del período" action={<span className="text-xs text-text-muted">{sessions.length} en total</span>}>
            <FunnelSessionsTable sessions={sessions} />
          </Card>
        </div>
        <UpcomingAppointments appointments={dashboard.upcomingAppointments} />
      </div>
    </div>
  );
}
