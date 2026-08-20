"use client";

import { useEffect, useState } from "react";
import { useFormStore } from "@/presentation/state/form-store";
import { SCREEN_COMPONENTS } from "@/presentation/screens/screen-registry";
import { BackButton } from "@/presentation/components/BackButton";
import { ConfirmExitModal } from "@/presentation/components/ConfirmExitModal";
import { trackScreenReached } from "@/presentation/state/funnel-tracking";

/**
 * Shell del wizard: una sola ruta cliente que renderiza los 41 screens según
 * el estado en memoria del store. onChoice es la única forma en que una
 * pantalla puede pedir avanzar — SmartFormApp conecta eso a
 * store.navigate(choiceId), que a su vez llama a getNextScreen. Ninguna
 * pantalla decide su propio ruteo.
 *
 * El botón de retroceso vive acá (no en cada screen) para no tocar las 41
 * pantallas una por una. Regla de confirmación: si el paso anterior en
 * `history` es LANDING, ir hacia atrás significa salir por completo de la
 * evaluación — ahí se pide confirmación. Si el paso anterior es cualquier
 * otra pantalla del wizard, es navegación normal entre preguntas y no la
 * necesita.
 */
export function SmartFormApp() {
  const currentScreen = useFormStore((s) => s.currentScreen);
  const vars = useFormStore((s) => s.vars);
  const history = useFormStore((s) => s.history);
  const navigate = useFormStore((s) => s.navigate);
  const goBack = useFormStore((s) => s.goBack);
  const sessionId = useFormStore((s) => s.sessionId);
  const utmCampaign = useFormStore((s) => s.utmCampaign);
  const [confirmingExit, setConfirmingExit] = useState(false);

  // Único punto de instrumentación del embudo de abandono: captura las 41
  // pantallas (LANDING incluida, al montar) sin tocar ninguna pantalla
  // individual ni la lógica de ruteo del store. DISP_CHECK nunca llega acá
  // (form-store.ts la resuelve internamente antes de exponer currentScreen).
  useEffect(() => {
    trackScreenReached({ sessionId, screenId: currentScreen, utmCampaign });
  }, [currentScreen, sessionId, utmCampaign]);

  const Screen = SCREEN_COMPONENTS[currentScreen];
  const previousScreen = history[history.length - 1];
  const showBackButton = currentScreen !== "LANDING" && history.length > 0;

  const handleBack = () => {
    if (previousScreen === "LANDING") {
      setConfirmingExit(true);
      return;
    }
    goBack();
  };

  return (
    <div className="relative w-full h-dvh bg-bg-primary overflow-hidden">
      {showBackButton && <BackButton onClick={handleBack} />}
      {Screen ? (
        <Screen vars={vars} onChoice={navigate} />
      ) : (
        <div className="flex flex-col h-full items-center justify-center gap-4 px-6 text-center">
          <p className="type-eyebrow">Pantalla en construcción</p>
          <p className="type-title">{currentScreen}</p>
          <pre className="type-caption text-left max-w-full overflow-auto max-h-64 bg-bg-surface p-4 rounded-xl">
            {JSON.stringify(vars, null, 2)}
          </pre>
        </div>
      )}
      {confirmingExit && (
        <ConfirmExitModal
          onConfirm={() => {
            setConfirmingExit(false);
            goBack();
          }}
          onCancel={() => setConfirmingExit(false)}
        />
      )}
    </div>
  );
}
