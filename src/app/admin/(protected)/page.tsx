import { getDashboardSummary } from "@/core/use-cases/dashboard/get-dashboard-summary";
import { getFunnelSummary } from "@/core/use-cases/dashboard/get-funnel-summary";
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
import { UpcomingAppointments } from "@/presentation/admin/dashboard/UpcomingAppointments";
import { Card } from "@/presentation/admin/ui/Card";
import { MetricCard } from "@/presentation/admin/ui/MetricCard";

export default async function AdminHomePage() {
  // El layout ya redirigió si no había sesión; esta llamada sale de la caché
  // de `currentUser()` (mismo render pass) y solo sirve para estrechar el tipo.
  const user = await currentUser();
  if (user === null) {
    return null;
  }

  const [dashboard, funnel] = await Promise.all([
    getDashboardSummary({ leadRepository, appointmentRepository }),
    getFunnelSummary({ funnelEventRepository }),
  ]);

  // Verdad de negocio (leads reales) contra sesiones que llegaron a Landing
  // — null cuando todavía no hay datos de embudo, para no mostrar 0% falso.
  const completionRate =
    funnel.sessionsStarted > 0 ? Math.round((dashboard.totalLeads / funnel.sessionsStarted) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Bienvenido, {user.displayName ?? user.username}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Resumen del programa y estado del embudo.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard icon={<IconUsers size={18} />} label="Leads totales" value={dashboard.totalLeads} />
        <MetricCard icon={<IconClock size={18} />} label="Hoy" value={dashboard.leadsToday} />
        <MetricCard icon={<IconTrendingUp size={18} />} label="Esta semana" value={dashboard.leadsThisWeek} />
        <MetricCard icon={<IconCalendarDays size={18} />} label="Este mes" value={dashboard.leadsThisMonth} />
        <MetricCard icon={<IconChartBar size={18} />} label="Este año" value={dashboard.leadsThisYear} />
        <MetricCard
          icon={<IconCheck size={18} />}
          label="Tasa de completitud"
          value={completionRate === null ? "—" : `${completionRate}%`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Leads por día (últimos 14 días)">
            <BarChart data={dashboard.leadsPerDay} />
          </Card>
          <Card title="Embudo del formulario">
            <FunnelChart
              stages={funnel.byStage}
              sessionsStarted={funnel.sessionsStarted}
              disqualified={funnel.disqualified}
            />
          </Card>
        </div>
        <UpcomingAppointments appointments={dashboard.upcomingAppointments} />
      </div>
    </div>
  );
}
