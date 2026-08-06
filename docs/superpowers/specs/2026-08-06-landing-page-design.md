# Landing page (pantalla `LANDING`) — Design

## Contexto

El wizard "Escudo tu Patrimonio" (`smart-form-iul`) hoy entra directo a
`E1_ENTRY`. Falta la Capa 2 de la cadena de entrada (Anuncio → **Landing** →
Smart Form) especificada por Gustavo Amarista & Johanaly Ramírez: una
landing de 6 secciones de scroll único con un solo CTA, que calienta al
prospecto antes de entregarlo al wizard.

Decisión del usuario: la landing se integra **como una pantalla más dentro
de la misma máquina de estados** del wizard (Zustand + `routing-table.ts`),
no como una ruta Next.js separada. Esto prioriza consistencia arquitectónica
sobre desacople de contenido de marketing.

Alcance: seguimos en fase fundacional (solo frontend, sin backend/APIs). Se
excluyen explícitamente Meta Pixel real, retargeting y envío de UTM a
cualquier backend — se deja un slot inerte para Meta Pixel y la lectura de
`utm_campaign` es 100% cliente (no hay integración externa).

Corrección de contenido sobre el documento original: el documento fuente
menciona solo a National Life Group como aseguradora. En realidad Luis
trabaja con 8 aseguradoras. Se refleja **únicamente en la landing**
(Sección 6 y el Paso 4 del proceso) — el resto del wizard (`INFO_NLG`,
`PRE_1`, etc., que ya está construido y centrado en NLG) no se toca; es un
proyecto aparte.

## Arquitectura

- Nuevo `ScreenId: "LANDING"` en `core/entities/screen-id.ts`, primero en el
  union type.
- `form-store.ts`: `currentScreen` inicial pasa de `"E1_ENTRY"` a
  `"LANDING"` (en el estado inicial y en `reset()`).
- `routing-table.ts`: `case "LANDING": return { nextScreen: "E1_ENTRY", varUpdates: {} }`.
  El compilador (chequeo exhaustivo `never` en el `default`) obliga a tocar
  todos los puntos correctos.
- `screen-registry.tsx`: se agrega `LANDING: LandingScreen`.
- **No se reutiliza `ScreenWrapper`** (es `absolute inset-0` + slide
  horizontal de una sola vista, pensado para pantallas de un tap). Se crea
  `LandingWrapper.tsx`: `absolute inset-0 overflow-y-auto overscroll-y-contain`,
  mismo patrón de "opt-out local" del scroll global que ya usan
  `StateSelector`/`PreFaq` en un `<div>` hijo — aquí se aplica a toda la
  pantalla porque el contenido es más alto que el viewport.
- Sin WebGL en la landing (excluido explícitamente por el documento fuente).
  Scroll-reveal vía GSAP + `IntersectionObserver`, no la animación
  `enterScreen` de slide.

## Componentes nuevos

`src/presentation/screens/landing/`
- `LandingScreen.tsx` — orquesta las 6 secciones + CTA final dentro de
  `LandingWrapper`. Lee `window.location.search` en un `useEffect` al
  montar y llama a `setUtmCampaign` del store.
- `LandingSection.tsx` — wrapper genérico por sección: fade-up al entrar en
  viewport (GSAP `fromTo` disparado por `IntersectionObserver`, no por
  mount). Props: `children`, `className?`.
- `Hero.tsx`, `Problem.tsx`, `Solution.tsx`, `Process.tsx`,
  `Testimonials.tsx`, `Credentials.tsx` — una por sección, copy hardcodeado
  (ver "Contenido" abajo).

`src/presentation/components/`
- `VideoPlaceholder.tsx` — slot con overlay "Próximamente", usado 3 veces
  en `Testimonials.tsx`. Props: `label?: string`.
- `MetaPixelSlot.tsx` — componente inerte: no renderiza nada visible, no
  hace requests. Bloque comentado con instrucciones exactas de dónde pegar
  el script base de Meta Pixel y dónde disparar el evento `Lead`/`Purchase`
  en `E5_FINAL`. Se monta una vez en `src/app/layout.tsx`.

Reuso sin cambios: `AgentCard`, `CTAButton`, `OptionButton` (con nuevo prop
opcional), tokens de `globals.css` (`type-*`, `bg-*`, `text-*`).

## UTM → pre-selección visual en `Q_INT`

- Nuevo campo en el store, **fuera** de `QualificationProfile` (es un hint
  de marketing efímero, no una de las 22 variables silenciosas que se
  acumulan para GHL): `utmCampaign: string | null` + acción `setUtmCampaign`.
- Nuevo use-case puro `core/use-cases/utm-campaign.ts`:
  ```ts
  export function suggestIntencionFromUtm(utmCampaign: string | null): IntencionP | null
  ```
  Mapea `ahorro_retiro → AHORRO_RETIRO`, `proteccion_familiar → PROTECCION_FAM`,
  `salud_emergencia → SALUD_EMERGENCIA`; cualquier otro valor (incluido
  `retargeting_600leads` o ausente) → `null`.
- `OptionButton` gana un prop opcional `badge?: string`, renderizado como
  una píldora pequeña (`bg-caution-bg`/`text-caution` o similar, distinto
  del estado `selected` que ya existe) para no confundir "sugerido" con
  "elegido".
- `Q_INT.tsx` lee `vars` — espera, `utmCampaign` no vive en `vars`
  (`QualificationProfile`), así que `Q_INT` necesita leer
  `useFormStore(s => s.utmCampaign)` directamente (única pantalla que
  accede al store más allá de `vars`/`onChoice`, justificado porque es
  metadata de marketing, no de negocio) y le pasa `badge="Sugerido para ti"`
  a la opción cuyo `value` coincide con `suggestIntencionFromUtm(utmCampaign)`.
  Puramente visual: no marca `intencionP` ni auto-avanza.

## Contenido por sección (copy verbatim del documento fuente)

**1. Hero** — Eyebrow ninguno. `Headline`: "¿Calificas para el programa de
ahorro y protección?" `Subhead`: "Descubre en menos de 4 minutos si tu
perfil cumple los requisitos de este programa." Sin CTA (regla dura: un
solo CTA en toda la página, al final).

**2. El problema** — 3 tarjetas cortas, sin cifras ni nombre de producto:
- "Vivir demasiado tiempo sin haber ahorrado lo suficiente"
- "Faltar y dejar a la familia sin respaldo económico"
- "Una emergencia médica que quiebre financieramente a la familia"

**3. La solución (teaser)** — 3 pilares, texto exacto del documento (sin
"IUL" ni cifras):
- Ahorro: "Tu dinero crece con el tiempo, conectado a los mercados, sin
  exponerte a sus pérdidas."
- Protección: "Si algún día faltas, tu familia recibe un respaldo económico
  en cuestión de días, no de meses."
- Beneficios en vida: "Si sufres una enfermedad grave, puedes acceder a
  gran parte de tu cobertura mientras sigues con vida."

**4. El proceso** — 4 pasos:
1. "Completas una breve evaluación (4 minutos)"
2. "Un Agente Certificado revisa tu perfil"
3. "El MIB (Buró Médico) verifica tu información según el proceso federal
   de aprobación"
4. **Ajustado** (multi-aseguradora, decisión del usuario): "De acuerdo a tu
   perfil, se te asigna la aseguradora que mejor se adapte a tu caso."

Texto de contexto SSN (verbatim): "Como parte del proceso federal de
aprobación, el MIB requiere verificación de identidad. Tu Agente
Certificado te explicará exactamente cómo funciona este paso durante la
llamada."

**5. Testimonios** — 3 `VideoPlaceholder` con overlay "Próximamente" (no
hay videos reales disponibles).

**6. Credenciales** — `<AgentCard size="large" />` + bloque nuevo
"Respaldado por aseguradoras líderes" listando las 8 en grid de
texto/logo-placeholder:
Ethos, Americo, Mutual of Omaha, National Life Group, F&G (Annuities &
Life), Corebridge Financial, Transamerica, Foresters Financial.
Más: licencia de Luis (`AGENT_INFO.license`) y link a nipr.com
(verificación de agente — carrier-agnostic, se mantiene). Se **quita** el
link específico a nationallife.com de esta sección para no sobre-indexar
en una sola aseguradora.

**CTA único** — "Quiero verificar si califico →" → `onChoice("CONTINUE")`
→ `E1_ENTRY`.

## Fuera de alcance

- Meta Pixel real, retargeting, envío de UTM a backend/CRM.
- Videos de testimonios reales (quedan placeholders).
- Reescritura del resto del wizard para reflejar multi-aseguradora — solo
  la landing se actualiza.
- Ruta estática `/` independiente — la landing vive dentro de la SPA.

## Verificación

- `tsc --noEmit` limpio.
- Recorrido manual en viewport móvil (375×812): scroll completo de las 6
  secciones con reveal GSAP visible, tap en CTA final navega a `E1_ENTRY`
  (pantalla ya existente), `goBack()` desde `E1_ENTRY` regresa a `LANDING`
  sin romper el historial.
- Con `?utm_campaign=ahorro_retiro` en la URL: al llegar a `Q_INT`, la
  opción "Ahorrar dinero..." muestra el badge "Sugerido para ti"; sin
  auto-avance ni valor pre-asignado hasta que el usuario haga tap.
- Sin `utm_campaign` o con un valor no reconocido: `Q_INT` se comporta
  exactamente igual que hoy (sin badges).
- Confirmar que `MetaPixelSlot` no dispara ninguna request de red (mismo
  chequeo que ya se hizo para el resto del formulario: pestaña de red
  vacía de tráfico propio de la app).
