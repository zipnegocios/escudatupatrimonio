import { describe, expect, it } from "vitest";
import { Argon2PasswordHasher } from "@/infrastructure/auth/argon2-password-hasher";

describe("Argon2PasswordHasher", () => {
  const hasher = new Argon2PasswordHasher();

  it("verifica correctamente el mismo plaintext que hasheó", async () => {
    const hash = await hasher.hash("Sup3rSecret!");
    expect(await hasher.verify("Sup3rSecret!", hash)).toBe(true);
  });

  it("rechaza un plaintext distinto", async () => {
    const hash = await hasher.hash("Sup3rSecret!");
    expect(await hasher.verify("otra-cosa", hash)).toBe(false);
  });

  it("produce hashes distintos para el mismo plaintext (salt aleatorio)", async () => {
    const a = await hasher.hash("Sup3rSecret!");
    const b = await hasher.hash("Sup3rSecret!");
    expect(a).not.toBe(b);
  });

  it("devuelve false ante un hash con formato inválido en vez de lanzar", async () => {
    expect(await hasher.verify("Sup3rSecret!", "esto-no-es-un-hash")).toBe(false);
  });
});
