/** Iconos SVG minimalistas inline — sin emojis, per agents.md. */

function Base({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function IconSavings() {
  return (
    <Base>
      <path d="M12 2v4M8 21h8M9 11h.01M9.5 3.5C6 4 3 7 3 11c0 5 4.5 9 9 10 4.5-1 9-5 9-10 0-4-3-7-6.5-7.5" />
    </Base>
  );
}

export function IconFamily() {
  return (
    <Base>
      <path d="M12 2L3 7v5c0 5.25 3.75 9.74 9 10.93C17.25 21.74 21 17.25 21 12V7L12 2z" />
    </Base>
  );
}

export function IconHealth() {
  return (
    <Base>
      <path d="M12 8v8M8 12h8" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </Base>
  );
}

export function IconChildren() {
  return (
    <Base>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M4 21v-2a4 4 0 014-4h0M20 21v-2a4 4 0 00-4-4h0" />
    </Base>
  );
}

export function IconPartner() {
  return (
    <Base>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 21v-2a5 5 0 015-5h2a5 5 0 015 5v0" />
    </Base>
  );
}

export function IconHeart() {
  return (
    <Base>
      <path d="M12 21s-7-4.5-9.5-9C1 8.5 2.5 5 6 5c2 0 3.5 1.5 6 4.5C14.5 6.5 16 5 18 5c3.5 0 5 3.5 3.5 7-2.5 4.5-9.5 9-9.5 9z" />
    </Base>
  );
}

export function IconClock() {
  return (
    <Base>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </Base>
  );
}

export function IconDocument() {
  return (
    <Base>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13l2 2 4-4" />
    </Base>
  );
}

export function IconShield() {
  return (
    <Base>
      <path d="M12 2l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V5l7-3z" />
    </Base>
  );
}
