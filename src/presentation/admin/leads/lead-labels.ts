import type { BadgeTone } from "@/presentation/admin/ui/Badge";

// Etiquetas en español para cada variable de QualificationProfile — el
// mismo diccionario alimenta el <select> de edición y la vista de lectura.
export const INTENCION_LABEL: Record<string, string> = {
  AHORRO_RETIRO: "Ahorro / Retiro",
  PROTECCION_FAM: "Protección familiar",
  SALUD_EMERGENCIA: "Salud / Emergencia",
};

export const HORIZONTE_LABEL: Record<string, string> = {
  CORTO: "Corto plazo",
  MEDIO: "Mediano plazo",
  LARGO: "Largo plazo",
  ABIERTO: "Abierto",
};

export const PLAN_RETIRO_LABEL: Record<string, string> = {
  TIENE: "Ya tiene un plan",
  INICIANDO: "Está iniciando uno",
  NINGUNO: "No tiene",
};

export const FAMILIA_TIPO_LABEL: Record<string, string> = {
  HIJOS_PEQ: "Hijos pequeños",
  HIJOS_ADULT: "Hijos adultos",
  PAREJA: "Pareja",
  AMBOS: "Ambos",
  OTROS: "Otros",
};

export const PREOC_FAMILIA_LABEL: Record<string, string> = {
  INGRESOS: "Pérdida de ingresos",
  DEUDAS: "Deudas",
  EDUCACION: "Educación",
  ESTILO: "Estilo de vida",
};

export const COB_ACTUAL_LABEL: Record<string, string> = {
  NINGUNO: "Ninguna cobertura",
  PARCIAL: "Cobertura parcial",
  MEJORAR: "Quiere mejorar la cobertura",
};

export const PREOC_SALUD_LABEL: Record<string, string> = {
  HOSPITAL: "Gastos de hospital",
  INGRESOS_S: "Pérdida de ingresos por salud",
  GASTOS: "Gastos médicos",
  CARGA: "Ser una carga para la familia",
};

export const EDAD_RANGO_LABEL: Record<string, string> = {
  "18_35": "18 a 35",
  "36_50": "36 a 50",
  "51_60": "51 a 60",
  "61_70": "61 a 70",
};

export const SALUD_LABEL: Record<string, string> = {
  EXCELENTE: "Excelente",
  MUY_BIEN: "Muy buena",
  COND_MENOR: "Condición menor",
  EN_TRATAMIENTO: "En tratamiento",
  NO_COMENTA: "Prefiere no comentar",
};

export const SALUD_FLAG_LABEL: Record<string, string> = {
  MENOR: "Condición menor",
  TRATAMIENTO: "En tratamiento",
  NO_COMENTA: "No comentó",
};

export const ESTATUS_LABEL: Record<string, string> = {
  CIUDADANO: "Ciudadano",
  RESIDENTE: "Residente",
  EN_PROCESO: "En proceso",
  ITIN: "ITIN",
  OTRO: "Otro",
};

export const ESTATUS_FLAG_LABEL: Record<string, string> = {
  EN_PROCESO: "En proceso",
  ITIN: "ITIN",
};

export const PRIORITY_LABEL: Record<string, string> = {
  INMEDIATO: "Inmediato",
  PROGRAMADO: "Programado",
};

export const CANAL_LABEL: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  LLAMADA: "Llamada",
  WA_PRIMERO: "WhatsApp primero",
};

export const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  SCHEDULED: "Agendado",
  QUALIFIED: "Calificado",
  DISQUALIFIED: "Descalificado",
  CLOSED_WON: "Cerrado ganado",
  CLOSED_LOST: "Cerrado perdido",
};

export const LEAD_STATUS_TONE: Record<string, BadgeTone> = {
  NEW: "trust",
  CONTACTED: "gold",
  SCHEDULED: "trust",
  QUALIFIED: "success",
  DISQUALIFIED: "neutral",
  CLOSED_WON: "success",
  CLOSED_LOST: "caution",
};
