"use client";

import { useEffect, useRef } from "react";

/**
 * Hook compartido por las 8 pantallas de estimulación (S1, S2A/B/C, S3A/B,
 * S4, S5) y las 4 de nota (Q_EDAD_COND, Q_SALUD_FLAG, Q_ESTATUS_NOTA,
 * Q_ESTADO_REF): auto-avanza tras `minDurationMs`, y permite adelantar con
 * un tap a partir de `tapAdvanceAfterMs` (si se omite, el tap nunca se
 * habilita — usado por S5, que "siempre se completa").
 */
export function useStimAdvance(
  minDurationMs: number,
  tapAdvanceAfterMs: number | undefined,
  onAdvance: () => void
) {
  const canTapRef = useRef(false);
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    canTapRef.current = false;
    const autoTimer = setTimeout(() => onAdvanceRef.current(), minDurationMs);
    let tapTimer: ReturnType<typeof setTimeout> | undefined;
    if (tapAdvanceAfterMs !== undefined) {
      tapTimer = setTimeout(() => {
        canTapRef.current = true;
      }, tapAdvanceAfterMs);
    }
    return () => {
      clearTimeout(autoTimer);
      if (tapTimer) clearTimeout(tapTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDurationMs, tapAdvanceAfterMs]);

  const handleTap = () => {
    if (canTapRef.current) onAdvanceRef.current();
  };

  return { handleTap };
}
