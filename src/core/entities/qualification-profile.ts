/**
 * Las 22 variables acumuladas en silencio durante el flujo (ver "Variables
 * del sistema" en mvp_arbol_decisiones_smart_form.md). agents.md menciona
 * "16 variables" de forma aproximada; el propio documento fuente enumera 22 —
 * se construyen las 22 porque las reglas de tags de GHL y el ruteo dependen
 * de todas ellas.
 */

export type IntencionP = "AHORRO_RETIRO" | "PROTECCION_FAM" | "SALUD_EMERGENCIA";
export type Horizonte = "CORTO" | "MEDIO" | "LARGO" | "ABIERTO";
export type PlanRetiro = "TIENE" | "INICIANDO" | "NINGUNO";
export type FamiliaTipo = "HIJOS_PEQ" | "HIJOS_ADULT" | "PAREJA" | "AMBOS" | "OTROS";
export type PreocFamilia = "INGRESOS" | "DEUDAS" | "EDUCACION" | "ESTILO";
export type CobActual = "NINGUNO" | "PARCIAL" | "MEJORAR";
export type PreocSalud = "HOSPITAL" | "INGRESOS_S" | "GASTOS" | "CARGA";
export type EdadRango = "18_35" | "36_50" | "51_60" | "61_70";
export type Salud = "EXCELENTE" | "MUY_BIEN" | "COND_MENOR" | "EN_TRATAMIENTO" | "NO_COMENTA";
export type SaludFlag = "MENOR" | "TRATAMIENTO" | "NO_COMENTA";
export type Estatus = "CIUDADANO" | "RESIDENTE" | "EN_PROCESO" | "ITIN" | "OTRO";
export type EstatusFlag = "EN_PROCESO" | "ITIN";
export type Priority = "INMEDIATO" | "PROGRAMADO";
export type Canal = "WHATSAPP" | "LLAMADA" | "WA_PRIMERO";

export interface QualificationProfile {
  intencionP: IntencionP | null;
  intencionS: IntencionP | null;

  // Solo se llenan en la rama AHORRO_RETIRO
  horizonte: Horizonte | null;
  planRetiro: PlanRetiro | null;

  // Solo se llenan en la rama PROTECCION_FAM
  familiaTipo: FamiliaTipo | null;
  preocFamilia: PreocFamilia | null;

  // Solo se llenan en la rama SALUD_EMERGENCIA
  cobActual: CobActual | null;
  preocSalud: PreocSalud | null;

  edadRango: EdadRango | null;
  edadCond: boolean;

  salud: Salud | null;
  saludFlag: SaludFlag | null;

  estatus: Estatus | null;
  estatusFlag: EstatusFlag | null;

  estado: string | null; // código de estado EE.UU.
  timezone: string | null; // zona horaria IANA derivada de `estado`
  referido: boolean;

  priority: Priority | null;
  ventanaDisp: string | null;

  nombre: string | null;
  telefono: string | null;
  canal: Canal;
}

export const INITIAL_QUALIFICATION_PROFILE: QualificationProfile = {
  intencionP: null,
  intencionS: null,
  horizonte: null,
  planRetiro: null,
  familiaTipo: null,
  preocFamilia: null,
  cobActual: null,
  preocSalud: null,
  edadRango: null,
  edadCond: false,
  salud: null,
  saludFlag: null,
  estatus: null,
  estatusFlag: null,
  estado: null,
  timezone: null,
  referido: false,
  priority: null,
  ventanaDisp: null,
  nombre: null,
  telefono: null,
  canal: "WHATSAPP",
};
