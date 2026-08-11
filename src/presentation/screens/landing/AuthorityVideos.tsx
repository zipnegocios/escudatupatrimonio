import { AUTHORITY_VIDEOS } from "@/presentation/constants";

// copy: spec de rediseño v1.0 § 2.7 Contenido de autoridad — videos de Luis
// (NO son testimonios). Formato vertical, autoplay muted con controles,
// subtítulos quemados en el propio archivo de video.
export function AuthorityVideos() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow" style={{ color: "var(--text-ondark-muted)" }}>
        Conoce a tu Agente Certificado
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AUTHORITY_VIDEOS.map((src) => (
          <video
            key={src}
            src={src}
            className="w-full aspect-[9/16] rounded-2xl object-cover bg-trust-elevated"
            controls
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
          />
        ))}
      </div>
    </div>
  );
}
