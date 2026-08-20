import Link from "next/link";
import type { Lead } from "@/core/ports/lead-repository";
import { leadRepository } from "@/infrastructure/container";
import { IconUsers } from "@/presentation/admin/icons";
import { LEAD_STATUS_LABEL, LEAD_STATUS_TONE } from "@/presentation/admin/leads/lead-labels";
import { Badge } from "@/presentation/admin/ui/Badge";
import { DataTable, type DataTableColumn } from "@/presentation/admin/ui/DataTable";
import { EmptyState } from "@/presentation/admin/ui/EmptyState";

const COLUMNS: DataTableColumn<Lead>[] = [
  {
    key: "nombre",
    label: "Nombre",
    primary: true,
    render: (lead) => (
      <Link href={`/admin/leads/${lead.id}`} className="font-medium text-trust">
        {lead.nombre ?? "(sin nombre)"}
      </Link>
    ),
  },
  { key: "telefono", label: "Teléfono", render: (lead) => lead.telefono ?? "—" },
  { key: "canal", label: "Canal", render: (lead) => lead.canal ?? "—" },
  { key: "priority", label: "Prioridad", render: (lead) => lead.priority ?? "—" },
  {
    key: "status",
    label: "Estado",
    render: (lead) => (
      <Badge tone={LEAD_STATUS_TONE[lead.status] ?? "neutral"}>
        {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    label: "Creado",
    render: (lead) => new Date(lead.createdAt).toLocaleString("es-VE"),
  },
];

export default async function AdminLeadsPage() {
  const leads = await leadRepository.list();

  return (
    <section>
      <h1 className="text-2xl font-semibold text-text-primary">Leads</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {leads.length} {leads.length === 1 ? "lead capturado" : "leads capturados"} por el Smart
        Form.
      </p>

      <div className="mt-6">
        {leads.length === 0 ? (
          <EmptyState icon={<IconUsers size={28} />} message="Todavía no hay leads." />
        ) : (
          <DataTable columns={COLUMNS} rows={leads} />
        )}
      </div>
    </section>
  );
}
