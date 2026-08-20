import { notFound } from "next/navigation";
import Link from "next/link";
import { leadRepository } from "@/infrastructure/container";
import { IconCaretLeft } from "@/presentation/admin/icons";
import { LEAD_STATUS_LABEL, LEAD_STATUS_TONE } from "@/presentation/admin/leads/lead-labels";
import { LeadContactForm } from "@/presentation/admin/leads/LeadContactForm";
import { LeadProfileForm } from "@/presentation/admin/leads/LeadProfileForm";
import { LeadWhatsAppActions } from "@/presentation/admin/leads/LeadWhatsAppActions";
import { Badge } from "@/presentation/admin/ui/Badge";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await leadRepository.findById(id);
  if (!result) {
    notFound();
  }

  const { lead, profile } = result;

  return (
    <section>
      <Link
        href="/admin/leads"
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <IconCaretLeft size={16} />
        Volver a leads
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-text-primary">{lead.nombre ?? "(sin nombre)"}</h1>
        <Badge tone={LEAD_STATUS_TONE[lead.status] ?? "neutral"}>
          {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        {lead.telefono ?? "sin teléfono"} · {lead.canal ?? "sin canal"}
      </p>

      <LeadWhatsAppActions leadId={lead.id} telefono={lead.telefono} />

      {profile && profile.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LeadContactForm
          leadId={lead.id}
          lead={{
            nombre: lead.nombre,
            telefono: lead.telefono,
            canal: lead.canal,
            priority: lead.priority,
            status: lead.status,
          }}
        />

        {profile && (
          <LeadProfileForm
            leadId={lead.id}
            profile={{
              intencionP: profile.intencionP,
              intencionS: profile.intencionS,
              horizonte: profile.horizonte,
              planRetiro: profile.planRetiro,
              familiaTipo: profile.familiaTipo,
              preocFamilia: profile.preocFamilia,
              cobActual: profile.cobActual,
              preocSalud: profile.preocSalud,
              edadRango: profile.edadRango,
              edadCond: profile.edadCond,
              salud: profile.salud,
              saludFlag: profile.saludFlag,
              estatus: profile.estatus,
              estatusFlag: profile.estatusFlag,
              estado: profile.estado,
              timezone: profile.timezone,
              referido: profile.referido,
              ventanaDisp: profile.ventanaDisp,
            }}
          />
        )}
      </div>
    </section>
  );
}
