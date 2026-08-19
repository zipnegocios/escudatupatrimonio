/** Iconos SVG minimalistas inline para el panel admin — mismo patrón que
 * src/presentation/components/icons.tsx (sin emojis, per agents.md). */

function Base({
  children,
  size = 20,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconSearch(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Base>
  );
}

export function IconSend(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </Base>
  );
}

export function IconMic(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0014 0" />
      <path d="M12 18v4M8 22h8" />
    </Base>
  );
}

export function IconStop(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </Base>
  );
}

export function IconPaperclip(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M21 11.5L12.5 20a4.5 4.5 0 01-6.36-6.36L14.5 5.28a3 3 0 014.24 4.24L10.6 17.66a1.5 1.5 0 01-2.12-2.12l7.2-7.2" />
    </Base>
  );
}

export function IconCheck(props: { size?: number; className?: string }) {
  return (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export function IconCheckDouble(props: { size?: number; className?: string }) {
  return (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M1 12l5 5L15 8" />
      <path d="M9 12l5 5L23 6" />
    </svg>
  );
}

export function IconTrash(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M4 7h16" />
      <path d="M6 7V4a1 1 0 011-1h10a1 1 0 011 1v3" />
      <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </Base>
  );
}

export function IconPhone(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.7a2 2 0 01-.4 2.1L8 9.9a16 16 0 006 6l1.4-1.4a2 2 0 012.1-.4c.9.3 1.8.5 2.7.6a2 2 0 011.8 2.2z" />
    </Base>
  );
}

export function IconCaretLeft(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M15 18l-6-6 6-6" />
    </Base>
  );
}

export function IconUserPlus(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0114 0" />
      <path d="M19 8v6M22 11h-6" />
    </Base>
  );
}
