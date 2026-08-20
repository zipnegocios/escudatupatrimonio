/**
 * Los 50 estados + DC + PR, con zona horaria IANA y si Luis tiene licencia
 * activa ahí. Por decisión de Luis (2026-08-20) se habilitan todos los
 * estados — la licencia se resuelve rápido caso por caso, no debe frenar el
 * flujo. `Q_ESTADO_REF` (rama "sin licencia → REFERIDO") queda en el código
 * como red de seguridad si en el futuro hiciera falta restringir de nuevo.
 */

export interface UsState {
  code: string;
  name: string;
  timezone: string;
}

export const US_STATES: readonly UsState[] = [
  { code: "AL", name: "Alabama", timezone: "America/Chicago" },
  { code: "AK", name: "Alaska", timezone: "America/Anchorage" },
  { code: "AZ", name: "Arizona", timezone: "America/Phoenix" },
  { code: "AR", name: "Arkansas", timezone: "America/Chicago" },
  { code: "CA", name: "California", timezone: "America/Los_Angeles" },
  { code: "CO", name: "Colorado", timezone: "America/Denver" },
  { code: "CT", name: "Connecticut", timezone: "America/New_York" },
  { code: "DE", name: "Delaware", timezone: "America/New_York" },
  { code: "FL", name: "Florida", timezone: "America/New_York" },
  { code: "GA", name: "Georgia", timezone: "America/New_York" },
  { code: "HI", name: "Hawaii", timezone: "Pacific/Honolulu" },
  { code: "ID", name: "Idaho", timezone: "America/Denver" },
  { code: "IL", name: "Illinois", timezone: "America/Chicago" },
  { code: "IN", name: "Indiana", timezone: "America/Indiana/Indianapolis" },
  { code: "IA", name: "Iowa", timezone: "America/Chicago" },
  { code: "KS", name: "Kansas", timezone: "America/Chicago" },
  { code: "KY", name: "Kentucky", timezone: "America/New_York" },
  { code: "LA", name: "Louisiana", timezone: "America/Chicago" },
  { code: "ME", name: "Maine", timezone: "America/New_York" },
  { code: "MD", name: "Maryland", timezone: "America/New_York" },
  { code: "MA", name: "Massachusetts", timezone: "America/New_York" },
  { code: "MI", name: "Michigan", timezone: "America/Detroit" },
  { code: "MN", name: "Minnesota", timezone: "America/Chicago" },
  { code: "MS", name: "Mississippi", timezone: "America/Chicago" },
  { code: "MO", name: "Missouri", timezone: "America/Chicago" },
  { code: "MT", name: "Montana", timezone: "America/Denver" },
  { code: "NE", name: "Nebraska", timezone: "America/Chicago" },
  { code: "NV", name: "Nevada", timezone: "America/Los_Angeles" },
  { code: "NH", name: "New Hampshire", timezone: "America/New_York" },
  { code: "NJ", name: "New Jersey", timezone: "America/New_York" },
  { code: "NM", name: "New Mexico", timezone: "America/Denver" },
  { code: "NY", name: "New York", timezone: "America/New_York" },
  { code: "NC", name: "North Carolina", timezone: "America/New_York" },
  { code: "ND", name: "North Dakota", timezone: "America/Chicago" },
  { code: "OH", name: "Ohio", timezone: "America/New_York" },
  { code: "OK", name: "Oklahoma", timezone: "America/Chicago" },
  { code: "OR", name: "Oregon", timezone: "America/Los_Angeles" },
  { code: "PA", name: "Pennsylvania", timezone: "America/New_York" },
  { code: "RI", name: "Rhode Island", timezone: "America/New_York" },
  { code: "SC", name: "South Carolina", timezone: "America/New_York" },
  { code: "SD", name: "South Dakota", timezone: "America/Chicago" },
  { code: "TN", name: "Tennessee", timezone: "America/Chicago" },
  { code: "TX", name: "Texas", timezone: "America/Chicago" },
  { code: "UT", name: "Utah", timezone: "America/Denver" },
  { code: "VT", name: "Vermont", timezone: "America/New_York" },
  { code: "VA", name: "Virginia", timezone: "America/New_York" },
  { code: "WA", name: "Washington", timezone: "America/Los_Angeles" },
  { code: "WV", name: "West Virginia", timezone: "America/New_York" },
  { code: "WI", name: "Wisconsin", timezone: "America/Chicago" },
  { code: "WY", name: "Wyoming", timezone: "America/Denver" },
  { code: "DC", name: "Washington DC", timezone: "America/New_York" },
  { code: "PR", name: "Puerto Rico", timezone: "America/Puerto_Rico" },
];

export const LICENSED_STATES: ReadonlySet<string> = new Set(US_STATES.map((s) => s.code));

export function isLicensedState(code: string): boolean {
  return LICENSED_STATES.has(code);
}

export function getStateByCode(code: string): UsState | undefined {
  return US_STATES.find((s) => s.code === code);
}

export function getTimezoneForState(code: string): string {
  return getStateByCode(code)?.timezone ?? "America/New_York";
}
