export type BadgeTone = "success" | "caution" | "trust" | "gold" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-success-bg text-success",
  caution: "bg-caution-bg text-caution",
  trust: "bg-trust-bg text-trust",
  gold: "bg-gold-subtle text-gold-text",
  neutral: "bg-bg-elevated text-text-secondary",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
