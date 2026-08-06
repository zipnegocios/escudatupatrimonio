import type { ScreenId } from "@/core/entities/screen-id";

export type ScreenType =
  | "landing"
  | "entry"
  | "decision"
  | "stimulation"
  | "note"
  | "bridge"
  | "educational"
  | "preencuadre"
  | "exit"
  | "scheduling"
  | "contact-form"
  | "confirmation"
  | "routing";

export interface ScreenMeta {
  type: ScreenType;
  /** Texto de progreso mostrado en la pantalla, ej. "Paso 1 de 5". null = sin indicador. */
  progressLabel: string | null;
  /** Solo para type: 'stimulation' | 'note' — duración mínima antes de permitir avanzar por tap. */
  minDurationMs?: number;
  /** Solo para type: 'stimulation' | 'note' — a partir de qué momento el tap adelanta. */
  tapAdvanceAfterMs?: number;
}

export const SCREEN_REGISTRY: Record<ScreenId, ScreenMeta> = {
  LANDING: { type: "landing", progressLabel: null },
  E1_ENTRY: { type: "entry", progressLabel: null },
  S1: { type: "stimulation", progressLabel: null, minDurationMs: 3000, tapAdvanceAfterMs: 1500 },
  Q_INT: { type: "decision", progressLabel: "Paso 1 de 5" },
  Q_A1: { type: "decision", progressLabel: "Paso 1 de 5" },
  Q_A2: { type: "decision", progressLabel: "Paso 1 de 5" },
  Q_B1: { type: "decision", progressLabel: "Paso 1 de 5" },
  Q_B2: { type: "decision", progressLabel: "Paso 1 de 5" },
  Q_C1: { type: "decision", progressLabel: "Paso 1 de 5" },
  Q_C2: { type: "decision", progressLabel: "Paso 1 de 5" },
  S2A: { type: "stimulation", progressLabel: null, minDurationMs: 4000, tapAdvanceAfterMs: 2000 },
  S2B: { type: "stimulation", progressLabel: null, minDurationMs: 4000, tapAdvanceAfterMs: 2000 },
  S2C: { type: "stimulation", progressLabel: null, minDurationMs: 4000, tapAdvanceAfterMs: 2000 },
  Q_INT2: { type: "decision", progressLabel: "Paso 1 de 5" },
  INFO_NLG: { type: "educational", progressLabel: null },
  Q_FRAME: { type: "bridge", progressLabel: "Paso 2 de 5" },
  S3A: { type: "stimulation", progressLabel: null, minDurationMs: 3000, tapAdvanceAfterMs: 1500 },
  Q_EDAD: { type: "decision", progressLabel: "Paso 2 de 5" },
  D_JOVEN: { type: "exit", progressLabel: null },
  D_MAYOR: { type: "exit", progressLabel: null },
  Q_EDAD_COND: { type: "note", progressLabel: null, minDurationMs: 3000, tapAdvanceAfterMs: 1000 },
  Q_SALUD: { type: "decision", progressLabel: "Paso 2 de 5" },
  Q_SALUD_FLAG: { type: "note", progressLabel: null, minDurationMs: 3000, tapAdvanceAfterMs: 1000 },
  S3B: { type: "stimulation", progressLabel: null, minDurationMs: 5000, tapAdvanceAfterMs: 2500 },
  Q_ESTATUS: { type: "decision", progressLabel: "Paso 2 de 5" },
  D_ESTATUS: { type: "exit", progressLabel: null },
  Q_ESTATUS_NOTA: { type: "note", progressLabel: null, minDurationMs: 3000, tapAdvanceAfterMs: 1000 },
  Q_ESTADO: { type: "decision", progressLabel: "Paso 2 de 5" },
  Q_ESTADO_REF: { type: "note", progressLabel: null, minDurationMs: 3000, tapAdvanceAfterMs: 1000 },
  S4: { type: "stimulation", progressLabel: null, minDurationMs: 5000, tapAdvanceAfterMs: 2500 },
  INFO_AGENTE: { type: "educational", progressLabel: null },
  PRE_1: { type: "preencuadre", progressLabel: "Paso 4 de 5 · Módulo 1 de 4" },
  PRE_2: { type: "preencuadre", progressLabel: "Paso 4 de 5 · Módulo 2 de 4" },
  PRE_3: { type: "preencuadre", progressLabel: "Paso 4 de 5 · Módulo 3 de 4" },
  PRE_4: { type: "preencuadre", progressLabel: "Paso 4 de 5 · Módulo 4 de 4" },
  PRE_FAQ: { type: "preencuadre", progressLabel: null },
  PRE_CONF: { type: "preencuadre", progressLabel: "Paso 4 de 5" },
  DISP_CHECK: { type: "routing", progressLabel: null },
  DISP_NOW: { type: "scheduling", progressLabel: "Paso 5 de 5" },
  DISP_SCHED: { type: "scheduling", progressLabel: "Paso 5 de 5" },
  E5_CONTACTO: { type: "contact-form", progressLabel: "Paso 5 de 5" },
  S5: { type: "stimulation", progressLabel: null, minDurationMs: 5000 }, // sin tap-advance: "siempre completo"
  E5_FINAL: { type: "confirmation", progressLabel: null },
};
