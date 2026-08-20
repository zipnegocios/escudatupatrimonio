import type { ReactNode } from "react";

export function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-text-muted">
      {icon}
      <p className="text-sm">{message}</p>
    </div>
  );
}
