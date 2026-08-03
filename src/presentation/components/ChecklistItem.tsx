interface ChecklistItemProps {
  text: string;
}

/** Item de checklist estático (visual, no interactivo) usado en PRE_CONF. */
export function ChecklistItem({ text }: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-success-bg flex items-center justify-center">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="var(--success)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="type-body">{text}</p>
    </div>
  );
}
