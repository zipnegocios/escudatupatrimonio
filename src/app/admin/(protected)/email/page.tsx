import type { EmailLogRow } from "@/core/ports/email-log-repository";
import { emailLogRepository } from "@/infrastructure/container";
import { IconMail } from "@/presentation/admin/icons";
import { Badge } from "@/presentation/admin/ui/Badge";
import { DataTable, type DataTableColumn } from "@/presentation/admin/ui/DataTable";
import { EmptyState } from "@/presentation/admin/ui/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  QUEUED: "En cola",
  SENT: "Enviado",
  DELIVERED: "Entregado",
  OPENED: "Abierto",
  CLICKED: "Clic",
  BOUNCED: "Rebotado",
  COMPLAINED: "Marcado como spam",
  FAILED: "Falló",
  RECEIVED: "Recibido",
};

const STATUS_TONE: Record<string, "success" | "caution" | "trust" | "gold" | "neutral"> = {
  QUEUED: "neutral",
  SENT: "trust",
  DELIVERED: "success",
  OPENED: "success",
  CLICKED: "success",
  BOUNCED: "caution",
  COMPLAINED: "caution",
  FAILED: "caution",
  RECEIVED: "gold",
};

const COLUMNS: DataTableColumn<EmailLogRow>[] = [
  {
    key: "direction",
    label: "Dirección",
    primary: true,
    render: (email) => (
      <span className="font-medium text-text-primary">
        {email.direction === "OUTBOUND" ? "Enviado" : "Recibido"}
      </span>
    ),
  },
  { key: "fromAddress", label: "De", render: (email) => email.fromAddress },
  { key: "toAddress", label: "Para", render: (email) => email.toAddress },
  { key: "subject", label: "Asunto", render: (email) => email.subject ?? "(sin asunto)" },
  {
    key: "status",
    label: "Estado",
    render: (email) => (
      <Badge tone={STATUS_TONE[email.status] ?? "neutral"}>
        {STATUS_LABEL[email.status] ?? email.status}
      </Badge>
    ),
  },
  {
    key: "occurredAt",
    label: "Fecha",
    render: (email) => new Date(email.occurredAt).toLocaleString("es-VE"),
  },
];

export default async function AdminEmailPage() {
  const emails = await emailLogRepository.list();

  return (
    <section>
      <h1 className="text-2xl font-semibold text-text-primary">Emails</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {emails.length} {emails.length === 1 ? "correo registrado" : "correos registrados"}{" "}
        (enviados y recibidos vía Resend).
      </p>

      <div className="mt-6">
        {emails.length === 0 ? (
          <EmptyState icon={<IconMail size={28} />} message="Todavía no hay correos registrados." />
        ) : (
          <DataTable columns={COLUMNS} rows={emails} />
        )}
      </div>
    </section>
  );
}
