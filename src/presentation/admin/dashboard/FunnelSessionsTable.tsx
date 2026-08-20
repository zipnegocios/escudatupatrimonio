"use client";

import { useState } from "react";
import type { FunnelSessionDetail } from "@/core/use-cases/dashboard/list-funnel-sessions";
import { formatDuration } from "@/presentation/admin/dashboard/format-duration";
import { IconChevronRight, IconUsers } from "@/presentation/admin/icons";
import { Badge, type BadgeTone } from "@/presentation/admin/ui/Badge";
import { EmptyState } from "@/presentation/admin/ui/EmptyState";

const MAX_VISIBLE = 100;

function statusFor(session: FunnelSessionDetail): { label: string; tone: BadgeTone } {
  if (session.completed) return { label: "Completó", tone: "success" };
  if (session.disqualified) return { label: "Descalificado", tone: "caution" };
  return { label: "Abandonó", tone: "neutral" };
}

function SessionRow({ session }: { session: FunnelSessionDetail }) {
  const [open, setOpen] = useState(false);
  const status = statusFor(session);
  const lastScreenLabel = session.screens[session.screens.length - 1]?.label ?? session.lastScreenId;

  return (
    <li className="rounded-lg border border-border-card">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className={`shrink-0 text-text-muted transition-transform ${open ? "rotate-90" : ""}`}>
            <IconChevronRight size={14} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              {new Date(session.startedAt).toLocaleString("es-VE", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p className="truncate text-xs text-text-muted">
              {session.screens.length} {session.screens.length === 1 ? "pantalla" : "pantallas"} · última:{" "}
              {lastScreenLabel}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs text-text-secondary">{formatDuration(session.totalDurationMs)}</span>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-border-card px-3 py-2">
          <table className="w-full min-w-[360px] text-left text-xs">
            <thead className="text-text-muted">
              <tr>
                <th className="py-1 pr-3 font-medium">Pantalla</th>
                <th className="py-1 pr-3 font-medium">Etapa</th>
                <th className="py-1 font-medium">Duración</th>
              </tr>
            </thead>
            <tbody>
              {session.screens.map((screen) => (
                <tr key={screen.screenId} className="border-t border-border-subtle">
                  <td className="py-1 pr-3 text-text-primary">{screen.screenId}</td>
                  <td className="py-1 pr-3 text-text-secondary">{screen.label}</td>
                  <td className="py-1 text-text-secondary">{formatDuration(screen.durationMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </li>
  );
}

export function FunnelSessionsTable({ sessions }: { sessions: FunnelSessionDetail[] }) {
  const visible = sessions.slice(0, MAX_VISIBLE);

  if (visible.length === 0) {
    return <EmptyState icon={<IconUsers size={28} />} message="No hay sesiones en este período." />;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {visible.map((session) => (
          <SessionRow key={session.sessionId} session={session} />
        ))}
      </ul>
      {sessions.length > MAX_VISIBLE && (
        <p className="text-center text-xs text-text-muted">
          Mostrando las {MAX_VISIBLE} sesiones más recientes de {sessions.length} en este período.
        </p>
      )}
    </div>
  );
}
