# Landing Redesign v1.0 (9 secciones + retema claro del wizard) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la landing de 6 secciones ya implementada por las 9 secciones de la spec de rediseño v1.0 ("Escuda tu Patrimonio"), aplicar el nuevo tema claro a las 41 pantallas del wizard (con anclas oscuras solo en Landing Hero, Landing Footer y las 5 pantallas WebGL S1–S5), e integrar los assets reales (2 videos, 9 logos de aseguradoras, logo MIB, logo de marca, favicon) provistos por el usuario.

**Architecture:** Todo pasa por los mismos tokens `@theme inline` de `globals.css` que ya consumen las 41 pantallas — cambiar sus valores retemea la app entera sin tocar cada pantalla individualmente. Se añade un subconjunto de tokens "ancla oscura" (`bg-trust-dark`, `text-ondark*`, etc.) para los 3 lugares que deben seguir oscuros. La landing (`LANDING` screen, ya wireada en `routing-table.ts`/`screen-registry.tsx`/`form-store.ts` — **no requiere cambios de ruteo**) se reconstruye de 6 a 9 archivos de sección. Se agrega `TestimonialCard`, un componente con modos `placeholder`/`verified`/vacío, con guardia de producción vía `NODE_ENV`.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind v4 (`@theme inline` en `globals.css`), GSAP 3, Zustand 5. Sin `next/image` (el proyecto no lo usa en ningún lado hoy — se mantiene la convención de `<img>`/`<video>` planos). Sin test runner — verificación vía `npx tsc --noEmit` + build + recorrido manual en navegador, igual que el plan anterior de este mismo proyecto.

## Global Constraints

- Cero llamadas a backend/API — sigue siendo la fase fundacional solo-frontend.
- No agregar dependencias nuevas (no `next/image`, no librerías de carrusel/marquee — usar CSS/flex-wrap).
- Los 12 assets del usuario están en `https://pub-beb16d388e93409591cbfdda046059d6.r2.dev/vid/` — se referencian por URL absoluta (hotlink), NO se descargan a `public/` (decisión explícita del usuario).
- `--gold-primary` se mantiene en `#c9a84c` (el oro del logo de marca real) — **nunca** cambiar a `#B45309` como sugería el documento original; el logo manda.
- Todo texto dorado sobre fondo claro debe usar el nuevo token `--gold-text` (`#8a6b1f`, contraste 5.0:1 sobre blanco) vía `style={{ color: "var(--gold-text)" }}` — nunca la clase `text-gold-primary` combinada con una clase `.type-*`, porque `.type-*` fija su propio `color` con CSS sin capas (`@layer`) y gana el empate de forma no confiable frente a una utilidad de Tailwind (si combinas ambas, el color dorado puede no aplicarse — usa `style` inline para cualquier acento de color sobre un elemento que también lleve una clase `.type-*`).
- Ningún texto de la landing menciona "IUL", tasas específicas, ni la frase "libre de impuestos" (regla de dosificación ya establecida en el proyecto).
- `TestimonialCard` con `mode="placeholder"` nunca se invoca desde código que se despliega — solo para pruebas manuales locales. `SocialProof.tsx` (Sección 2.8) siempre lo invoca sin `mode` (estado "Próximamente").
- Ejecutar `npx tsc --noEmit` desde `C:\dev\luismoreno\smart-form-iul` después de cada tarea; debe salir en 0 antes de continuar.
- Commit después de cada tarea (commits pequeños y enfocados, mensajes en español, **sin** trailer de co-autoría de IA).

---

### Task 1: Retema global de `globals.css` — tokens claros + anclas oscuras + correcciones de contraste

**Files:**
- Modify: `src/presentation/styles/globals.css:8-76`

**Interfaces:**
- Produces: nuevos tokens Tailwind `bg-trust-dark`, `bg-trust-elevated`, `text-ondark`, `text-ondark-secondary`, `text-ondark-muted`, `border-ondark`, `gold-text` (vía `--color-*` en `@theme inline`), consumidos por las Tareas 2, 6, 12, 13, 14. Los tokens existentes (`bg-primary`, `bg-surface`, `bg-elevated`, `text-primary`, `text-secondary`, `text-muted`, `caution`, `trust`, `success`, etc.) cambian de valor pero mantienen el mismo nombre — cero cambios requeridos en los ~40 archivos de pantalla que ya los consumen.

- [ ] **Step 1: Reemplazar el bloque `:root` y `@theme inline`**

En `src/presentation/styles/globals.css`, reemplazar las líneas 8-76 (desde `:root {` hasta el cierre de `@theme inline { ... }`) por:

```css
:root {
  /* Fondos — tema claro por defecto en las 41 pantallas del wizard + cuerpo de la landing */
  --bg-deep: #eef2f7;
  --bg-primary: #f8fafc;
  --bg-surface: #ffffff;
  --bg-elevated: #f1f5f9;
  --bg-input: #ffffff;
  --bg-overlay: rgba(15, 23, 42, 0.78);

  /* Ancla oscura — SOLO Landing Hero, Landing Footer/CTA final, y S1-S5 (WebGL). Valores idénticos al tema oscuro original: ya estaban probados. */
  --bg-trust-dark: #0b1628;
  --bg-trust-elevated: #152340;
  --text-ondark: #f0ece3;
  --text-ondark-secondary: #a8b5c8;
  --text-ondark-muted: #6b7a8d;
  --border-ondark: rgba(255, 255, 255, 0.08);

  /* Oro — SIN cambios de valor: es el oro del logo de marca real (ver BRAND_ICON_URL en constants.ts) */
  --gold-primary: #c9a84c;
  --gold-light: #e8d5a3;
  --gold-dark: #9e7d35;
  --gold-subtle: rgba(201, 168, 76, 0.15);
  --gold-border: rgba(201, 168, 76, 0.35);
  --gold-glow: rgba(201, 168, 76, 0.12);
  /* Oro usado como TEXTO sobre fondo claro (nunca como fondo): #c9a84c da 2.29:1 sobre blanco (falla WCAG AA). #8a6b1f da 5.0:1. */
  --gold-text: #8a6b1f;

  /* Recalculados para AA (4.5:1) sobre fondo claro — los valores originales solo habían corrido sobre navy oscuro */
  --success: #17824f;
  --success-bg: rgba(23, 130, 79, 0.12);
  --trust-blue: #2563a8;
  --trust-bg: rgba(37, 99, 168, 0.1);
  --caution: #8a5c0c;
  --caution-bg: rgba(138, 92, 12, 0.12);

  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --text-inverse: #0b1628;

  --border-subtle: rgba(15, 23, 42, 0.06);
  --border-card: rgba(15, 23, 42, 0.1);
  --border-focus: rgba(201, 168, 76, 0.6);

  --webgl-particle: #c9a84c;
  --webgl-line: rgba(201, 168, 76, 0.3);
  --webgl-shield: #4a9fd4;
  --webgl-success: #2db87a;
}

@theme inline {
  --color-bg-deep: var(--bg-deep);
  --color-bg-primary: var(--bg-primary);
  --color-bg-surface: var(--bg-surface);
  --color-bg-elevated: var(--bg-elevated);
  --color-bg-input: var(--bg-input);

  --color-bg-trust-dark: var(--bg-trust-dark);
  --color-bg-trust-elevated: var(--bg-trust-elevated);
  --color-text-ondark: var(--text-ondark);
  --color-text-ondark-secondary: var(--text-ondark-secondary);
  --color-text-ondark-muted: var(--text-ondark-muted);
  --color-border-ondark: var(--border-ondark);

  --color-gold-primary: var(--gold-primary);
  --color-gold-light: var(--gold-light);
  --color-gold-dark: var(--gold-dark);
  --color-gold-subtle: var(--gold-subtle);
  --color-gold-border: var(--gold-border);
  --color-gold-glow: var(--gold-glow);
  --color-gold-text: var(--gold-text);

  --color-success: var(--success);
  --color-success-bg: var(--success-bg);
  --color-trust: var(--trust-blue);
  --color-trust-bg: var(--trust-bg);
  --color-caution: var(--caution);
  --color-caution-bg: var(--caution-bg);

  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-inverse: var(--text-inverse);

  --color-border-subtle: var(--border-subtle);
  --color-border-card: var(--border-card);
  --color-border-focus: var(--border-focus);

  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
}
```

El resto del archivo (reglas `*`, `html,body`, `body`, `::-webkit-scrollbar`, `.type-*`) no cambia.

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0 (CSS no afecta TypeScript, pero confirma que no se rompió nada al editar el archivo).

- [ ] **Step 3: Commit**

```bash
git add src/presentation/styles/globals.css
git commit -m "feat(tema): retemear la app a fondo claro con anclas oscuras y corregir contraste AA"
```

---

### Task 2: Adaptar `StimScreen.tsx` (S1-S5) para que siga oscuro con los nuevos tokens de ancla

**Files:**
- Modify: `src/presentation/screens/stimulation/StimScreen.tsx`

**Interfaces:**
- Consumes: tokens `bg-trust-dark`, `bg-trust-elevated` de la Tarea 1.
- Produces: sin cambio de props/firma — `StimScreen` sigue exponiendo la misma interfaz a `S1.tsx`...`S5.tsx`.

- [ ] **Step 1: Cambiar el fondo del contenedor**

En `src/presentation/screens/stimulation/StimScreen.tsx` línea 46, cambiar:
```tsx
    <div className="relative w-full h-full bg-bg-primary overflow-hidden" onClick={handleTap}>
```
a:
```tsx
    <div className="relative w-full h-full bg-trust-dark overflow-hidden" onClick={handleTap}>
```

- [ ] **Step 2: Fijar el color del texto explícitamente (no depender del default de `.type-*`, que ahora es oscuro)**

Cambiar (líneas 62-65):
```tsx
        <p ref={actionRef} className="text-center type-label text-text-secondary mb-3 opacity-0">
          {actionText}
        </p>
        <p ref={factRef} className="text-center type-body max-w-xs opacity-0">
          {fact}
        </p>
```
a:
```tsx
        <p
          ref={actionRef}
          className="text-center type-label mb-3 opacity-0"
          style={{ color: "var(--text-ondark-secondary)" }}
        >
          {actionText}
        </p>
        <p
          ref={factRef}
          className="text-center type-body max-w-xs opacity-0"
          style={{ color: "var(--text-ondark-secondary)" }}
        >
          {fact}
        </p>
```

- [ ] **Step 3: Fijar el color de "Toca para continuar" y el fondo del track de la barra de progreso**

Cambiar (líneas 68-72):
```tsx
        <div className="w-full max-w-xs mt-8 h-0.5 bg-bg-surface rounded-full overflow-hidden">
          <div ref={barRef} className="h-full bg-gold-primary rounded-full" style={{ width: "0%" }} />
        </div>
        {tapAdvanceAfterMs !== undefined && (
          <p className="mt-4 type-caption opacity-50">Toca para continuar</p>
        )}
```
a:
```tsx
        <div className="w-full max-w-xs mt-8 h-0.5 bg-trust-elevated rounded-full overflow-hidden">
          <div ref={barRef} className="h-full bg-gold-primary rounded-full" style={{ width: "0%" }} />
        </div>
        {tapAdvanceAfterMs !== undefined && (
          <p className="mt-4 type-caption opacity-50" style={{ color: "var(--text-ondark-muted)" }}>
            Toca para continuar
          </p>
        )}
```

Estos tres cambios reproducen exactamente los colores que ya tenía la app (los valores de `--text-ondark-secondary`/`--text-ondark-muted`/`--bg-trust-elevated` son idénticos a los antiguos `--text-secondary`/`--text-muted`/`--bg-surface` del tema oscuro original), así que S1-S5 deben verse pixel-idénticos a como se ven hoy.

- [ ] **Step 4: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/screens/stimulation/StimScreen.tsx
git commit -m "fix(estimulacion): fijar colores de ancla oscura en StimScreen tras el retema claro"
```

---

### Task 3: Assets reales — `constants.ts`

**Files:**
- Modify: `src/presentation/constants.ts`

**Interfaces:**
- Produces: `BRAND_NAME` (corregido), `BRAND_LOGO_URL: string`, `BRAND_ICON_URL: string`, `MIB_LOGO_URL: string`, `AUTHORITY_VIDEOS: readonly string[]`, `InsurancePartner { name: string; logoUrl: string }`, `INSURANCE_PARTNERS: readonly InsurancePartner[]` (cambia de `readonly string[]` a `readonly InsurancePartner[]` — el único consumidor actual, `Credentials.tsx`, se elimina en la Tarea 15). Consumido por Tareas 4, 6, 7, 10, 12, 14.

- [ ] **Step 1: Reemplazar el archivo completo**

Reemplazar todo el contenido de `src/presentation/constants.ts`:

```ts
/**
 * Constantes hardcodeadas para la fase fundacional (solo frontend, sin
 * backend). AGENT_INFO usa valores placeholder claramente ficticios —
 * reemplazar con los datos reales de Luis Moreno Rangel antes de producción.
 */
// NOTA: el logo real (BRAND_ICON_URL/BRAND_LOGO_URL) dice "ESCUDA tu
// Patrimonio", no "Escudo". Se corrige aquí para calzar con el asset de
// marca — confirmar con Gustavo si el logo tiene el error tipográfico en
// vez del código.
export const BRAND_NAME = "Escuda tu Patrimonio";

export const AGENT_INFO = {
  name: "Luis Moreno Rangel",
  license: "LIC-000000", // PLACEHOLDER — reemplazar con la licencia real
  state: "FL", // PLACEHOLDER — estado principal de licencia
  phone: "+1-000-000-0000", // PLACEHOLDER
  whatsapp: "10000000000", // PLACEHOLDER (formato E.164 sin '+', para wa.me)
  photo: "/agent-placeholder.svg",
  company: "National Life Group",
} as const;

export const WHATSAPP_LINK = `https://wa.me/${AGENT_INFO.whatsapp}`;

const ASSET_BASE = "https://pub-beb16d388e93409591cbfdda046059d6.r2.dev/vid";

/** Logo completo de marca (navy + oro) — usado en el Hero de la landing. */
export const BRAND_LOGO_URL = `${ASSET_BASE}/escuda-tu-patrimonio-logo.png`;
/** Ícono cuadrado de marca — usado como favicon (ver metadata.icons en src/app/layout.tsx). */
export const BRAND_ICON_URL = `${ASSET_BASE}/icono.png`;
/** Logo del MIB (Medical Information Bureau) — usado en la Sección 2.5 (reencuadre institucional). */
export const MIB_LOGO_URL = `${ASSET_BASE}/mib-logo.png`;

/**
 * Los 2 videos explicativos de Luis (Sección 2.7 — contenido de
 * autoridad, NO son testimonios). Formato vertical, subtítulos quemados
 * en el archivo (no requieren <track> adicional).
 */
export const AUTHORITY_VIDEOS: readonly string[] = [
  `${ASSET_BASE}/vid01.mp4`,
  `${ASSET_BASE}/vid02.mp4`,
];

export interface InsurancePartner {
  name: string;
  logoUrl: string;
}

/**
 * Las 9 aseguradoras con las que se trabaja. El documento fuente
 * (mvp_arbol_decisiones_smart_form.md / copy_guion) menciona solo a
 * National Life Group — es una de las 9, no la única opción. Solo se
 * refleja en la landing (Secciones 2.2, 2.5, 2.9); el resto del wizard
 * sigue centrado en NLG (ver docs/superpowers/specs/2026-08-06-landing-page-design.md).
 */
export const INSURANCE_PARTNERS: readonly InsurancePartner[] = [
  { name: "Ethos", logoUrl: `${ASSET_BASE}/ethos.png` },
  { name: "Americo", logoUrl: `${ASSET_BASE}/americo.png` },
  { name: "Mutual of Omaha", logoUrl: `${ASSET_BASE}/mutual.png` },
  { name: "National Life Group", logoUrl: `${ASSET_BASE}/nlf.png` },
  { name: "F&G (Annuities & Life)", logoUrl: `${ASSET_BASE}/FyG.png` },
  { name: "Corebridge Financial", logoUrl: `${ASSET_BASE}/corebridge.png` },
  { name: "Transamerica", logoUrl: `${ASSET_BASE}/transamerica.png` },
  { name: "Foresters Financial", logoUrl: `${ASSET_BASE}/forsterst.png` },
  { name: "Assure for Life", logoUrl: `${ASSET_BASE}/assure.png` },
];
```

- [ ] **Step 2: Run `tsc` — se espera que FALLE (esperado, Credentials.tsx aún consume la forma vieja)**

Run: `npx tsc --noEmit`
Expected: FAIL — error en `src/presentation/screens/landing/Credentials.tsx` porque `INSURANCE_PARTNERS.map((name) => ...)` ahora recibe un `InsurancePartner`, no un `string`. Esto es esperado: `Credentials.tsx` se elimina en la Tarea 15. No corregir aquí.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/constants.ts
git commit -m "feat(assets): agregar constantes de videos, logos de aseguradoras y marca (9 aseguradoras)"
```

---

### Task 4: Favicon + logo de marca en metadata

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `BRAND_ICON_URL` de la Tarea 3.

- [ ] **Step 1: Agregar `icons` a los metadatos**

En `src/app/layout.tsx`, cambiar:
```tsx
import type { Metadata, Viewport } from "next";
import "@/presentation/styles/globals.css";
import { BRAND_NAME } from "@/presentation/constants";
import { MetaPixelSlot } from "@/presentation/components/MetaPixelSlot";

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: "Evaluación de programas de ahorro y protección",
};
```
a:
```tsx
import type { Metadata, Viewport } from "next";
import "@/presentation/styles/globals.css";
import { BRAND_NAME, BRAND_ICON_URL } from "@/presentation/constants";
import { MetaPixelSlot } from "@/presentation/components/MetaPixelSlot";

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: "Evaluación de programas de ahorro y protección",
  icons: {
    icon: BRAND_ICON_URL,
  },
};
```

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: sigue fallando SOLO por `Credentials.tsx` (mismo error de la Tarea 3, aún no corregido). Ningún error nuevo debe aparecer en `layout.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(favicon): usar el ícono de marca real como favicon vía metadata.icons"
```

---

### Task 5: `TestimonialCard` — componente con modos `placeholder`/`verified`/vacío

**Files:**
- Create: `src/presentation/components/TestimonialCard.tsx`

**Interfaces:**
- Produces: `TestimonialCard(props: TestimonialCardProps)`, donde `TestimonialCardProps` es una unión discriminada por `mode` (`undefined` | `"placeholder"` | `"verified"`). Consumido por `SocialProof.tsx` en la Tarea 13.

- [ ] **Step 1: Crear el componente**

Crear `src/presentation/components/TestimonialCard.tsx`:

```tsx
interface TestimonialCardEmptyProps {
  mode?: undefined;
}

interface TestimonialCardPlaceholderProps {
  /** SOLO para pruebas manuales en local. Nunca invocar con este mode desde un archivo que se despliega — ver el guard de NODE_ENV más abajo. */
  mode: "placeholder";
  quote: string;
}

interface TestimonialCardVerifiedWrittenProps {
  mode: "verified";
  quote: string;
  authorName: string;
  authorPhoto: string;
  authorLocation?: string;
  source: "written";
}

interface TestimonialCardVerifiedLinkedProps {
  mode: "verified";
  quote: string;
  authorName: string;
  authorPhoto: string;
  authorLocation?: string;
  source: "google_review" | "trustpilot" | "video";
  /** Enlace verificable a la reseña/video real — obligatorio cuando la fuente no es texto propio. */
  sourceUrl: string;
}

export type TestimonialCardProps =
  | TestimonialCardEmptyProps
  | TestimonialCardPlaceholderProps
  | TestimonialCardVerifiedWrittenProps
  | TestimonialCardVerifiedLinkedProps;

const SOURCE_LABEL: Record<string, string> = {
  written: "Reseña escrita",
  google_review: "Reseña de Google",
  trustpilot: "Reseña de Trustpilot",
  video: "Video testimonio",
};

/**
 * Tarjeta de testimonio con tres estados:
 * - sin `mode`: estado "Próximamente" — el único seguro para producción
 *   mientras no existan testimonios reales.
 * - `mode="placeholder"`: contenido ilustrativo genérico sin nombre/foto
 *   real, SOLO para previsualización manual en desarrollo. Lanza un error
 *   visible si se renderiza con NODE_ENV=production, para que nunca llegue
 *   a un usuario real por accidente (NAIC MDL-570 / FTC Endorsement
 *   Guides: un testimonio publicitado debe ser de una persona real e
 *   identificable).
 * - `mode="verified"`: testimonio real, requiere autor, foto y fuente
 *   verificable.
 */
export function TestimonialCard(props: TestimonialCardProps) {
  if (props.mode === "placeholder" && process.env.NODE_ENV === "production") {
    throw new Error(
      'TestimonialCard: mode="placeholder" no puede renderizarse en producción (es contenido ilustrativo ficticio, no un testimonio real). Usa mode="verified" con datos reales y consentimiento documentado, o quita la prop `mode` para mostrar el estado "Próximamente".'
    );
  }

  if (!props.mode) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border border-dashed border-border-card bg-bg-surface text-center min-h-[180px]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <path d="M7 8h10M7 12h6M4 4h16v12H9l-5 4V4z" />
        </svg>
        <p className="type-caption">Próximamente</p>
      </div>
    );
  }

  if (props.mode === "placeholder") {
    return (
      <div className="relative p-5 rounded-2xl border border-border-card bg-bg-surface overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--text-primary) 0, var(--text-primary) 1px, transparent 1px, transparent 12px)",
          }}
        />
        <span className="relative inline-block mb-3 px-2 py-0.5 rounded-full bg-caution-bg type-caption font-semibold" style={{ color: "var(--caution)" }}>
          Ejemplo ilustrativo — no publicar
        </span>
        <p className="relative type-body italic">&ldquo;{props.quote}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-border-card bg-bg-surface">
      <p className="type-body italic mb-4">&ldquo;{props.quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.authorPhoto}
          alt={props.authorName}
          className="w-11 h-11 rounded-full object-cover border border-border-card"
          loading="lazy"
        />
        <div className="min-w-0">
          <p className="type-label leading-tight">{props.authorName}</p>
          <p className="type-caption">
            {props.authorLocation ? `${props.authorLocation} · ` : ""}
            {SOURCE_LABEL[props.source]}
          </p>
        </div>
      </div>
      {"sourceUrl" in props && (
        <a
          href={props.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="type-caption mt-3 inline-block"
          style={{ color: "var(--trust-blue)" }}
        >
          Ver reseña original →
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: sigue fallando SOLO por `Credentials.tsx` (Tarea 3). Ningún error nuevo en `TestimonialCard.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/components/TestimonialCard.tsx
git commit -m "feat(landing): agregar TestimonialCard con guardia de produccion para mode=placeholder"
```

---

### Task 6: Sección 2.1 — reescribir `Hero.tsx`

**Files:**
- Modify: `src/presentation/screens/landing/Hero.tsx`

**Interfaces:**
- Consumes: `BRAND_LOGO_URL` (Tarea 3), `CTAButton` (existente), tokens de ancla oscura (Tarea 1).
- Produces: `Hero({ onContinue }: { onContinue: () => void })` — cambia de firma (antes no tenía props). Consumido por `LandingScreen.tsx` en la Tarea 15.

- [ ] **Step 1: Reemplazar el archivo completo**

Reemplazar `src/presentation/screens/landing/Hero.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { CTAButton } from "@/presentation/components/CTAButton";
import { BRAND_LOGO_URL } from "@/presentation/constants";

interface HeroProps {
  onContinue: () => void;
}

// copy: spec de rediseño v1.0 § 2.1 Hero
export function Hero({ onContinue }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) headerIn(ref.current.children);
  }, []);

  return (
    <div ref={ref} className="min-h-dvh flex flex-col justify-center px-6 gap-4 bg-trust-dark">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BRAND_LOGO_URL} alt="Escuda tu Patrimonio" className="h-14 w-auto mb-2" />
      <p className="type-eyebrow" style={{ color: "var(--gold-light)" }}>
        Evaluación gratuita · 4 minutos
      </p>
      <h1 className="type-title" style={{ color: "var(--text-ondark)" }}>
        ¿Calificas para el programa de ahorro y protección?
      </h1>
      <p className="type-subtitle" style={{ color: "var(--text-ondark-secondary)" }}>
        Descubre en menos de 4 minutos si tu perfil cumple los requisitos de
        este programa respaldado por aseguradoras líderes.
      </p>
      <div className="mt-2">
        <CTAButton label="Verificar mi elegibilidad ahora →" onClick={onContinue} />
      </div>
      <p className="type-caption text-center" style={{ color: "var(--text-ondark-muted)" }}>
        Evaluación gratuita y sin compromiso
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Run `tsc` — se espera un error nuevo, esperado**

Run: `npx tsc --noEmit`
Expected: FAIL con un error nuevo en `LandingScreen.tsx` (`<Hero />` sin la prop `onContinue` requerida) además del error preexistente de `Credentials.tsx`. Ambos se resuelven en la Tarea 15 — no corregir aún.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/landing/Hero.tsx
git commit -m "feat(landing): reescribir Hero con eyebrow, CTA y logo de marca (seccion 2.1)"
```

---

### Task 7: Sección 2.2 — crear `AuthorityBar.tsx`

**Files:**
- Create: `src/presentation/screens/landing/AuthorityBar.tsx`

**Interfaces:**
- Consumes: `INSURANCE_PARTNERS` (Tarea 3).
- Produces: `AuthorityBar()` — sin props. Consumido en la Tarea 15.

- [ ] **Step 1: Crear el archivo**

Crear `src/presentation/screens/landing/AuthorityBar.tsx`:

```tsx
import { INSURANCE_PARTNERS } from "@/presentation/constants";

// copy: spec de rediseño v1.0 § 2.2 Barra de autoridad
export function AuthorityBar() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-body text-center">
        Respaldado por aseguradoras con más de 100 años de solidez en el mercado
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        {INSURANCE_PARTNERS.map((partner) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={partner.name}
            src={partner.logoUrl}
            alt={partner.name}
            className="h-8 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-[filter,opacity] duration-300"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
```

Nota de diseño: se usa `flex-wrap` en vez de un marquee/scroll horizontal — un scroll horizontal en contenido principal es un anti-patrón de UX móvil (fricción de gesto, conflicto con el scroll vertical de `LandingWrapper`); envolver en varias filas es igual de legible y no requiere JS.

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: mismos 2 errores preexistentes (Tareas 3 y 6), ninguno nuevo en este archivo.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/landing/AuthorityBar.tsx
git commit -m "feat(landing): agregar seccion 2.2 barra de autoridad con logos de aseguradoras"
```

---

### Task 8: Sección 2.3 — reescribir copy de `Problem.tsx`

**Files:**
- Modify: `src/presentation/screens/landing/Problem.tsx`

**Interfaces:** sin cambios de firma — `Problem()` sigue sin props.

- [ ] **Step 1: Reemplazar el array `DOLORES`**

Reemplazar todo el contenido de `src/presentation/screens/landing/Problem.tsx`:

```tsx
// copy: spec de rediseño v1.0 § 2.3 Agitación del problema
const DOLORES = [
  "¿Qué pasaría con tu familia si tú faltaras mañana?",
  "Los planes de ahorro tradicionales dependen por completo del comportamiento del mercado.",
  "Un diagnóstico médico grave llega sin aviso — y sin un respaldo claro, la carga recae en tu familia.",
];

export function Problem() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Lo que nadie quiere enfrentar</p>
      {DOLORES.map((text) => (
        <div key={text} className="p-5 rounded-2xl bg-bg-surface border border-border-card">
          <p className="type-body">{text}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: mismos 2 errores preexistentes, ninguno nuevo.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/landing/Problem.tsx
git commit -m "content(landing): actualizar copy de la seccion 2.3 (agitacion del problema)"
```

---

### Task 9: Sección 2.4 — `Solution.tsx` con bento asimétrico en desktop

**Files:**
- Modify: `src/presentation/screens/landing/Solution.tsx`

**Interfaces:** sin cambios de firma — `Solution()` sigue sin props. Copy sin cambios (ya era correcto).

- [ ] **Step 1: Reemplazar el contenedor de las tarjetas**

Reemplazar todo el contenido de `src/presentation/screens/landing/Solution.tsx`:

```tsx
// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 3. La solución (teaser)
const PILARES = [
  {
    title: "Ahorro",
    text: "Tu dinero crece con el tiempo, conectado a los mercados, sin exponerte a sus pérdidas.",
  },
  {
    title: "Protección",
    text: "Si algún día faltas, tu familia recibe un respaldo económico en cuestión de días, no de meses.",
  },
  {
    title: "Beneficios en vida",
    text: "Si sufres una enfermedad grave, puedes acceder a gran parte de tu cobertura mientras sigues con vida.",
  },
];

export function Solution() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Cómo te protege este programa</p>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-6">
        {PILARES.map((p, i) => (
          <div
            key={p.title}
            className={`p-5 rounded-2xl bg-bg-elevated border border-border-card ${
              i === 0 ? "lg:col-span-2 lg:row-span-2 lg:p-8" : ""
            }`}
          >
            <p className="type-label mb-1">{p.title}</p>
            <p className="type-body">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

En móvil (`<lg`) es una columna simple, idéntica a la versión actual. Desde `lg:` se activa un grid de 3 columnas donde "Ahorro" ocupa 2 columnas × 2 filas (bento asimétrico), tal como pide la Sección 2.4 del spec.

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: mismos 2 errores preexistentes, ninguno nuevo.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/landing/Solution.tsx
git commit -m "feat(landing): bento asimetrico en desktop para la seccion 2.4"
```

---

### Task 10: Sección 2.5 — crear `InstitutionalReframe.tsx`

**Files:**
- Create: `src/presentation/screens/landing/InstitutionalReframe.tsx`

**Interfaces:**
- Consumes: `MIB_LOGO_URL` (Tarea 3).
- Produces: `InstitutionalReframe()` — sin props. Consumido en la Tarea 15.

- [ ] **Step 1: Crear el archivo**

Crear `src/presentation/screens/landing/InstitutionalReframe.tsx`:

```tsx
import { MIB_LOGO_URL } from "@/presentation/constants";

/**
 * Sección 2.5 — Reencuadre institucional. Copy ORIGINAL (no viene verbatim
 * de ningún documento fuente, a diferencia del resto de secciones) —
 * refuerza el mecanismo de rol invertido: el prospecto aplica, el MIB y la
 * aseguradora deciden, Luis acompaña. Revisar con Gustavo antes de
 * publicar.
 */
export function InstitutionalReframe() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="type-eyebrow">Cómo se evalúa tu perfil</p>
      <h2 className="type-title">Tú aplicas. Ellos deciden.</h2>
      <p className="type-body max-w-md">
        Ni Luis ni esta plataforma deciden si calificas. El MIB (Buró
        Médico) verifica tu información como parte del proceso federal de
        aprobación, y la aseguradora que mejor se adapte a tu caso evalúa tu
        perfil. Luis te acompaña durante todo el proceso, pero la decisión
        no depende de él.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MIB_LOGO_URL} alt="MIB — Medical Information Bureau" className="h-10 w-auto mt-2" loading="lazy" />
    </div>
  );
}
```

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: mismos 2 errores preexistentes, ninguno nuevo.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/landing/InstitutionalReframe.tsx
git commit -m "feat(landing): agregar seccion 2.5 reencuadre institucional (MIB)"
```

---

### Task 11: Sección 2.6 — `Process.tsx` con stepper vertical y conector

**Files:**
- Modify: `src/presentation/screens/landing/Process.tsx`

**Interfaces:** sin cambios de firma — `Process()` sigue sin props. Copy sin cambios (ya era correcto).

- [ ] **Step 1: Reemplazar el archivo completo**

Reemplazar todo el contenido de `src/presentation/screens/landing/Process.tsx`:

```tsx
// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 4. El proceso
const PASOS = [
  "Completas una breve evaluación (4 minutos)",
  "Un Agente Certificado revisa tu perfil",
  "El MIB (Buró Médico) verifica tu información según el proceso federal de aprobación",
  "De acuerdo a tu perfil, se te asigna la aseguradora que mejor se adapte a tu caso.",
];

export function Process() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Así funciona el proceso</p>
      <ol className="flex flex-col">
        {PASOS.map((text, i) => (
          <li key={text} className="relative flex gap-4 pb-6 last:pb-0">
            {i < PASOS.length - 1 && (
              <span className="absolute left-4 top-9 bottom-0 w-px bg-border-card" aria-hidden="true" />
            )}
            <span
              className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-gold-subtle border border-gold-border flex items-center justify-center type-label"
              style={{ color: "var(--gold-text)" }}
            >
              {i + 1}
            </span>
            <p className="type-body pt-1">{text}</p>
          </li>
        ))}
      </ol>
      <div className="p-5 rounded-2xl bg-trust-bg border border-border-card">
        <p className="type-caption" style={{ color: "var(--trust-blue)" }}>
          Como parte del proceso federal de aprobación, el MIB requiere
          verificación de identidad. Tu Agente Certificado te explicará
          exactamente cómo funciona este paso durante la llamada.
        </p>
      </div>
    </div>
  );
}
```

Reutiliza el mismo lenguaje visual que ya existía (círculo numerado + tarjeta), solo agrega la línea conectora vertical (`absolute ... bg-border-card`) entre cada número — el "stepper vertical" que pide la Sección 2.6, sin crear un componente nuevo.

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: mismos 2 errores preexistentes, ninguno nuevo.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/landing/Process.tsx
git commit -m "feat(landing): agregar conector vertical al stepper de la seccion 2.6"
```

---

### Task 12: Sección 2.7 — crear `AuthorityVideos.tsx`

**Files:**
- Create: `src/presentation/screens/landing/AuthorityVideos.tsx`

**Interfaces:**
- Consumes: `AUTHORITY_VIDEOS` (Tarea 3), tokens de ancla oscura (Tarea 1).
- Produces: `AuthorityVideos()` — sin props. Consumido en la Tarea 15 (envuelto en `<LandingSection className="bg-trust-dark">`).

- [ ] **Step 1: Crear el archivo**

Crear `src/presentation/screens/landing/AuthorityVideos.tsx`:

```tsx
import { AUTHORITY_VIDEOS } from "@/presentation/constants";

// copy: spec de rediseño v1.0 § 2.7 Contenido de autoridad — videos de Luis
// (NO son testimonios). Formato vertical, autoplay muted con controles,
// subtítulos quemados en el propio archivo de video.
export function AuthorityVideos() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow" style={{ color: "var(--text-ondark-muted)" }}>
        Conoce a tu Agente Certificado
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AUTHORITY_VIDEOS.map((src) => (
          <video
            key={src}
            src={src}
            className="w-full aspect-[9/16] rounded-2xl object-cover bg-trust-elevated"
            controls
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: mismos 2 errores preexistentes, ninguno nuevo.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/landing/AuthorityVideos.tsx
git commit -m "feat(landing): agregar seccion 2.7 con los videos reales de Luis"
```

---

### Task 13: Sección 2.8 — crear `SocialProof.tsx`

**Files:**
- Create: `src/presentation/screens/landing/SocialProof.tsx`

**Interfaces:**
- Consumes: `TestimonialCard` (Tarea 5).
- Produces: `SocialProof()` — sin props. Consumido en la Tarea 15.

- [ ] **Step 1: Crear el archivo**

Crear `src/presentation/screens/landing/SocialProof.tsx`:

```tsx
import { TestimonialCard } from "@/presentation/components/TestimonialCard";

/**
 * Sección 2.8 — Prueba social. Los 3 slots se renderizan SIN prop `mode`
 * (estado "Próximamente"): no existen testimonios reales todavía. Nunca
 * pasar mode="placeholder" aquí — ver el guard de NODE_ENV en
 * TestimonialCard.tsx.
 */
export function SocialProof() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Personas que ya pasaron por este proceso</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TestimonialCard />
        <TestimonialCard />
        <TestimonialCard />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: mismos 2 errores preexistentes, ninguno nuevo.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/landing/SocialProof.tsx
git commit -m "feat(landing): agregar seccion 2.8 prueba social (estado proximamente)"
```

---

### Task 14: Sección 2.9 — crear `FinalCTA.tsx`

**Files:**
- Create: `src/presentation/screens/landing/FinalCTA.tsx`

**Interfaces:**
- Consumes: `AgentCard`, `CTAButton` (existentes), `AGENT_INFO`, `INSURANCE_PARTNERS` (Tarea 3), tokens de ancla oscura (Tarea 1).
- Produces: `FinalCTA({ onContinue }: { onContinue: () => void })`. Consumido en la Tarea 15.

- [ ] **Step 1: Crear el archivo**

Crear `src/presentation/screens/landing/FinalCTA.tsx`:

```tsx
import { AgentCard } from "@/presentation/components/AgentCard";
import { CTAButton } from "@/presentation/components/CTAButton";
import { AGENT_INFO, INSURANCE_PARTNERS } from "@/presentation/constants";

interface FinalCTAProps {
  onContinue: () => void;
}

// copy: spec de rediseño v1.0 § 2.9 CTA final + footer de confianza
export function FinalCTA({ onContinue }: FinalCTAProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <AgentCard size="large" />
      <div className="w-full">
        <p className="type-eyebrow mb-3" style={{ color: "var(--text-ondark-muted)" }}>
          Respaldado por aseguradoras líderes
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {INSURANCE_PARTNERS.map((partner) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={partner.name} src={partner.logoUrl} alt={partner.name} className="h-7 w-auto" loading="lazy" />
          ))}
        </div>
      </div>
      <CTAButton label="Verificar mi elegibilidad ahora →" onClick={onContinue} />
      <p className="type-caption" style={{ color: "var(--text-ondark-muted)" }}>
        Evaluación gratuita y sin compromiso
      </p>
      <a
        href="https://nipr.com"
        target="_blank"
        rel="noopener noreferrer"
        className="type-caption"
        style={{ color: "var(--trust-blue)" }}
      >
        Verificar licencia {AGENT_INFO.license} en nipr.com →
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: mismos 2 errores preexistentes, ninguno nuevo.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/landing/FinalCTA.tsx
git commit -m "feat(landing): agregar seccion 2.9 CTA final y footer de confianza"
```

---

### Task 15: Ensamblar `LandingScreen.tsx` con las 9 secciones y eliminar archivos obsoletos

**Files:**
- Modify: `src/presentation/screens/landing/LandingScreen.tsx`
- Delete: `src/presentation/screens/landing/Testimonials.tsx`
- Delete: `src/presentation/screens/landing/Credentials.tsx`
- Delete: `src/presentation/components/VideoPlaceholder.tsx`

**Interfaces:**
- Consumes: `Hero` (Tarea 6), `AuthorityBar` (Tarea 7), `Problem` (Tarea 8), `Solution` (Tarea 9), `InstitutionalReframe` (Tarea 10), `Process` (Tarea 11), `AuthorityVideos` (Tarea 12), `SocialProof` (Tarea 13), `FinalCTA` (Tarea 14), `LandingWrapper`/`LandingSection` (existentes, sin cambios).
- Produces: `LandingScreen({ onChoice })` — misma firma que antes (`ScreenComponentProps`), registrado como `SCREEN_COMPONENTS.LANDING` (sin cambios en `screen-registry.tsx`, ya apunta a este archivo).

- [ ] **Step 1: Reemplazar `LandingScreen.tsx`**

Reemplazar todo el contenido de `src/presentation/screens/landing/LandingScreen.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useFormStore } from "@/presentation/state/form-store";
import { LandingWrapper } from "@/presentation/screens/landing/LandingWrapper";
import { LandingSection } from "@/presentation/screens/landing/LandingSection";
import { Hero } from "@/presentation/screens/landing/Hero";
import { AuthorityBar } from "@/presentation/screens/landing/AuthorityBar";
import { Problem } from "@/presentation/screens/landing/Problem";
import { Solution } from "@/presentation/screens/landing/Solution";
import { InstitutionalReframe } from "@/presentation/screens/landing/InstitutionalReframe";
import { Process } from "@/presentation/screens/landing/Process";
import { AuthorityVideos } from "@/presentation/screens/landing/AuthorityVideos";
import { SocialProof } from "@/presentation/screens/landing/SocialProof";
import { FinalCTA } from "@/presentation/screens/landing/FinalCTA";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: spec de rediseño v1.0 "Escuda tu Patrimonio" — 9 secciones (§2.1-2.9)
export function LandingScreen({ onChoice }: ScreenComponentProps) {
  const setUtmCampaign = useFormStore((s) => s.setUtmCampaign);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmCampaign(params.get("utm_campaign"));
  }, [setUtmCampaign]);

  const handleContinue = () => onChoice("CONTINUE");

  return (
    <LandingWrapper>
      <Hero onContinue={handleContinue} />
      <LandingSection>
        <AuthorityBar />
      </LandingSection>
      <LandingSection className="bg-bg-elevated">
        <Problem />
      </LandingSection>
      <LandingSection>
        <Solution />
      </LandingSection>
      <LandingSection className="bg-bg-elevated">
        <InstitutionalReframe />
      </LandingSection>
      <LandingSection>
        <Process />
      </LandingSection>
      <LandingSection className="bg-trust-dark">
        <AuthorityVideos />
      </LandingSection>
      <LandingSection className="bg-bg-elevated">
        <SocialProof />
      </LandingSection>
      <LandingSection className="bg-trust-dark">
        <FinalCTA onContinue={handleContinue} />
      </LandingSection>
    </LandingWrapper>
  );
}
```

- [ ] **Step 2: Eliminar los 3 archivos obsoletos**

`Testimonials.tsx` y `Credentials.tsx` quedan reemplazados por `AuthorityVideos`/`SocialProof` e `InstitutionalReframe`/`FinalCTA` respectivamente. `VideoPlaceholder.tsx` queda sin ningún consumidor tras eliminar `Testimonials.tsx` (el estado "Próximamente" ahora vive dentro de `TestimonialCard.tsx`, con su propia forma visual — no un video 16:9).

```bash
git rm src/presentation/screens/landing/Testimonials.tsx
git rm src/presentation/screens/landing/Credentials.tsx
git rm src/presentation/components/VideoPlaceholder.tsx
```

- [ ] **Step 3: Run `tsc` — ahora debe pasar limpio**

Run: `npx tsc --noEmit`
Expected: exits 0. Todos los errores acumulados desde la Tarea 3 (forma de `INSURANCE_PARTNERS`, prop `onContinue` de `Hero`) quedan resueltos porque sus únicos consumidores viejos (`Credentials.tsx`) ya no existen y el nuevo `LandingScreen.tsx` pasa `onContinue` correctamente.

- [ ] **Step 4: Commit**

```bash
git add src/presentation/screens/landing/LandingScreen.tsx
git commit -m "feat(landing): ensamblar las 9 secciones del rediseno v1.0 y eliminar archivos obsoletos"
```

---

### Task 16: Verificación final — build, contraste y recorrido manual

**Files:** ninguno (solo verificación).

- [ ] **Step 1: `tsc` y build de producción**

Run (desde `C:\dev\luismoreno\smart-form-iul`):
```bash
npx tsc --noEmit
```
Expected: exits 0.

```bash
npm run build
```
Expected: build exitoso, sin errores de rutas. (Si hay un `next dev` corriendo en paralelo, deténlo antes de borrar `.next`; si no hay dev server activo no hace falta borrar nada, `next build` regenera su propia caché de producción sin tocar la de dev).

- [ ] **Step 2: Recorrido manual — tema claro en el wizard**

Levantar `npm run dev`, abrir la app en el navegador, `sessionStorage.clear(); location.reload();`.

1. Confirmar que la landing carga con Hero oscuro (`bg-trust-dark`) y el resto de las 8 secciones en tonos claros, alternando `bg-primary`/`bg-elevated`.
2. Hacer scroll por las 9 secciones; confirmar que cada una aparece con el fade-up de `LandingSection` (excepto Hero, que anima al montar) y que ninguna imagen/video rota el layout.
3. Confirmar que los 9 logos de aseguradoras cargan (Sección 2.2 y 2.9) y el logo MIB (Sección 2.5) — revisar la pestaña de Red por 404s del bucket R2.
4. Confirmar que los 2 videos de la Sección 2.7 reproducen en loop, mudos, con controles visibles, formato vertical (9:16).
5. Tocar el CTA del Hero ("Verificar mi elegibilidad ahora →"); confirmar que navega a `E1_ENTRY` y que esa pantalla (y las siguientes: `Q_INT`, `Q_EDAD`, etc.) se ven con fondo claro y texto legible — spot-check de al menos 5 pantallas distintas de ramas distintas (ej. `Q_INT`, `Q_EDAD`, `Q_SALUD`, `PRE_FAQ`, `E5_CONTACTO`).
6. Confirmar que `goBack()` desde `E1_ENTRY` regresa a `LANDING` sin romper el historial (mismo comportamiento que ya estaba verificado antes de este cambio).

- [ ] **Step 3: Recorrido manual — anclas oscuras (S1-S5)**

Avanzar el flujo hasta `S1` (pantalla de estimulación con WebGL). Confirmar que sigue oscura (`bg-trust-dark`), que las partículas doradas del canvas siguen siendo visibles, y que el texto de `actionText`/`fact`/"Toca para continuar" es legible (color claro sobre fondo oscuro, no oscuro-sobre-oscuro). Repetir el spot-check en `S2A` o `S5` si es rápido.

- [ ] **Step 4: Verificar la guardia de producción de `TestimonialCard`**

Confirmar que `src/presentation/screens/landing/SocialProof.tsx` no contiene ningún `mode="placeholder"` (`grep -n "mode=" src/presentation/screens/landing/SocialProof.tsx` no debe devolver nada) — así, aunque el guard de `NODE_ENV==="production"` nunca se dispara en este build, la landing real nunca corre el riesgo de mostrar contenido ilustrativo ficticio.

- [ ] **Step 5: Confirmar que `MetaPixelSlot` sigue inerte**

Con la pestaña de Red abierta, confirmar que no hay ningún request a Meta/Facebook — solo los requests esperados a Next.js dev assets y al bucket R2 por las imágenes/videos.

- [ ] **Step 6: Favicon**

Confirmar visualmente que la pestaña del navegador muestra el ícono de marca (`icono.png`) en vez del favicon por defecto de Next.js.

- [ ] **Step 7: Commit final (solo si el paso 1-6 requirió algún ajuste)**

Si algún paso anterior requirió una corrección, commitear ahora con un mensaje descriptivo. Si todo pasó limpio desde el commit de la Tarea 15, este paso es un no-op — no crear un commit vacío.

---

## Notas para quien ejecute este plan

- Las Tareas 3-14 dejan el proyecto en un estado con `tsc` roto A PROPÓSITO (dos errores acumulados y conocidos: la forma de `INSURANCE_PARTNERS` y la prop `onContinue` de `Hero`) hasta la Tarea 15, que es la que reemplaza a los únicos consumidores viejos. Esto es intencional para poder commitear cada sección de forma incremental sin bloquear en un `tsc` verde en cada paso intermedio — está explícitamente marcado en cada tarea afectada ("se espera que FALLE"). No "arreglar" `Credentials.tsx`/`Testimonials.tsx` a mitad de camino: se eliminan enteros en la Tarea 15.
- `InstitutionalReframe.tsx` (Sección 2.5) tiene copy original, no verbatim de ningún documento fuente — a diferencia de Hero/Problem/Solution/Process, que sí son verbatim de la spec de rediseño v1.0 o del spec original del 2026-08-06. Points marcados explícitamente para revisión de Gustavo antes de publicar.
- `BRAND_NAME` cambia de `"Escudo tu Patrimonio"` a `"Escuda tu Patrimonio"` para calzar con el logo real. Si esto es un error tipográfico del lado del logo (no del código), avisar antes de fusionar la Tarea 3 — de lo contrario el título de la pestaña del navegador y todo el copy interno del wizard que usa `BRAND_NAME` van a decir "Escuda" en vez de "Escudo".
