import type { EdadRango, Estatus } from "@/core/entities/qualification-profile";

/** Q_EDAD opción "Menos de 18" — no es un EdadRango del enum, se maneja como choice separado. */
export function isUnderageChoice(choiceId: string): boolean {
  return choiceId === "MENOR_18";
}

/** Q_EDAD opción "Más de 70" — no es un EdadRango del enum, se maneja como choice separado. */
export function isOverageChoice(choiceId: string): boolean {
  return choiceId === "MAYOR_70";
}

export function requiresEdadCondNote(edadRango: EdadRango): boolean {
  return edadRango === "61_70";
}

export function isStatusDisqualified(estatus: Estatus): boolean {
  return estatus === "OTRO";
}
