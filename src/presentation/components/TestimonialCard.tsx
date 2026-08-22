interface TestimonialCardEmptyProps {
  mode?: undefined;
}

interface TestimonialCardPlaceholderProps {
  /** SOLO para pruebas manuales en local o preview interno. Nunca invocar con este mode en un archivo que se despliega a producción real — ver el guard más abajo. */
  mode: "placeholder";
  quote: string;
  authorName?: string;
  rating?: number;
}

interface TestimonialCardVerifiedWrittenProps {
  mode: "verified";
  quote: string;
  authorName: string;
  authorPhoto: string;
  authorLocation?: string;
  rating?: number;
  source: "written";
}

interface TestimonialCardVerifiedLinkedProps {
  mode: "verified";
  quote: string;
  authorName: string;
  authorPhoto: string;
  authorLocation?: string;
  rating?: number;
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

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function Avatar({ name, photoUrl }: { name?: string; photoUrl?: string }) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name ?? ""}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-border-card"
        loading="lazy"
      />
    );
  }
  if (name) {
    return (
      <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center flex-shrink-0 type-label font-semibold text-text-primary">
        {initials(name)}
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center flex-shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
      </svg>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill={i < rating ? "var(--gold-primary)" : "var(--border-card)"}
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.4 6-5.5-3.2-5.5 3.2 1.4-6-4.6-4.1 6.1-.6z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Tarjeta de testimonio con tres estados:
 * - sin `mode`: estado "Próximamente" — el único seguro para producción
 *   mientras no existan testimonios reales.
 * - `mode="placeholder"`: contenido ilustrativo genérico (nombre incluido
 *   solo para maquetar el layout — nunca una persona real), para
 *   previsualización en desarrollo y en deploys de staging/preview
 *   (revisión interna con Gustavo/Johanaly/Luis). Lanza un error visible
 *   si se renderiza en el build de producción real, para que nunca llegue
 *   a un usuario real por accidente (NAIC MDL-570 / FTC Endorsement
 *   Guides: un testimonio publicitado debe ser de una persona real e
 *   identificable) — por eso su insignia dice "Ejemplo ilustrativo" y
 *   nunca "Evaluación verificada", aunque comparta el mismo layout.
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

  const rating = props.rating ?? 5;

  return (
    <div className="relative flex flex-col p-5 rounded-2xl border border-border-card bg-bg-surface transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-3">
        <Avatar
          name={props.authorName}
          photoUrl={props.mode === "verified" ? props.authorPhoto : undefined}
        />
        <div className="min-w-0 flex flex-col gap-1">
          <p className="type-label font-semibold text-text-primary truncate">
            {props.authorName ?? "Cliente"}
          </p>
          <StarRating rating={rating} />
          {props.mode === "verified" && (
            <p className="type-caption text-text-muted truncate">
              {props.authorLocation ? `${props.authorLocation} · ` : ""}
              {SOURCE_LABEL[props.source]}
            </p>
          )}
        </div>
        <div className="ml-auto flex-shrink-0 flex items-center gap-1 pl-2">
          {props.mode === "verified" ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12l5 5L20 6" />
              </svg>
              <span className="text-[10px] text-text-muted uppercase tracking-wide whitespace-nowrap">
                Evaluación verificada
              </span>
            </>
          ) : (
            <span className="text-[10px] uppercase tracking-wide whitespace-nowrap font-semibold" style={{ color: "var(--caution)" }}>
              Ejemplo ilustrativo
            </span>
          )}
        </div>
      </div>

      <p className="type-body italic text-text-secondary">&ldquo;{props.quote}&rdquo;</p>

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
