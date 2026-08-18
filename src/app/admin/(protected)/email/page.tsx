import { emailLogRepository } from "@/infrastructure/container";

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

export default async function AdminEmailPage() {
  const emails = await emailLogRepository.list();

  return (
    <section>
      <h1 className="text-2xl font-semibold text-text-primary">Emails</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {emails.length} {emails.length === 1 ? "correo registrado" : "correos registrados"}{" "}
        (enviados y recibidos vía Resend).
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-surface text-text-secondary">
            <tr>
              <th className="px-4 py-3">Dirección</th>
              <th className="px-4 py-3">De</th>
              <th className="px-4 py-3">Para</th>
              <th className="px-4 py-3">Asunto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email) => (
              <tr key={email.id} className="border-t border-border-card">
                <td className="px-4 py-3 text-text-secondary">
                  {email.direction === "OUTBOUND" ? "Enviado" : "Recibido"}
                </td>
                <td className="px-4 py-3 text-text-secondary">{email.fromAddress}</td>
                <td className="px-4 py-3 text-text-secondary">{email.toAddress}</td>
                <td className="px-4 py-3 text-text-primary">{email.subject ?? "(sin asunto)"}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {STATUS_LABEL[email.status] ?? email.status}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(email.occurredAt).toLocaleString("es-VE")}
                </td>
              </tr>
            ))}
            {emails.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-text-secondary">
                  Todavía no hay correos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
