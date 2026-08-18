import { listAppointments } from "@/core/use-cases/calendar/list-appointments";
import { appointmentRepository, leadRepository } from "@/infrastructure/container";
import { AppointmentForm } from "@/presentation/admin/calendar/AppointmentForm";
import { AppointmentList } from "@/presentation/admin/calendar/AppointmentList";

export default async function AdminCalendarPage() {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [leads, appointments] = await Promise.all([
    leadRepository.list(),
    listAppointments({ appointmentRepository }, now, in30Days),
  ]);

  const leadsById = Object.fromEntries(
    leads.map((lead) => [lead.id, { id: lead.id, nombre: lead.nombre }]),
  );

  return (
    <section>
      <h1 className="text-2xl font-semibold text-text-primary">Calendario</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Agenda interna de citas — próximos 30 días.
      </p>

      <div className="mt-4">
        <AppointmentForm
          leads={leads.map((lead) => ({
            id: lead.id,
            nombre: lead.nombre,
            telefono: lead.telefono,
            priority: lead.priority,
          }))}
        />
      </div>

      <AppointmentList
        appointments={appointments.map((appointment) => ({
          id: appointment.id,
          leadId: appointment.leadId,
          scheduledStart: appointment.scheduledStart.toISOString(),
          scheduledEnd: appointment.scheduledEnd.toISOString(),
          timezone: appointment.timezone,
          status: appointment.status,
          notes: appointment.notes,
        }))}
        leadsById={leadsById}
      />
    </section>
  );
}
