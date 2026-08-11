import { TestimonialCard } from "@/presentation/components/TestimonialCard";

/**
 * Sección 2.8 — Prueba social.
 *
 * Los 3 testimonios usan mode="placeholder" a propósito: es contenido
 * ilustrativo para validar el prototipo con Gustavo/Luis/Johanaly, NO
 * testimonios reales. El componente TestimonialCard ya bloquea esto en
 * el environment de producción real (NEXT_PUBLIC_DEPLOY_ENV=production en
 * Vercel — lanza un error si se intenta renderizar así ahí), así que es
 * seguro tenerlos visibles acá y en cualquier deploy de preview mientras
 * el proyecto sigue en fase de validación interna.
 *
 * QUITAR antes de conectar tráfico pagado real: reemplazar cada
 * `mode="placeholder"` por `mode="verified"` con datos de la campaña
 * interna de recolección de testimonios (nombre, foto y fuente
 * verificable — Google Reviews/Trustpilot/escrito con consentimiento).
 * Ver checklist de deploy en la especificación de rediseño, §3.
 */
const PLACEHOLDER_TESTIMONIALS = [
  "Pensé que un seguro de vida era solo para cuando uno falta. Cuando entendí que también podía usarlo en vida para mi retiro, me dio una tranquilidad que no esperaba.",
  "El proceso fue muchísimo más rápido de lo que imaginé — en menos de una semana ya tenía todo evaluado y aprobado, sin papeleo interminable.",
  "Lo que más valoro es que nadie me presionó a decidir en la primera llamada. Me explicaron todo con calma, y solo avancé cuando entendí todo bien.",
];

export function SocialProof() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Personas que ya pasaron por este proceso</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLACEHOLDER_TESTIMONIALS.map((quote) => (
          <TestimonialCard key={quote} mode="placeholder" quote={quote} />
        ))}
      </div>
    </div>
  );
}
