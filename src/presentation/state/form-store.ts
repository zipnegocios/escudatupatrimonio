"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ScreenId } from "@/core/entities/screen-id";
import {
  INITIAL_QUALIFICATION_PROFILE,
  type QualificationProfile,
} from "@/core/entities/qualification-profile";
import { getNextScreen } from "@/core/use-cases/routing-table";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface FormState {
  sessionId: string;
  currentScreen: ScreenId;
  history: ScreenId[];
  vars: QualificationProfile;
  /** Valor crudo de ?utm_campaign= capturado por LANDING al montar. No es parte de QualificationProfile: es metadata de marketing efímera, no una de las 22 variables silenciosas que se envían a GHL. */
  utmCampaign: string | null;
  setUtmCampaign: (value: string | null) => void;
  setVar: <K extends keyof QualificationProfile>(key: K, value: QualificationProfile[K]) => void;
  setVars: (patch: Partial<QualificationProfile>) => void;
  navigate: (choiceId: string) => void;
  goBack: () => void;
  reset: () => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      sessionId: createSessionId(),
      currentScreen: "LANDING",
      history: [],
      vars: INITIAL_QUALIFICATION_PROFILE,
      utmCampaign: null,

      setUtmCampaign: (value) => set({ utmCampaign: value }),

      setVar: (key, value) =>
        set((state) => ({ vars: { ...state.vars, [key]: value } })),

      setVars: (patch) =>
        set((state) => ({ vars: { ...state.vars, ...patch } })),

      navigate: (choiceId) => {
        const { currentScreen, vars, history } = get();
        let result = getNextScreen(currentScreen, choiceId, vars);
        let mergedVars = { ...vars, ...result.varUpdates };
        const path: ScreenId[] = [currentScreen];

        // DISP_CHECK nunca se renderiza: si el ruteo aterriza ahí, se
        // resuelve internamente antes de exponer la siguiente pantalla real.
        while (result.nextScreen === "DISP_CHECK") {
          path.push(result.nextScreen);
          result = getNextScreen(result.nextScreen, choiceId, mergedVars);
          mergedVars = { ...mergedVars, ...result.varUpdates };
        }

        set({
          currentScreen: result.nextScreen,
          vars: mergedVars,
          history: [...history, ...path],
        });
      },

      goBack: () => {
        const { history } = get();
        if (history.length === 0) return;
        const nextHistory = [...history];
        const previous = nextHistory.pop() as ScreenId;
        set({ currentScreen: previous, history: nextHistory });
      },

      reset: () =>
        set({
          sessionId: createSessionId(),
          currentScreen: "LANDING",
          history: [],
          vars: INITIAL_QUALIFICATION_PROFILE,
          utmCampaign: null,
        }),
    }),
    {
      name: "escudo-tu-patrimonio-form",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : (undefined as unknown as Storage)
      ),
    }
  )
);
