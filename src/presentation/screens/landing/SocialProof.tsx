import { TestimonialCard } from "@/presentation/components/TestimonialCard";

/**
 * Sección 2.8 — Prueba social.
 *
 * Los 3 testimonios usan mode="placeholder" (no "verified") a propósito:
 * "Carlos Mendoza", "Sofía Ramírez" y "Alejandro Torres" son nombres de
 * ejemplo para pulir el diseño visual con Gustavo/Luis/Johanaly, NO
 * personas reales. TestimonialCard bloquea "placeholder" en cualquier
 * build de producción real (ver el guard en ese archivo) — ese guard
 * existe justo para evitar que un testimonio inventado llegue a un
 * usuario real, así que no se debilitó para este cambio de diseño.
 *
 * QUITAR antes de conectar tráfico pagado real: reemplazar cada entrada
 * por mode="verified" con datos reales (nombre, foto y fuente
 * verificable — Google Reviews/Trustpilot/escrito con consentimiento).
 * Ver checklist de deploy en la especificación de rediseño, §3.
 */
const PLACEHOLDER_TESTIMONIALS = [
  {
    authorName: "Carlos Mendoza",
    quote:
      "Pensé que un seguro de vida era solo para cuando uno falta. Cuando entendí que también podía usarlo en vida para mi retiro, me dio una tranquilidad que no esperaba.",
  },
  {
    authorName: "Sofía Ramírez",
    quote:
      "El proceso fue muchísimo más rápido de lo que imaginé — en menos de una semana ya tenía todo evaluado y aprobado, sin papeleo interminable.",
  },
  {
    authorName: "Alejandro Torres",
    quote:
      "Lo que más valoro es que nadie me presionó a decidir en la primera llamada. Me explicaron todo con calma, y solo avancé cuando entendí todo bien.",
  },
];

export function SocialProof() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Personas que ya pasaron por este proceso</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLACEHOLDER_TESTIMONIALS.map((testimonial) => (
          <TestimonialCard key={testimonial.authorName} mode="placeholder" rating={5} {...testimonial} />
        ))}
      </div>
    </div>
  );
}
