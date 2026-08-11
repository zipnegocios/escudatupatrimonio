interface TestimonialCardEmptyProps {
  mode?: undefined;
}

interface TestimonialCardPlaceholderProps {
  /** SOLO para pruebas manuales en local. Nunca invocar con este mode desde un archivo que se despliega — ver el guard de NODE_ENV más abajo. */
  mode: "placeholder";
  quote: string;
}

interface TestimonialCardVerifiedWrittenProps {
  mode: "verified";
  quote: string;
  authorName: string;
  authorPhoto: string;
  authorLocation?: string;
  source: "written";
}

interface TestimonialCardVerifiedLinkedProps {
  mode: "verified";
  quote: string;
  authorName: string;
  authorPhoto: string;
  authorLocation?: string;
  source: "google_review" | "trustpilot" | "video";
  /** Enlace verificable a la reseña/video real — obligatorio cuando la fuente no es texto propio. */
  sourceUrl: string;
}

export type TestimonialCardProps =
  | TestimonialCardEmptyProps
  | TestimonialCardPlaceholderProps
  | TestimonialCardVerifiedWrittenProps
  | TestimonialCardVerifiedLinkedProps;

const SOURCE_LABEL: Record<string, string> = {
  written: "Reseña escrita",
  google_review: "Reseña de Google",
  trustpilot: "Reseña de Trustpilot",
  video: "Video testimonio",
};

/**
 * Tarjeta de testimonio con tres estados:
 * - sin `mode`: estado "Próximamente" — el único seguro para producción
 *   mientras no existan testimonios reales.
 * - `mode="placeholder"`: contenido ilustrativo genérico sin nombre/foto
 *   real, para previsualización en desarrollo Y en deploys de staging/
 *   preview (Vercel preview deployments, revisión interna con Gustavo/
 *   Johanaly/Luis). Lanza un error visible si se renderiza con
 *   NEXT_PUBLIC_DEPLOY_ENV=production, para que nunca llegue a un usuario
 *   real por accidente (NAIC MDL-570 / FTC Endorsement Guides: un
 *   testimonio publicitado debe ser de una persona real e identificable).
 * - `mode="verified"`: testimonio real, requiere autor, foto y fuente
 *   verificable.
 *
 * OJO con NODE_ENV vs NEXT_PUBLIC_DEPLOY_ENV: `next build` siempre corre
 * con NODE_ENV=production, incluso en un deploy de preview — por eso ese
 * check original bloqueaba también las vistas previas que sí necesitamos
 * mostrar en esta fase. NEXT_PUBLIC_DEPLOY_ENV es una variable de entorno
 * propia (no la fija Next.js) que Gustavo debe configurar SOLO en el
 * environment de producción real del proyecto en Vercel (el dominio que
 * va a recibir tráfico pagado) — nunca en Preview ni Development. Mientras
 * esa variable no esté seteada a "production", los placeholders se
 * renderizan sin problema.
 */
export function TestimonialCard(props: TestimonialCardProps) {
  if (props.mode === "placeholder" && process.env.NEXT_PUBLIC_DEPLOY_ENV === "production") {
    throw new Error(
      'TestimonialCard: mode="placeholder" no puede renderizarse en producción (es contenido ilustrativo ficticio, no un testimonio real). Usa mode="verified" con datos reales y consentimiento documentado, o quita la prop `mode` para mostrar el estado "Próximamente".'
    );
  }

  if (!props.mode) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border border-dashed border-border-card bg-bg-surface text-center min-h-[180px]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <path d="M7 8h10M7 12h6M4 4h16v12H9l-5 4V4z" />
        </svg>
        <p className="type-caption">Próximamente</p>
      </div>
    );
  }

  if (props.mode === "placeholder") {
    return (
      <div className="relative p-5 rounded-2xl border border-border-card bg-bg-surface overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--text-primary) 0, var(--text-primary) 1px, transparent 1px, transparent 12px)",
          }}
        />
        <span
          className="relative inline-block mb-3 px-2 py-0.5 rounded-full bg-caution-bg type-caption font-semibold"
          style={{ color: "var(--caution)" }}
        >
          Ejemplo ilustrativo — no publicar
        </span>
        <p className="relative type-body italic">&ldquo;{props.quote}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-border-card bg-bg-surface">
      <p className="type-body italic mb-4">&ldquo;{props.quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.authorPhoto}
          alt={props.authorName}
          className="w-11 h-11 rounded-full object-cover border border-border-card"
          loading="lazy"
        />
        <div className="min-w-0">
          <p className="type-label leading-tight">{props.authorName}</p>
          <p className="type-caption">
            {props.authorLocation ? `${props.authorLocation} · ` : ""}
            {SOURCE_LABEL[props.source]}
          </p>
        </div>
      </div>
      {"sourceUrl" in props && (
        <a
          href={props.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="type-caption mt-3 inline-block"
          style={{ color: "var(--trust-blue)" }}
        >
          Ver reseña original →
        </a>
      )}
    </div>
  );
}
