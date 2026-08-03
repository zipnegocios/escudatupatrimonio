/**
 * Union de todos los IDs de pantalla del wizard, según el inventario de
 * mvp_arbol_decisiones_smart_form.md (42 filas en la tabla; DISP_CHECK es una
 * decisión de ruteo invisible, no una pantalla renderizada → 41 pantallas
 * renderizadas). Cualquier referencia a un ID inexistente es un error de
 * compilación, no un callejón sin salida en tiempo de ejecución.
 */
export type ScreenId =
  | "E1_ENTRY"
  | "S1"
  | "Q_INT"
  | "Q_A1"
  | "Q_A2"
  | "Q_B1"
  | "Q_B2"
  | "Q_C1"
  | "Q_C2"
  | "S2A"
  | "S2B"
  | "S2C"
  | "Q_INT2"
  | "INFO_NLG"
  | "Q_FRAME"
  | "S3A"
  | "Q_EDAD"
  | "D_JOVEN"
  | "D_MAYOR"
  | "Q_EDAD_COND"
  | "Q_SALUD"
  | "Q_SALUD_FLAG"
  | "S3B"
  | "Q_ESTATUS"
  | "D_ESTATUS"
  | "Q_ESTATUS_NOTA"
  | "Q_ESTADO"
  | "Q_ESTADO_REF"
  | "S4"
  | "INFO_AGENTE"
  | "PRE_1"
  | "PRE_2"
  | "PRE_3"
  | "PRE_4"
  | "PRE_FAQ"
  | "PRE_CONF"
  | "DISP_CHECK" // marcador interno de ruteo — nunca se renderiza
  | "DISP_NOW"
  | "DISP_SCHED"
  | "E5_CONTACTO"
  | "S5"
  | "E5_FINAL";

/** IDs que corresponden a una decisión de ruteo pura, sin componente de pantalla. */
export const INTERNAL_ROUTING_SCREENS: ReadonlySet<ScreenId> = new Set([
  "DISP_CHECK",
]);
