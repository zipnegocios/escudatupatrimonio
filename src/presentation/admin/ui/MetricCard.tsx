import type { ReactNode } from "react";
import { Card } from "@/presentation/admin/ui/Card";

export function MetricCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p>
          {trend && <p className="mt-1 text-xs text-text-muted">{trend}</p>}
        </div>
        <div className="rounded-lg bg-trust-bg p-2 text-trust">{icon}</div>
      </div>
    </Card>
  );
}
