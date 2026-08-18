import { notFound } from "next/navigation";
import Link from "next/link";
import { leadRepository } from "@/infrastructure/container";

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

      {profile && (
        <div className="mt-6 rounded-xl border border-border-card bg-bg-surface p-4">
          <h2 className="text-sm font-semibold text-text-primary">Perfil de calificación</h2>
          {profile.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-bg-primary px-2 py-1 text-xs text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-bg-primary p-4 text-xs text-text-secondary">
            {JSON.stringify(profile.rawProfile, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
