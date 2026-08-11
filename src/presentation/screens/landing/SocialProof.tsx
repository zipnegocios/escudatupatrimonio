import { TestimonialCard } from "@/presentation/components/TestimonialCard";

/**
 * Sección 2.8 — Prueba social. Los 3 slots se renderizan SIN prop `mode`
 * (estado "Próximamente"): no existen testimonios reales todavía. Nunca
 * pasar mode="placeholder" aquí — ver el guard de NODE_ENV en
 * TestimonialCard.tsx.
 */
export function SocialProof() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Personas que ya pasaron por este proceso</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TestimonialCard />
        <TestimonialCard />
        <TestimonialCard />
      </div>
    </div>
  );
}
