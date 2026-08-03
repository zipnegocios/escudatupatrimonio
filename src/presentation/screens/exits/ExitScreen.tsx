"use client";

import { useEffect, useRef, useState } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { CTAButton } from "@/presentation/components/CTAButton";
import { headerIn } from "@/presentation/animations/gsap-micro";

interface ExitScreenProps {
  title: string;
  body: string;
}

/**
 * Base compartida por D_JOVEN, D_MAYOR, D_ESTATUS. Son pantallas terminales
 * en esta fase (sin backend): tras el CTA "Entendido", muestran el mensaje
 * de seguimiento localmente — no navegan a ninguna otra pantalla.
 */
export function ExitScreen({ title, body }: ExitScreenProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, [acknowledged]);

  return (
    <ScreenWrapper>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-4">
        {acknowledged ? (
          <>
            <h1 className="type-title">Listo</h1>
            <p className="type-body">
              Hemos registrado tu información. Nos pondremos en contacto
              contigo si tu situación cambia.
            </p>
          </>
        ) : (
          <>
            <h1 className="type-title">{title}</h1>
            <p className="type-body">{body}</p>
          </>
        )}
      </div>
      {!acknowledged && (
        <div className="pb-6">
          <CTAButton label="Entendido →" onClick={() => setAcknowledged(true)} />
        </div>
      )}
    </ScreenWrapper>
  );
}
