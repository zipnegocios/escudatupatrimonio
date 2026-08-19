import { notFound } from "next/navigation";
import Link from "next/link";
import { leadRepository } from "@/infrastructure/container";
import { LeadContactForm } from "@/presentation/admin/leads/LeadContactForm";
import { LeadProfileForm } from "@/presentation/admin/leads/LeadProfileForm";
import { LeadWhatsAppActions } from "@/presentation/admin/leads/LeadWhatsAppActions";

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
      <Link href="/admin/leads" className="text-sm text-text-secondary underline">
        ← Volver a leads
      </Link>

      <h1 className="mt-3 text-2xl font-semibold text-text-primary">
        {lead.nombre ?? "(sin nombre)"}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {lead.telefono ?? "sin teléfono"} · {lead.canal ?? "sin canal"} · estado {lead.status}
      </p>

      <LeadWhatsAppActions leadId={lead.id} telefono={lead.telefono} />

      {profile && profile.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-bg-surface px-2 py-1 text-xs text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6">
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
      </div>

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
    </section>
  );
}
