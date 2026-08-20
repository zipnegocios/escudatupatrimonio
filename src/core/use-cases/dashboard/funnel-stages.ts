import type { ScreenId } from "@/core/entities/screen-id";

export interface FunnelStage {
  key: string;
  label: string;
  screens: ScreenId[];
}

// Agrupa las 41 pantallas en 12 etapas narrativas para el gráfico principal
// del embudo — agrupar por ScreenMeta.type (screen-registry.ts) mezclaría
// pasos tempranos y tardíos sin sentido temporal (ej. "decision" incluye
// tanto Q_INT, al inicio, como Q_ESTADO, a ~70% del flujo). Orden y
// contenido derivados de la secuencia real en routing-table.ts. Las 3 ramas
// de intención (ahorro/protección/salud), mutuamente excluyentes, se agrupan
// en una sola etapa para que no aparezcan como caídas falsas.
export const STAGE_GROUPS: FunnelStage[] = [
  { key: "landing", label: "Landing", screens: ["LANDING"] },
  { key: "entrada", label: "Entrada", screens: ["E1_ENTRY", "S1"] },
  {
    key: "intencion",
    label: "Intención",
    screens: [
      "Q_INT",
      "Q_A1",
      "Q_A2",
      "Q_B1",
      "Q_B2",
      "Q_C1",
      "Q_C2",
      "S2A",
      "S2B",
      "S2C",
      "Q_INT2",
    ],
  },
  { key: "encuadre", label: "Encuadre", screens: ["INFO_NLG", "Q_FRAME", "S3A"] },
  { key: "edad", label: "Edad", screens: ["Q_EDAD", "Q_EDAD_COND"] },
  { key: "salud", label: "Salud", screens: ["Q_SALUD", "Q_SALUD_FLAG", "S3B"] },
  { key: "estatus", label: "Estatus", screens: ["Q_ESTATUS", "Q_ESTATUS_NOTA"] },
  { key: "estado", label: "Estado", screens: ["Q_ESTADO", "Q_ESTADO_REF", "S4"] },
  {
    key: "preencuadre",
    label: "Preencuadre",
    screens: ["INFO_AGENTE", "PRE_1", "PRE_2", "PRE_3", "PRE_4", "PRE_FAQ", "PRE_CONF"],
  },
  { key: "disponibilidad", label: "Disponibilidad", screens: ["DISP_NOW", "DISP_SCHED"] },
  { key: "contacto", label: "Contacto", screens: ["E5_CONTACTO", "S5"] },
  { key: "completado", label: "Completado", screens: ["E5_FINAL"] },
];

// Pantallas terminales de descalificación — no cuentan como una etapa más
// del embudo principal, se reportan aparte (ver get-funnel-summary.ts).
export const DISQUALIFICATION_SCREENS: Record<string, string> = {
  D_JOVEN: "Menor de 18",
  D_MAYOR: "Mayor de 70",
  D_ESTATUS: "Estatus no elegible",
};

export function stageForScreen(screenId: string): FunnelStage | null {
  return STAGE_GROUPS.find((stage) => stage.screens.includes(screenId as ScreenId)) ?? null;
}
