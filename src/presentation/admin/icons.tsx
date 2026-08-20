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

export function IconRefresh(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M21 12a9 9 0 0 1-15.5 6.3M3 12a9 9 0 0 1 15.5-6.3" />
      <path d="M3 4v5h5M21 20v-5h-5" />
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

export function IconHome(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
    </Base>
  );
}

export function IconUsers(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0114 0" />
      <circle cx="17" cy="8" r="3" />
      <path d="M22 21a6 6 0 00-4.5-8.7" />
    </Base>
  );
}

export function IconCalendarDays(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </Base>
  );
}

export function IconMail(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 6.5l9 6.5 9-6.5" />
    </Base>
  );
}

export function IconUserCircle(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.2 18.5a6 6 0 0111.6 0" />
    </Base>
  );
}

export function IconMessageCircle(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M21 12a8.5 8.5 0 01-12.4 7.6L3 21l1.4-5.6A8.5 8.5 0 1121 12z" />
    </Base>
  );
}

export function IconChartBar(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M4 21V10M12 21V4M20 21v-7" />
      <path d="M2 21h20" />
    </Base>
  );
}

export function IconTrendingUp(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 6h6v6" />
    </Base>
  );
}

export function IconMenu(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Base>
  );
}

export function IconClose(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function IconLogout(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Base>
  );
}

export function IconClock(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Base>
  );
}

export function IconAlertTriangle(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 10v4M12 17.5h.01" />
    </Base>
  );
}

export function IconChevronRight(props: { size?: number }) {
  return (
    <Base size={props.size}>
      <path d="M9 6l6 6-6 6" />
    </Base>
  );
}
