"use client";

interface BackButtonProps {
  onClick: () => void;
}

/**
 * Flecha de retroceso persistente, visible en cualquier pantalla del
 * wizard excepto LANDING (que no tiene "atrás" — es el punto de entrada).
 * Vive en SmartFormApp, no dentro de cada screen individual: así se
 * garantiza que las 41 pantallas la reciban sin tener que tocar cada una.
 */
export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Volver a la pantalla anterior"
      className="fixed z-40 top-[calc(env(safe-area-inset-top)+14px)] left-4 w-10 h-10 rounded-full flex items-center justify-center bg-bg-surface/90 backdrop-blur border border-border-card shadow-sm active:scale-90 transition-transform"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
