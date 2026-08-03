"use client";

import { useEffect, useRef, useState } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { ProgressBar } from "@/presentation/components/ProgressBar";
import { CTAButton } from "@/presentation/components/CTAButton";
import { OptionButton } from "@/presentation/components/OptionButton";
import { headerIn } from "@/presentation/animations/gsap-micro";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";
import type { Canal } from "@/core/entities/qualification-profile";

const CANAL_OPTIONS: { value: Canal; label: string }[] = [
  { value: "WHATSAPP", label: "WhatsApp (más rápido)" },
  { value: "LLAMADA", label: "Llamada telefónica" },
  { value: "WA_PRIMERO", label: "WhatsApp primero, luego llamada" },
];

// Validación simple de formato: al menos 7 dígitos.
function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, "").length >= 7;
}

// copy: mvp_arbol_decisiones_smart_form.md § E5_CONTACTO — Datos de contacto
export function E5Contacto({ onChoice }: ScreenComponentProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [canal, setCanal] = useState<Canal>("WHATSAPP");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (headerRef.current) headerIn(headerRef.current.children);
  }, []);

  const handleSubmit = () => {
    if (nombre.trim().length === 0) {
      setError("Por favor ingresa tu nombre.");
      return;
    }
    if (telefono.trim().length === 0) {
      setError("Por favor ingresa tu número de WhatsApp.");
      return;
    }
    if (!isValidPhone(telefono)) {
      setError("Por favor ingresa un número válido.");
      return;
    }
    setError(null);
    onChoice(JSON.stringify({ nombre: nombre.trim(), telefono: telefono.trim(), canal }));
  };

  return (
    <ScreenWrapper>
      <div className="pt-4 pb-2">
        <ProgressBar current={5} total={5} />
      </div>
      <div ref={headerRef} className="pt-8 pb-6 flex flex-col gap-2">
        <p className="type-eyebrow">Casi listo</p>
        <h1 className="type-title">¿A qué nombre y número te contactamos?</h1>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <div>
          <label className="type-caption block mb-1.5">Tu nombre completo *</label>
          <input
            type="text"
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
            className="w-full h-12 px-4 rounded-xl bg-bg-input border border-border-card text-text-primary type-body focus:outline-none focus:ring-2 focus:ring-border-focus"
          />
        </div>

        <div>
          <label className="type-caption block mb-1.5">WhatsApp / Teléfono *</label>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Tu número de WhatsApp"
            className="w-full h-12 px-4 rounded-xl bg-bg-input border border-border-card text-text-primary type-body focus:outline-none focus:ring-2 focus:ring-border-focus"
          />
        </div>

        <div>
          <p className="type-caption mb-2">¿Cómo prefieres que te contactemos?</p>
          <div className="flex flex-col gap-2">
            {CANAL_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={canal === opt.value}
                onClick={() => setCanal(opt.value)}
              />
            ))}
          </div>
        </div>

        {error && <p className="type-caption text-caution">{error}</p>}

        <p className="type-caption opacity-70">
          Tu información es confidencial. No la compartimos con terceros. Tu
          Número de Seguro Social NO se solicita en este formulario.
        </p>
      </div>

      <div className="pb-6">
        <CTAButton label="Crear mi perfil →" onClick={handleSubmit} />
      </div>
    </ScreenWrapper>
  );
}
