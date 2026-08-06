import type { ScreenId } from "@/core/entities/screen-id";
import type { QualificationProfile, IntencionP } from "@/core/entities/qualification-profile";
import { getTimezoneForState, isLicensedState } from "@/core/entities/us-states";
import { isBusinessHours } from "@/core/use-cases/availability";

export interface NavResult {
  nextScreen: ScreenId;
  varUpdates: Partial<QualificationProfile>;
}

/**
 * getNextScreen — única función que decide a qué pantalla ir. Implementa
 * exactamente las reglas "Sets:" / "Siguiente:" de cada pantalla en
 * mvp_arbol_decisiones_smart_form.md. Pura: sin React, sin Zustand, sin
 * fetch. Las pantallas nunca deciden su propia siguiente pantalla — solo
 * reportan qué botón se tocó (choiceId) y esta función responde.
 *
 * DISP_CHECK es un case aquí, nunca una pantalla renderizada: cuando el
 * flujo llega a PRE_CONF con choice 'CONFIRM', este módulo internamente
 * evalúa el horario de negocio antes de exponer DISP_NOW o DISP_SCHED.
 */
export function getNextScreen(
  current: ScreenId,
  choiceId: string,
  vars: QualificationProfile
): NavResult {
  switch (current) {
    case "LANDING":
      return { nextScreen: "E1_ENTRY", varUpdates: {} };

    case "E1_ENTRY":
      return { nextScreen: "S1", varUpdates: {} };

    case "S1":
      return { nextScreen: "Q_INT", varUpdates: {} };

    case "Q_INT": {
      const intencionP = choiceId as IntencionP;
      const nextByIntencion: Record<IntencionP, ScreenId> = {
        AHORRO_RETIRO: "Q_A1",
        PROTECCION_FAM: "Q_B1",
        SALUD_EMERGENCIA: "Q_C1",
      };
      return { nextScreen: nextByIntencion[intencionP], varUpdates: { intencionP } };
    }

    case "Q_A1":
      return { nextScreen: "Q_A2", varUpdates: { horizonte: choiceId as QualificationProfile["horizonte"] } };
    case "Q_A2":
      return { nextScreen: "S2A", varUpdates: { planRetiro: choiceId as QualificationProfile["planRetiro"] } };

    case "Q_B1":
      return { nextScreen: "Q_B2", varUpdates: { familiaTipo: choiceId as QualificationProfile["familiaTipo"] } };
    case "Q_B2":
      return { nextScreen: "S2B", varUpdates: { preocFamilia: choiceId as QualificationProfile["preocFamilia"] } };

    case "Q_C1":
      return { nextScreen: "Q_C2", varUpdates: { cobActual: choiceId as QualificationProfile["cobActual"] } };
    case "Q_C2":
      return { nextScreen: "S2C", varUpdates: { preocSalud: choiceId as QualificationProfile["preocSalud"] } };

    case "S2A":
    case "S2B":
    case "S2C":
      return { nextScreen: "Q_INT2", varUpdates: {} };

    case "Q_INT2": {
      if (choiceId === "NO") {
        return { nextScreen: "INFO_NLG", varUpdates: { intencionS: null } };
      }
      const secondaryByPrimary: Record<IntencionP, IntencionP> = {
        AHORRO_RETIRO: "PROTECCION_FAM",
        PROTECCION_FAM: "AHORRO_RETIRO",
        SALUD_EMERGENCIA: "AHORRO_RETIRO",
      };
      const intencionS = vars.intencionP ? secondaryByPrimary[vars.intencionP] : null;
      return { nextScreen: "INFO_NLG", varUpdates: { intencionS } };
    }

    case "INFO_NLG":
      return { nextScreen: "Q_FRAME", varUpdates: {} };
    case "Q_FRAME":
      return { nextScreen: "S3A", varUpdates: {} };
    case "S3A":
      return { nextScreen: "Q_EDAD", varUpdates: {} };

    case "Q_EDAD": {
      if (choiceId === "MENOR_18") return { nextScreen: "D_JOVEN", varUpdates: {} };
      if (choiceId === "MAYOR_70") return { nextScreen: "D_MAYOR", varUpdates: {} };
      const edadRango = choiceId as QualificationProfile["edadRango"];
      if (choiceId === "61_70") {
        return { nextScreen: "Q_EDAD_COND", varUpdates: { edadRango, edadCond: true } };
      }
      return { nextScreen: "Q_SALUD", varUpdates: { edadRango } };
    }

    case "Q_EDAD_COND":
      return { nextScreen: "Q_SALUD", varUpdates: {} };

    case "Q_SALUD": {
      const salud = choiceId as QualificationProfile["salud"];
      if (choiceId === "COND_MENOR") {
        return { nextScreen: "Q_SALUD_FLAG", varUpdates: { salud, saludFlag: "MENOR" } };
      }
      if (choiceId === "EN_TRATAMIENTO") {
        return { nextScreen: "Q_SALUD_FLAG", varUpdates: { salud, saludFlag: "TRATAMIENTO" } };
      }
      if (choiceId === "NO_COMENTA") {
        return { nextScreen: "Q_SALUD_FLAG", varUpdates: { salud, saludFlag: "NO_COMENTA" } };
      }
      return { nextScreen: "S3B", varUpdates: { salud, saludFlag: null } };
    }

    case "Q_SALUD_FLAG":
      return { nextScreen: "S3B", varUpdates: {} };
    case "S3B":
      return { nextScreen: "Q_ESTATUS", varUpdates: {} };

    case "Q_ESTATUS": {
      const estatus = choiceId as QualificationProfile["estatus"];
      if (choiceId === "OTRO") return { nextScreen: "D_ESTATUS", varUpdates: { estatus } };
      if (choiceId === "EN_PROCESO") {
        return { nextScreen: "Q_ESTATUS_NOTA", varUpdates: { estatus, estatusFlag: "EN_PROCESO" } };
      }
      if (choiceId === "ITIN") {
        return { nextScreen: "Q_ESTATUS_NOTA", varUpdates: { estatus, estatusFlag: "ITIN" } };
      }
      return { nextScreen: "Q_ESTADO", varUpdates: { estatus, estatusFlag: null } };
    }

    case "Q_ESTATUS_NOTA":
      return { nextScreen: "Q_ESTADO", varUpdates: {} };

    case "Q_ESTADO": {
      const estado = choiceId;
      const timezone = getTimezoneForState(estado);
      if (isLicensedState(estado)) {
        return { nextScreen: "S4", varUpdates: { estado, timezone, referido: false } };
      }
      return { nextScreen: "Q_ESTADO_REF", varUpdates: { estado, timezone, referido: true } };
    }

    case "Q_ESTADO_REF":
      return { nextScreen: "S4", varUpdates: {} };
    case "S4":
      return { nextScreen: "INFO_AGENTE", varUpdates: {} };
    case "INFO_AGENTE":
      return { nextScreen: "PRE_1", varUpdates: {} };
    case "PRE_1":
      return { nextScreen: "PRE_2", varUpdates: {} };
    case "PRE_2":
      return { nextScreen: "PRE_3", varUpdates: {} };
    case "PRE_3":
      return { nextScreen: "PRE_4", varUpdates: {} };
    case "PRE_4":
      return { nextScreen: "PRE_CONF", varUpdates: {} };
    case "PRE_FAQ":
      return { nextScreen: "PRE_CONF", varUpdates: {} };

    case "PRE_CONF": {
      if (choiceId === "QUESTION") return { nextScreen: "PRE_FAQ", varUpdates: {} };
      return { nextScreen: "DISP_CHECK", varUpdates: {} };
    }

    case "DISP_CHECK": {
      const businessHours = vars.timezone ? isBusinessHours(vars.timezone) : false;
      return { nextScreen: businessHours ? "DISP_NOW" : "DISP_SCHED", varUpdates: {} };
    }

    case "DISP_NOW": {
      if (choiceId === "AHORA") {
        return { nextScreen: "E5_CONTACTO", varUpdates: { priority: "INMEDIATO" } };
      }
      return { nextScreen: "DISP_SCHED", varUpdates: {} };
    }

    case "DISP_SCHED":
      return {
        nextScreen: "E5_CONTACTO",
        varUpdates: { ventanaDisp: choiceId, priority: "PROGRAMADO" },
      };

    case "E5_CONTACTO": {
      // E5_CONTACTO es la única pantalla con inputs de texto reales; envía
      // los datos como JSON en choiceId ya que ScreenComponentProps solo
      // expone onChoice(string) — el contrato se mantiene uniforme para
      // las 41 pantallas en vez de dar acceso directo al store a una sola.
      const contact = JSON.parse(choiceId) as Pick<QualificationProfile, "nombre" | "telefono" | "canal">;
      return { nextScreen: "S5", varUpdates: contact };
    }
    case "S5":
      return { nextScreen: "E5_FINAL", varUpdates: {} };

    // Terminales: no tienen siguiente pantalla en esta fase (sin backend).
    case "D_JOVEN":
    case "D_MAYOR":
    case "D_ESTATUS":
    case "E5_FINAL":
      return { nextScreen: current, varUpdates: {} };

    default: {
      const _exhaustive: never = current;
      return { nextScreen: _exhaustive, varUpdates: {} };
    }
  }
}
