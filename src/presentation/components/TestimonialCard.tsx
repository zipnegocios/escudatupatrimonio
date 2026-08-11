interface TestimonialCardEmptyProps {
  mode?: undefined;
}

interface TestimonialCardPlaceholderProps {
  /** SOLO para pruebas manuales en local o preview interno. Nunca invocar con este mode en un archivo que se despliega a producción real — ver el guard más abajo. */
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
 *   real, para previsualización en desarrollo y en deploys de staging/
 *   preview (revisión interna con Gustavo/Johanaly/Luis). Lanza un error
 *   visible si se renderiza en el build de producción real, para que
 *   nunca llegue a un usuario real por accidente (NAIC MDL-570 / FTC
 *   Endorsement Guides: un testimonio publicitado debe ser de una persona
 *   real e identificable).
 * - `mode="verified"`: testimonio real, requiere autor, foto y fuente
 *   verificable.
 *
 * Guard a prueba de olvido: bloquea por defecto en cualquier build con
 * NODE_ENV=production (que `next build` fija siempre, incluida una
 * preview) — no depende de que alguien configure una variable nueva a
 * tiempo. Para ver los placeholders en un deploy de preview/staging
 * real, hay que setear explícitamente NEXT_PUBLIC_DEPLOY_ENV=preview
 * SOLO en ese environment — nunca en el dominio de producción con
 * tráfico pagado. Si esa variable no está seteada (el caso por defecto
 * en cualquier environment nuevo o mal configurado), el guard bloquea
 * igual: el fallo seguro es "no se ve el placeholder", nunca "se filtró
 * un testimonio falso a producción".
 */
export function TestimonialCard(props: TestimonialCardProps) {
  const isRealProductionBuild =
    process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_DEPLOY_ENV !== "preview";
  if (props.mode === "placeholder" && isRealProductionBuild) {
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
