interface VideoPlaceholderProps {
  label?: string;
}

/** Slot de video con overlay "Próximamente" — usado en Testimonials hasta que existan videos reales grabados. */
export function VideoPlaceholder({ label = "Próximamente" }: VideoPlaceholderProps) {
  return (
    <div className="relative w-full aspect-video rounded-2xl bg-bg-surface border border-border-card overflow-hidden flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M10 8l6 4-6 4V8z" fill="var(--text-muted)" stroke="none" />
      </svg>
      <span className="absolute bottom-3 right-3 type-caption px-3 py-1 rounded-full bg-[var(--bg-overlay)]">
        {label}
      </span>
    </div>
  );
}
