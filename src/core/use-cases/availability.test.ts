import { describe, expect, it } from "vitest";
import { isBusinessHours } from "@/core/use-cases/availability";

// 2026-08-18 es martes; 2026-08-16 es domingo. America/New_York está en EDT
// (UTC-4) en agosto, así que 14:00Z = 10:00 local.
describe("isBusinessHours", () => {
  it("es true un martes a las 10:00 hora local", () => {
    expect(isBusinessHours("America/New_York", new Date("2026-08-18T14:00:00Z"))).toBe(true);
  });

  it("es false un domingo aunque sea horario hábil", () => {
    expect(isBusinessHours("America/New_York", new Date("2026-08-16T14:00:00Z"))).toBe(false);
  });

  it("es false de madrugada un día hábil", () => {
    expect(isBusinessHours("America/New_York", new Date("2026-08-18T04:00:00Z"))).toBe(false);
  });

  it("es false a las 21:00 exactas (el rango cierra a las 21)", () => {
    expect(isBusinessHours("America/New_York", new Date("2026-08-19T01:00:00Z"))).toBe(false);
  });
});
