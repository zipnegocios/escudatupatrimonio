# Landing Page (`LANDING` screen) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 6-section marketing landing as a new `LANDING` screen that precedes `E1_ENTRY` in the existing wizard state machine, with UTM-based visual pre-selection on `Q_INT` and a multi-carrier (8 insurers) credentials section.

**Architecture:** `LANDING` becomes a new `ScreenId`, wired through `routing-table.ts` and `screen-registry.tsx` exactly like the other 41 screens, but rendered inside its own scrollable `LandingWrapper` (not the single-view `ScreenWrapper` every other screen uses) because it has 6 stacked sections taller than one viewport. A new store field `utmCampaign` (outside `QualificationProfile`, since it's marketing metadata, not one of the 22 accumulated variables) captures `?utm_campaign=` at landing mount and drives a purely visual "Sugerido para ti" badge on `Q_INT`.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind v4 (`@theme inline` tokens in `src/presentation/styles/globals.css`), GSAP 3, Zustand 5 (`persist` middleware, `sessionStorage`). No test runner is configured in this repo — verification is `npx tsc --noEmit` plus manual click-through in the browser preview (dev server already configured at `.claude/launch.json` → port 3020, use `preview_start` with name `smart-form-iul`).

## Global Constraints

- Zero backend/API calls — this is still the frontend-only foundational phase (see `docs/superpowers/specs/2026-08-06-landing-page-design.md`).
- Meta Pixel, retargeting, and UTM-to-backend are explicitly out of scope; only an inert placeholder component is added for Meta Pixel.
- No WebGL on the landing (explicitly excluded by the source spec).
- Copy is verbatim from `docs/superpowers/specs/2026-08-06-landing-page-design.md` § "Contenido por sección" — do not paraphrase.
- Every screen component keeps the existing contract: `{ vars: QualificationProfile; onChoice: (choiceId: string) => void }` from `src/presentation/screens/screen-registry.tsx`. Only `Q_INT` and `LANDING` may additionally read `useFormStore` directly (documented exception for marketing metadata that isn't part of `vars`).
- All new Tailwind color usage must use existing tokens confirmed in `globals.css`'s `@theme inline` block: `bg-deep`, `bg-primary`, `bg-surface`, `bg-elevated`, `bg-input`, `gold-primary`, `gold-light`, `gold-dark`, `gold-subtle`, `gold-border`, `gold-glow`, `success`, `success-bg`, `trust`, `trust-bg`, `caution`, `caution-bg`, `text-primary`, `text-secondary`, `text-muted`, `text-inverse`, `border-subtle`, `border-card`, `border-focus`. For the one CSS var without a registered Tailwind token (`--bg-overlay`), use the arbitrary-value syntax `bg-[var(--bg-overlay)]`.
- Run `npx tsc --noEmit` from `C:\dev\luismoreno\smart-form-iul` after every task; it must exit 0 before moving on.
- Commit after every task (small, focused commits — this repo is already a working git repo on `main`).

---

### Task 1: Core routing — `LANDING` screen ID, routing-table case, UTM use-case

**Files:**
- Modify: `src/core/entities/screen-id.ts:8-9` (insert `"LANDING"` as the first union member)
- Modify: `src/core/use-cases/routing-table.ts:27-29` (insert `case "LANDING"` before `case "E1_ENTRY"`)
- Create: `src/core/use-cases/utm-campaign.ts`

**Interfaces:**
- Consumes: `IntencionP` from `src/core/entities/qualification-profile.ts` (already exists: `"AHORRO_RETIRO" | "PROTECCION_FAM" | "SALUD_EMERGENCIA"`)
- Produces: `ScreenId` now includes `"LANDING"`. `getNextScreen("LANDING", ...)` returns `{ nextScreen: "E1_ENTRY", varUpdates: {} }`. New export `suggestIntencionFromUtm(utmCampaign: string | null): IntencionP | null` from `src/core/use-cases/utm-campaign.ts`, consumed by Task 9.

- [ ] **Step 1: Add `"LANDING"` to the `ScreenId` union**

In `src/core/entities/screen-id.ts`, change:
```ts
export type ScreenId =
  | "E1_ENTRY"
  | "S1"
```
to:
```ts
export type ScreenId =
  | "LANDING"
  | "E1_ENTRY"
  | "S1"
```

- [ ] **Step 2: Add the `LANDING` case to the routing table**

In `src/core/use-cases/routing-table.ts`, change:
```ts
  switch (current) {
    case "E1_ENTRY":
      return { nextScreen: "S1", varUpdates: {} };
```
to:
```ts
  switch (current) {
    case "LANDING":
      return { nextScreen: "E1_ENTRY", varUpdates: {} };

    case "E1_ENTRY":
      return { nextScreen: "S1", varUpdates: {} };
```

- [ ] **Step 3: Run `tsc` to confirm the exhaustive-switch check still passes**

Run (from `C:\dev\luismoreno\smart-form-iul`): `npx tsc --noEmit`
Expected: exits 0 (the `default: { const _exhaustive: never = current; ... }` branch in `routing-table.ts` would fail to compile if any `ScreenId` case were missing — this confirms `LANDING` was wired correctly and no other case was broken).

- [ ] **Step 4: Create the UTM → intención suggestion use-case**

Create `src/core/use-cases/utm-campaign.ts`:
```ts
import type { IntencionP } from "@/core/entities/qualification-profile";

/**
 * Mapea el valor de ?utm_campaign= a una intención sugerida para Q_INT.
 * Pura, sin React ni acceso a window — recibe el string ya extraído.
 * Cualquier valor no reconocido (incluido "retargeting_600leads") o null
 * devuelve null: sin sugerencia visual.
 */
const UTM_TO_INTENCION: Record<string, IntencionP> = {
  ahorro_retiro: "AHORRO_RETIRO",
  proteccion_familiar: "PROTECCION_FAM",
  salud_emergencia: "SALUD_EMERGENCIA",
};

export function suggestIntencionFromUtm(utmCampaign: string | null): IntencionP | null {
  if (!utmCampaign) return null;
  return UTM_TO_INTENCION[utmCampaign] ?? null;
}
```

- [ ] **Step 5: Run `tsc` again**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/core/entities/screen-id.ts src/core/use-cases/routing-table.ts src/core/use-cases/utm-campaign.ts
git commit -m "feat(landing): add LANDING screen id, routing case, and UTM suggestion use-case"
```

---

### Task 2: Store — `utmCampaign` field and `LANDING` as initial screen

**Files:**
- Modify: `src/presentation/state/form-store.ts:19-89`

**Interfaces:**
- Consumes: `getNextScreen` (unchanged signature), `ScreenId` (now includes `"LANDING"`, from Task 1).
- Produces: `useFormStore` now exposes `utmCampaign: string | null` and `setUtmCampaign: (value: string | null) => void`, consumed by `LandingScreen` (Task 8) and `Q_INT` (Task 9). `currentScreen` starts at `"LANDING"` instead of `"E1_ENTRY"`.

- [ ] **Step 1: Add `utmCampaign` to `FormState` and initial state**

In `src/presentation/state/form-store.ts`, change the interface:
```ts
interface FormState {
  sessionId: string;
  currentScreen: ScreenId;
  history: ScreenId[];
  vars: QualificationProfile;
  setVar: <K extends keyof QualificationProfile>(key: K, value: QualificationProfile[K]) => void;
  setVars: (patch: Partial<QualificationProfile>) => void;
  navigate: (choiceId: string) => void;
  goBack: () => void;
  reset: () => void;
}
```
to:
```ts
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
```

- [ ] **Step 2: Change initial `currentScreen`, add `utmCampaign` initial value and setter**

Change:
```ts
    (set, get) => ({
      sessionId: createSessionId(),
      currentScreen: "E1_ENTRY",
      history: [],
      vars: INITIAL_QUALIFICATION_PROFILE,

      setVar: (key, value) =>
```
to:
```ts
    (set, get) => ({
      sessionId: createSessionId(),
      currentScreen: "LANDING",
      history: [],
      vars: INITIAL_QUALIFICATION_PROFILE,
      utmCampaign: null,

      setUtmCampaign: (value) => set({ utmCampaign: value }),

      setVar: (key, value) =>
```

- [ ] **Step 3: Change `reset()` to also start at `LANDING`**

Change:
```ts
      reset: () =>
        set({
          sessionId: createSessionId(),
          currentScreen: "E1_ENTRY",
          history: [],
          vars: INITIAL_QUALIFICATION_PROFILE,
        }),
```
to:
```ts
      reset: () =>
        set({
          sessionId: createSessionId(),
          currentScreen: "LANDING",
          history: [],
          vars: INITIAL_QUALIFICATION_PROFILE,
          utmCampaign: null,
        }),
```

- [ ] **Step 4: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/state/form-store.ts
git commit -m "feat(landing): store LANDING as initial screen and add utmCampaign field"
```

---

### Task 3: `OptionButton` and `DecisionScreen` — optional `badge` prop

**Files:**
- Modify: `src/presentation/components/OptionButton.tsx`
- Modify: `src/presentation/screens/DecisionScreen.tsx`

**Interfaces:**
- Produces: `OptionButton` accepts `badge?: string`. `DecisionOption` (from `DecisionScreen.tsx`) accepts `badge?: string`, forwarded to `OptionButton`. Consumed by `QInt.tsx` in Task 9.

- [ ] **Step 1: Add `badge` prop to `OptionButtonProps` and render it**

In `src/presentation/components/OptionButton.tsx`, change the props interface:
```ts
interface OptionButtonProps {
  icon?: ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  selected?: boolean;
  /** Variante "muted" para opciones descalificantes que igual deben ser tappables (ej. Q_EDAD: <18, >70). */
  variant?: "default" | "muted";
}
```
to:
```ts
interface OptionButtonProps {
  icon?: ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  selected?: boolean;
  /** Variante "muted" para opciones descalificantes que igual deben ser tappables (ej. Q_EDAD: <18, >70). */
  variant?: "default" | "muted";
  /** Sugerencia visual no vinculante (ej. "Sugerido para ti" por UTM en Q_INT) — nunca implica selección ni auto-avance. */
  badge?: string;
}
```

Change the function signature:
```ts
export function OptionButton({
  icon,
  label,
  sublabel,
  onClick,
  selected = false,
  variant = "default",
}: OptionButtonProps) {
```
to:
```ts
export function OptionButton({
  icon,
  label,
  sublabel,
  onClick,
  selected = false,
  variant = "default",
  badge,
}: OptionButtonProps) {
```

Change the label block to render the badge:
```tsx
      <div className="flex-1 min-w-0">
        <p className="type-label leading-tight">{label}</p>
        {sublabel && <p className="type-caption mt-0.5">{sublabel}</p>}
      </div>
```
to:
```tsx
      <div className="flex-1 min-w-0">
        <p className="type-label leading-tight">{label}</p>
        {sublabel && <p className="type-caption mt-0.5">{sublabel}</p>}
        {badge && (
          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-caution-bg text-caution type-caption">
            {badge}
          </span>
        )}
      </div>
```

- [ ] **Step 2: Thread `badge` through `DecisionOption` and `DecisionScreen`**

In `src/presentation/screens/DecisionScreen.tsx`, change:
```ts
export interface DecisionOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  variant?: "default" | "muted";
}
```
to:
```ts
export interface DecisionOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  variant?: "default" | "muted";
  badge?: string;
}
```

Change the render:
```tsx
        {options.map((opt) => (
          <OptionButton
            key={opt.value}
            icon={opt.icon}
            label={opt.label}
            sublabel={opt.sublabel}
            variant={opt.variant}
            onClick={() => onSelect(opt.value)}
          />
        ))}
```
to:
```tsx
        {options.map((opt) => (
          <OptionButton
            key={opt.value}
            icon={opt.icon}
            label={opt.label}
            sublabel={opt.sublabel}
            variant={opt.variant}
            badge={opt.badge}
            onClick={() => onSelect(opt.value)}
          />
        ))}
```

- [ ] **Step 3: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/presentation/components/OptionButton.tsx src/presentation/screens/DecisionScreen.tsx
git commit -m "feat(landing): add optional badge prop to OptionButton/DecisionOption"
```

---

### Task 4: Shared landing components — `LandingWrapper`, `LandingSection`, `VideoPlaceholder`, `MetaPixelSlot`

**Files:**
- Create: `src/presentation/screens/landing/LandingWrapper.tsx`
- Create: `src/presentation/screens/landing/LandingSection.tsx`
- Create: `src/presentation/components/VideoPlaceholder.tsx`
- Create: `src/presentation/components/MetaPixelSlot.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `LandingWrapper({ children })`, `LandingSection({ children, className? })` (scroll-reveal fade-up), `VideoPlaceholder({ label? })`, `MetaPixelSlot()` (renders `null`). Consumed by Tasks 6, 7, 8.

- [ ] **Step 1: Create `LandingWrapper`**

Create `src/presentation/screens/landing/LandingWrapper.tsx`:
```tsx
"use client";

import type { ReactNode } from "react";

interface LandingWrapperProps {
  children: ReactNode;
}

/**
 * Contenedor raíz de la landing. A diferencia de ScreenWrapper (una sola
 * vista, sin scroll, usada por las otras 41 pantallas), la landing tiene 6
 * secciones apiladas más altas que el viewport. Reactiva scroll vertical
 * localmente sin tocar el reset global de `body` en globals.css — mismo
 * patrón de "opt-out local" que ya usan StateSelector y PreFaq en un div
 * hijo, aquí aplicado a toda la pantalla.
 */
export function LandingWrapper({ children }: LandingWrapperProps) {
  return (
    <div className="absolute inset-0 overflow-y-auto overscroll-y-contain">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `LandingSection`**

Create `src/presentation/screens/landing/LandingSection.tsx`:
```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface LandingSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Envuelve una sección de la landing (Problem, Solution, Process,
 * Testimonials, Credentials) y dispara un fade-up GSAP la primera vez que
 * la sección entra en el viewport, vía IntersectionObserver. Distinto de
 * ScreenWrapper/enterScreen (que animan al montar, no al hacer scroll).
 */
export function LandingSection({ children, className = "" }: LandingSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { y: 24, opacity: 0 });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`px-6 py-12 ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `VideoPlaceholder`**

Create `src/presentation/components/VideoPlaceholder.tsx`:
```tsx
interface VideoPlaceholderProps {
  label?: string;
}

/** Slot de video con overlay "Próximamente" — usado en Testimonials hasta que existan videos reales grabados. */
export function VideoPlaceholder({ label = "Próximamente" }: VideoPlaceholderProps) {
  return (
    <div className="relative w-full aspect-video rounded-2xl bg-bg-surface border border-border-card overflow-hidden flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M10 8l6 4-6 4V8z" fill="var(--text-muted)" stroke="none" />
      </svg>
      <span className="absolute bottom-3 right-3 type-caption px-3 py-1 rounded-full bg-[var(--bg-overlay)]">
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Create `MetaPixelSlot`**

Create `src/presentation/components/MetaPixelSlot.tsx`:
```tsx
/**
 * Slot inerte para el script base de Meta Pixel. No renderiza nada ni hace
 * ninguna request de red — intencional mientras el proyecto esté en fase
 * fundacional sin integraciones (ver
 * docs/superpowers/specs/2026-08-06-landing-page-design.md).
 *
 * Cuando exista un Pixel ID real:
 * 1. Reemplazar el cuerpo de este componente por un <Script
 *    strategy="afterInteractive"> (de next/script) con el snippet base de
 *    Meta Pixel: fbq('init', PIXEL_ID) + fbq('track', 'PageView').
 *    Ver: https://developers.facebook.com/docs/meta-pixel/get-started
 * 2. Ya está montado en src/app/layout.tsx — no hace falta moverlo.
 * 3. Disparar fbq('track', 'Lead') en src/presentation/screens/E5Final.tsx
 *    al confirmar la evaluación (pantalla de cierre del wizard).
 */
export function MetaPixelSlot() {
  return null;
}
```

- [ ] **Step 5: Mount `MetaPixelSlot` in the root layout**

In `src/app/layout.tsx`, change:
```tsx
import type { Metadata, Viewport } from "next";
import "@/presentation/styles/globals.css";
import { BRAND_NAME } from "@/presentation/constants";
```
to:
```tsx
import type { Metadata, Viewport } from "next";
import "@/presentation/styles/globals.css";
import { BRAND_NAME } from "@/presentation/constants";
import { MetaPixelSlot } from "@/presentation/components/MetaPixelSlot";
```

And change:
```tsx
    <html lang="es" className="h-full">
      <body className="h-full">{children}</body>
    </html>
```
to:
```tsx
    <html lang="es" className="h-full">
      <body className="h-full">
        <MetaPixelSlot />
        {children}
      </body>
    </html>
```

- [ ] **Step 6: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/presentation/screens/landing/LandingWrapper.tsx src/presentation/screens/landing/LandingSection.tsx src/presentation/components/VideoPlaceholder.tsx src/presentation/components/MetaPixelSlot.tsx src/app/layout.tsx
git commit -m "feat(landing): add LandingWrapper, LandingSection, VideoPlaceholder, MetaPixelSlot"
```

---

### Task 5: `INSURANCE_PARTNERS` constant

**Files:**
- Modify: `src/presentation/constants.ts`

**Interfaces:**
- Produces: `INSURANCE_PARTNERS: readonly string[]`, consumed by `Credentials.tsx` in Task 7.

- [ ] **Step 1: Add the constant**

In `src/presentation/constants.ts`, after the `AGENT_INFO` block, add:
```ts
/**
 * Las 8 aseguradoras con las que se trabaja. El documento fuente
 * (mvp_arbol_decisiones_smart_form.md / copy_guion) menciona solo a
 * National Life Group — es una de las 8, no la única opción para IUL. Solo
 * se refleja en la landing (Sección 6), el resto del wizard sigue
 * centrado en NLG (ver docs/superpowers/specs/2026-08-06-landing-page-design.md).
 */
export const INSURANCE_PARTNERS = [
  "Ethos",
  "Americo",
  "Mutual of Omaha",
  "National Life Group",
  "F&G (Annuities & Life)",
  "Corebridge Financial",
  "Transamerica",
  "Foresters Financial",
] as const;
```

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/constants.ts
git commit -m "feat(landing): add INSURANCE_PARTNERS constant"
```

---

### Task 6: Landing sections 1-4 — `Hero`, `Problem`, `Solution`, `Process`

**Files:**
- Create: `src/presentation/screens/landing/Hero.tsx`
- Create: `src/presentation/screens/landing/Problem.tsx`
- Create: `src/presentation/screens/landing/Solution.tsx`
- Create: `src/presentation/screens/landing/Process.tsx`

**Interfaces:**
- Consumes: `headerIn` from `src/presentation/animations/gsap-micro.ts` (already exists).
- Produces: `Hero()`, `Problem()`, `Solution()`, `Process()` — no props, consumed by `LandingScreen.tsx` in Task 8.

- [ ] **Step 1: Create `Hero`**

Create `src/presentation/screens/landing/Hero.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import { headerIn } from "@/presentation/animations/gsap-micro";

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 1. Hero
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) headerIn(ref.current.children);
  }, []);

  return (
    <div ref={ref} className="min-h-dvh flex flex-col justify-center px-6 gap-4">
      <h1 className="type-title">¿Calificas para el programa de ahorro y protección?</h1>
      <p className="type-subtitle">
        Descubre en menos de 4 minutos si tu perfil cumple los requisitos de este programa.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `Problem`**

Create `src/presentation/screens/landing/Problem.tsx`:
```tsx
// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 2. El problema
const DOLORES = [
  "Vivir demasiado tiempo sin haber ahorrado lo suficiente",
  "Faltar y dejar a la familia sin respaldo económico",
  "Una emergencia médica que quiebre financieramente a la familia",
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

- [ ] **Step 3: Create `Solution`**

Create `src/presentation/screens/landing/Solution.tsx`:
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
      {PILARES.map((p) => (
        <div key={p.title} className="p-5 rounded-2xl bg-bg-elevated border border-border-card">
          <p className="type-label mb-1">{p.title}</p>
          <p className="type-body">{p.text}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `Process`**

Create `src/presentation/screens/landing/Process.tsx`:
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
      <ol className="flex flex-col gap-3">
        {PASOS.map((text, i) => (
          <li key={text} className="flex gap-3 items-start p-4 rounded-2xl bg-bg-surface border border-border-card">
            <span className="type-label text-gold-primary">{i + 1}</span>
            <p className="type-body">{text}</p>
          </li>
        ))}
      </ol>
      <div className="p-5 rounded-2xl bg-trust-bg border border-border-card">
        <p className="type-caption text-trust">
          Como parte del proceso federal de aprobación, el MIB requiere
          verificación de identidad. Tu Agente Certificado te explicará
          exactamente cómo funciona este paso durante la llamada.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/presentation/screens/landing/Hero.tsx src/presentation/screens/landing/Problem.tsx src/presentation/screens/landing/Solution.tsx src/presentation/screens/landing/Process.tsx
git commit -m "feat(landing): add Hero, Problem, Solution, Process sections"
```

---

### Task 7: Landing sections 5-6 — `Testimonials`, `Credentials`

**Files:**
- Create: `src/presentation/screens/landing/Testimonials.tsx`
- Create: `src/presentation/screens/landing/Credentials.tsx`

**Interfaces:**
- Consumes: `VideoPlaceholder` (Task 4), `AgentCard` from `src/presentation/components/AgentCard.tsx` (already exists, props `{ size?: "medium" | "large" }`), `AGENT_INFO` and `INSURANCE_PARTNERS` from `src/presentation/constants.ts` (Task 5).
- Produces: `Testimonials()`, `Credentials()` — no props, consumed by `LandingScreen.tsx` in Task 8.

- [ ] **Step 1: Create `Testimonials`**

Create `src/presentation/screens/landing/Testimonials.tsx`:
```tsx
import { VideoPlaceholder } from "@/presentation/components/VideoPlaceholder";

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 5. Testimonios
export function Testimonials() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Personas que ya pasaron por este proceso</p>
      <div className="flex flex-col gap-4">
        <VideoPlaceholder />
        <VideoPlaceholder />
        <VideoPlaceholder />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `Credentials`**

Create `src/presentation/screens/landing/Credentials.tsx`:
```tsx
import { AgentCard } from "@/presentation/components/AgentCard";
import { AGENT_INFO, INSURANCE_PARTNERS } from "@/presentation/constants";

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 6. Credenciales
export function Credentials() {
  return (
    <div className="flex flex-col gap-6 items-center">
      <AgentCard size="large" />
      <div className="w-full">
        <p className="type-eyebrow text-center mb-3">Respaldado por aseguradoras líderes</p>
        <div className="grid grid-cols-2 gap-2">
          {INSURANCE_PARTNERS.map((name) => (
            <div key={name} className="p-3 rounded-xl bg-bg-surface border border-border-card text-center">
              <p className="type-caption">{name}</p>
            </div>
          ))}
        </div>
      </div>
      <a
        href="https://nipr.com"
        target="_blank"
        rel="noopener noreferrer"
        className="type-caption text-trust"
      >
        Verificar licencia {AGENT_INFO.license} en nipr.com →
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/presentation/screens/landing/Testimonials.tsx src/presentation/screens/landing/Credentials.tsx
git commit -m "feat(landing): add Testimonials and Credentials sections"
```

---

### Task 8: `LandingScreen` orchestrator + screen-registry wiring

**Files:**
- Create: `src/presentation/screens/landing/LandingScreen.tsx`
- Modify: `src/presentation/screens/screen-registry.tsx`

**Interfaces:**
- Consumes: `LandingWrapper`, `LandingSection` (Task 4), `Hero`, `Problem`, `Solution`, `Process` (Task 6), `Testimonials`, `Credentials` (Task 7), `CTAButton` from `src/presentation/components/CTAButton.tsx` (already exists, props `{ label, onClick, disabled?, variant? }`), `useFormStore` (Task 2 — `setUtmCampaign`), `ScreenComponentProps` from `src/presentation/screens/screen-registry.tsx`.
- Produces: `LandingScreen({ vars, onChoice })` matching the standard screen contract, registered as `SCREEN_COMPONENTS.LANDING`.

- [ ] **Step 1: Create `LandingScreen`**

Create `src/presentation/screens/landing/LandingScreen.tsx`:
```tsx
"use client";

import { useEffect } from "react";
import { useFormStore } from "@/presentation/state/form-store";
import { LandingWrapper } from "@/presentation/screens/landing/LandingWrapper";
import { LandingSection } from "@/presentation/screens/landing/LandingSection";
import { Hero } from "@/presentation/screens/landing/Hero";
import { Problem } from "@/presentation/screens/landing/Problem";
import { Solution } from "@/presentation/screens/landing/Solution";
import { Process } from "@/presentation/screens/landing/Process";
import { Testimonials } from "@/presentation/screens/landing/Testimonials";
import { Credentials } from "@/presentation/screens/landing/Credentials";
import { CTAButton } from "@/presentation/components/CTAButton";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md
export function LandingScreen({ onChoice }: ScreenComponentProps) {
  const setUtmCampaign = useFormStore((s) => s.setUtmCampaign);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmCampaign(params.get("utm_campaign"));
  }, [setUtmCampaign]);

  return (
    <LandingWrapper>
      <Hero />
      <LandingSection>
        <Problem />
      </LandingSection>
      <LandingSection>
        <Solution />
      </LandingSection>
      <LandingSection>
        <Process />
      </LandingSection>
      <LandingSection>
        <Testimonials />
      </LandingSection>
      <LandingSection>
        <Credentials />
      </LandingSection>
      <div className="px-6 pb-10 pt-4">
        <CTAButton label="Quiero verificar si califico →" onClick={() => onChoice("CONTINUE")} />
      </div>
    </LandingWrapper>
  );
}
```

- [ ] **Step 2: Register `LANDING` in the screen map**

In `src/presentation/screens/screen-registry.tsx`, add the import after the last existing import:
```ts
import { E5Final } from "@/presentation/screens/E5Final";
```
becomes:
```ts
import { E5Final } from "@/presentation/screens/E5Final";
import { LandingScreen } from "@/presentation/screens/landing/LandingScreen";
```

And add the map entry as the first key:
```ts
export const SCREEN_COMPONENTS: Partial<Record<ScreenId, ScreenComponent>> = {
  E1_ENTRY: E1Entry,
```
becomes:
```ts
export const SCREEN_COMPONENTS: Partial<Record<ScreenId, ScreenComponent>> = {
  LANDING: LandingScreen,
  E1_ENTRY: E1Entry,
```

- [ ] **Step 3: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Manual verification — landing renders and boots the app**

1. Ensure the dev server is running: `preview_start` with `{name: "smart-form-iul"}` (already configured in `.claude/launch.json`, port 3020).
2. In the browser, run `sessionStorage.clear(); location.reload();` (via `javascript_tool`) to clear any persisted `currentScreen` from prior testing.
3. Confirm the page now shows the Hero headline "¿Calificas para el programa de ahorro y protección?" instead of the old `E1_ENTRY` "Verifica si calificas" screen.
4. Scroll down (or use `javascript_tool` with `window.scrollTo` inside the `LandingWrapper` div, or drag-scroll via `computer` action) through all 6 sections; confirm each fades up as it enters view and no layout is clipped.
5. Click the final CTA "Quiero verificar si califico →"; confirm it navigates to the existing `E1_ENTRY` screen ("Verifica si calificas").

- [ ] **Step 5: Commit**

```bash
git add src/presentation/screens/landing/LandingScreen.tsx src/presentation/screens/screen-registry.tsx
git commit -m "feat(landing): add LandingScreen orchestrator and register LANDING screen"
```

---

### Task 9: `Q_INT` UTM badge wiring

**Files:**
- Modify: `src/presentation/screens/warmup/QInt.tsx`

**Interfaces:**
- Consumes: `useFormStore` (Task 2 — `utmCampaign`), `suggestIntencionFromUtm` (Task 1), `badge?` on `DecisionOption` (Task 3).

- [ ] **Step 1: Wire the UTM suggestion into `Q_INT`'s options**

Replace the full contents of `src/presentation/screens/warmup/QInt.tsx`:
```tsx
"use client";

import { useFormStore } from "@/presentation/state/form-store";
import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import { IconSavings, IconFamily, IconHealth } from "@/presentation/components/icons";
import { suggestIntencionFromUtm } from "@/core/use-cases/utm-campaign";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_INT
export function QInt({ onChoice }: ScreenComponentProps) {
  const utmCampaign = useFormStore((s) => s.utmCampaign);
  const suggested = suggestIntencionFromUtm(utmCampaign);

  return (
    <DecisionScreen
      progressStep={1}
      eyebrow="Para comenzar"
      question="¿Qué fue lo que más te llamó la atención de este programa?"
      onSelect={onChoice}
      options={[
        {
          value: "AHORRO_RETIRO",
          label: "Ahorrar dinero / prepararme para el retiro",
          icon: <IconSavings />,
          badge: suggested === "AHORRO_RETIRO" ? "Sugerido para ti" : undefined,
        },
        {
          value: "PROTECCION_FAM",
          label: "Proteger a mi familia si me llega a pasar algo",
          icon: <IconFamily />,
          badge: suggested === "PROTECCION_FAM" ? "Sugerido para ti" : undefined,
        },
        {
          value: "SALUD_EMERGENCIA",
          label: "Tener un respaldo si sufro una enfermedad o accidente",
          icon: <IconHealth />,
          badge: suggested === "SALUD_EMERGENCIA" ? "Sugerido para ti" : undefined,
        },
      ]}
    />
  );
}
```

- [ ] **Step 2: Run `tsc`**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Manual verification — badge appears only with a matching UTM**

1. In the browser, run via `javascript_tool`: `sessionStorage.clear(); location.href = "http://localhost:3020/evaluacion?utm_campaign=ahorro_retiro";` — wait, the app boots from `/evaluacion` regardless of query string since `LANDING` is the initial screen inside that one route; navigate to `http://localhost:3020/evaluacion?utm_campaign=ahorro_retiro` directly.
2. Click through the CTA on `LANDING`, then on `E1_ENTRY`'s "Comenzar →", to reach `S1`, then wait for its auto-advance to `Q_INT`.
3. Confirm the "Ahorrar dinero / prepararme para el retiro" option shows a small "Sugerido para ti" pill, and the other two options do not.
4. Confirm no option is visually in the `selected` (checkmark) state, and tapping any option still advances normally (the badge is cosmetic only).
5. Repeat with no `utm_campaign` query param (or `?utm_campaign=unknown_value`); confirm no option shows a badge.

- [ ] **Step 4: Commit**

```bash
git add src/presentation/screens/warmup/QInt.tsx
git commit -m "feat(landing): show UTM-suggested badge on Q_INT"
```

---

### Task 10: Full end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Full `tsc` and production build check**

Run (from `C:\dev\luismoreno\smart-form-iul`):
```bash
npx tsc --noEmit
```
Expected: exits 0.

```bash
rm -rf .next && npm run build
```
Expected: build succeeds, no route errors. (Do this only when the dev server on port 3020 is stopped or you accept it will need a restart afterward — deleting `.next` while the dev server is running corrupts its Turbopack cache, as happened during the Dockerfile work; if the dev server is running, stop it first via `preview_stop`, then restart via `preview_start` with `{name: "smart-form-iul"}` after the build check.)

- [ ] **Step 2: Manual click-through — full flow from LANDING to E1_ENTRY**

1. `preview_start` with `{name: "smart-form-iul"}` if not already running.
2. Clear session state: `javascript_tool` → `sessionStorage.clear(); location.reload();`.
3. Confirm `LANDING` renders at `http://localhost:3020` (redirects to `/evaluacion`).
4. Scroll through all 6 sections, confirm no console errors (`read_console_messages`).
5. Confirm `read_network_requests` shows no requests originating from the app itself (only Next.js dev asset requests) — this proves the `MetaPixelSlot` is truly inert and no other integration accidentally fires.
6. Click the CTA; confirm navigation to `E1_ENTRY`.
7. Click "Comenzar →" on `E1_ENTRY`; confirm it goes to `S1` as before (unchanged behavior downstream of `LANDING`).

- [ ] **Step 3: Verify `goBack()` from `E1_ENTRY` returns to `LANDING`**

Via `javascript_tool`, after reaching `E1_ENTRY`, run:
```js
JSON.parse(sessionStorage.getItem('escudo-tu-patrimonio-form')).state.history
```
Expected: the array's last element is `"LANDING"` (confirms `LANDING` was pushed to history when `navigate("START")` was called from it, exactly like every other screen transition).

- [ ] **Step 4: Confirm no other screen's behavior regressed**

Spot-check one full branch (e.g. Ahorro: `Q_INT` → `Q_A1` → `Q_A2` → `S2A` → `Q_INT2` → `INFO_NLG` → `Q_FRAME`) to confirm the pre-existing 41-screen flow is untouched by the `LANDING` addition — no `varUpdates` regressions, no console errors.

- [ ] **Step 5: Final commit**

If Steps 1-4 required any fixes, commit them now with a descriptive message. If everything already passed cleanly from Task 9's commit, this step is a no-op — do not create an empty commit.
