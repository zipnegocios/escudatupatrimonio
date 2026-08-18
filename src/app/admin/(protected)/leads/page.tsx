import Link from "next/link";
import { leadRepository } from "@/infrastructure/container";

export default async function AdminLeadsPage() {
  const leads = await leadRepository.list();

  return (
    <section>
      <h1 className="text-2xl font-semibold text-text-primary">Leads</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {leads.length} {leads.length === 1 ? "lead capturado" : "leads capturados"} por el Smart
        Form.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-surface text-text-secondary">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Canal</th>
              <th className="px-4 py-3">Prioridad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Creado</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-border-card">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="text-text-primary underline">
                    {lead.nombre ?? "(sin nombre)"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">{lead.telefono ?? "—"}</td>
                <td className="px-4 py-3 text-text-secondary">{lead.canal ?? "—"}</td>
                <td className="px-4 py-3 text-text-secondary">{lead.priority ?? "—"}</td>
                <td className="px-4 py-3 text-text-secondary">{lead.status}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(lead.createdAt).toLocaleString("es-VE")}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-text-secondary">
                  Todavía no hay leads.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
