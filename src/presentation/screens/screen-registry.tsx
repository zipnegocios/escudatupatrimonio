import type { ComponentType } from "react";
import type { ScreenId } from "@/core/entities/screen-id";
import type { QualificationProfile } from "@/core/entities/qualification-profile";

import { E1Entry } from "@/presentation/screens/entry/E1Entry";
import { S1 } from "@/presentation/screens/stimulation/S1";
import { QInt } from "@/presentation/screens/warmup/QInt";
import { QA1 } from "@/presentation/screens/warmup/QA1";
import { QA2 } from "@/presentation/screens/warmup/QA2";
import { QB1 } from "@/presentation/screens/warmup/QB1";
import { QB2 } from "@/presentation/screens/warmup/QB2";
import { QC1 } from "@/presentation/screens/warmup/QC1";
import { QC2 } from "@/presentation/screens/warmup/QC2";
import { S2A } from "@/presentation/screens/stimulation/S2A";
import { S2B } from "@/presentation/screens/stimulation/S2B";
import { S2C } from "@/presentation/screens/stimulation/S2C";
import { QInt2 } from "@/presentation/screens/warmup/QInt2";
import { InfoNlg } from "@/presentation/screens/education/InfoNlg";
import { QFrame } from "@/presentation/screens/qualification/QFrame";
import { QEdad } from "@/presentation/screens/qualification/QEdad";
import { QEdadCond } from "@/presentation/screens/notes/QEdadCond";
import { DJoven } from "@/presentation/screens/exits/DJoven";
import { DMayor } from "@/presentation/screens/exits/DMayor";
import { QSalud } from "@/presentation/screens/qualification/QSalud";
import { QSaludFlag } from "@/presentation/screens/notes/QSaludFlag";
import { QEstatus } from "@/presentation/screens/qualification/QEstatus";
import { QEstatusNota } from "@/presentation/screens/notes/QEstatusNota";
import { DEstatus } from "@/presentation/screens/exits/DEstatus";
import { QEstado } from "@/presentation/screens/qualification/QEstado";
import { QEstadoRef } from "@/presentation/screens/notes/QEstadoRef";
import { S3A } from "@/presentation/screens/stimulation/S3A";
import { S3B } from "@/presentation/screens/stimulation/S3B";
import { S4 } from "@/presentation/screens/stimulation/S4";
import { S5 } from "@/presentation/screens/stimulation/S5";
import { InfoAgente } from "@/presentation/screens/education/InfoAgente";
import { Pre1 } from "@/presentation/screens/preencuadre/Pre1";
import { Pre2 } from "@/presentation/screens/preencuadre/Pre2";
import { Pre3 } from "@/presentation/screens/preencuadre/Pre3";
import { Pre4 } from "@/presentation/screens/preencuadre/Pre4";
import { PreConf } from "@/presentation/screens/preencuadre/PreConf";
import { PreFaq } from "@/presentation/screens/preencuadre/PreFaq";
import { DispNow } from "@/presentation/screens/scheduling/DispNow";
import { DispSched } from "@/presentation/screens/scheduling/DispSched";
import { E5Contacto } from "@/presentation/screens/scheduling/E5Contacto";
import { E5Final } from "@/presentation/screens/E5Final";
import { LandingScreen } from "@/presentation/screens/landing/LandingScreen";

export interface ScreenComponentProps {
  vars: QualificationProfile;
  onChoice: (choiceId: string) => void;
}

export type ScreenComponent = ComponentType<ScreenComponentProps>;

/**
 * Mapa ScreenId → componente de React. Se completa incrementalmente a
 * medida que se construye cada fase (ver plan de build). Las pantallas que
 * aún no existen caen al placeholder de SmartFormApp.
 */
export const SCREEN_COMPONENTS: Partial<Record<ScreenId, ScreenComponent>> = {
  LANDING: LandingScreen,
  E1_ENTRY: E1Entry,
  S1,
  Q_INT: QInt,
  Q_A1: QA1,
  Q_A2: QA2,
  Q_B1: QB1,
  Q_B2: QB2,
  Q_C1: QC1,
  Q_C2: QC2,
  S2A,
  S2B,
  S2C,
  Q_INT2: QInt2,
  INFO_NLG: InfoNlg,
  Q_FRAME: QFrame,
  Q_EDAD: QEdad,
  Q_EDAD_COND: QEdadCond,
  D_JOVEN: DJoven,
  D_MAYOR: DMayor,
  Q_SALUD: QSalud,
  Q_SALUD_FLAG: QSaludFlag,
  Q_ESTATUS: QEstatus,
  Q_ESTATUS_NOTA: QEstatusNota,
  D_ESTATUS: DEstatus,
  Q_ESTADO: QEstado,
  Q_ESTADO_REF: QEstadoRef,
  S3A,
  S3B,
  S4,
  S5,
  INFO_AGENTE: InfoAgente,
  PRE_1: Pre1,
  PRE_2: Pre2,
  PRE_3: Pre3,
  PRE_4: Pre4,
  PRE_CONF: PreConf,
  PRE_FAQ: PreFaq,
  DISP_NOW: DispNow,
  DISP_SCHED: DispSched,
  E5_CONTACTO: E5Contacto,
  E5_FINAL: E5Final,
};
