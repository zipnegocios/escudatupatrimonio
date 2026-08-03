"use client";

import { useFormStore } from "@/presentation/state/form-store";
import { SCREEN_COMPONENTS } from "@/presentation/screens/screen-registry";

/**
 * Shell del wizard: una sola ruta cliente que renderiza los 41 screens según
 * el estado en memoria del store. onChoice es la única forma en que una
 * pantalla puede pedir avanzar — SmartFormApp conecta eso a
 * store.navigate(choiceId), que a su vez llama a getNextScreen. Ninguna
 * pantalla decide su propio ruteo.
 */
export function SmartFormApp() {
  const currentScreen = useFormStore((s) => s.currentScreen);
  const vars = useFormStore((s) => s.vars);
  const navigate = useFormStore((s) => s.navigate);

  const Screen = SCREEN_COMPONENTS[currentScreen];

  return (
    <div className="relative w-full h-dvh bg-bg-primary overflow-hidden">
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
    </div>
  );
}
