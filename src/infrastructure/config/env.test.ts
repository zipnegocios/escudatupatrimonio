import { describe, expect, it } from "vitest";
import { parseEnv } from "@/infrastructure/config/env";

const valid = {
  DATABASE_URL: "postgres://smartform:smartform@localhost:5432/smartform",
  SESSION_SECRET: "un-secreto-de-mas-de-16-chars",
};

describe("parseEnv", () => {
  it("devuelve un objeto tipado y aplica development como NODE_ENV por defecto", () => {
    expect(parseEnv(valid)).toEqual({
      DATABASE_URL: "postgres://smartform:smartform@localhost:5432/smartform",
      SESSION_SECRET: "un-secreto-de-mas-de-16-chars",
      NODE_ENV: "development",
    });
  });

  it("acepta el esquema postgresql:// además de postgres://", () => {
    const result = parseEnv({ ...valid, DATABASE_URL: "postgresql://a:b@h:5432/d" });
    expect(result.DATABASE_URL).toBe("postgresql://a:b@h:5432/d");
  });

  it("respeta NODE_ENV=production", () => {
    expect(parseEnv({ ...valid, NODE_ENV: "production" }).NODE_ENV).toBe("production");
  });

  it("lanza nombrando la variable faltante", () => {
    expect(() => parseEnv({ SESSION_SECRET: valid.SESSION_SECRET })).toThrowError(/DATABASE_URL/);
  });

  it("lanza si DATABASE_URL no es una URL de postgres", () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: "mysql://a:b@h/d" })).toThrowError(/DATABASE_URL/);
  });

  it("lanza si SESSION_SECRET es demasiado corto", () => {
    expect(() => parseEnv({ ...valid, SESSION_SECRET: "corto" })).toThrowError(/SESSION_SECRET/);
  });

  it("trata una variable opcional en blanco (string vacío) igual que ausente", () => {
    // Algunos paneles (EasyPanel incluido) guardan una var "sin completar"
    // como "" en vez de omitirla — no debe romper el arranque.
    const result = parseEnv({ ...valid, EMAIL_FROM_ADDRESS: "" });
    expect(result.EMAIL_FROM_ADDRESS).toBeUndefined();
  });

  it("lanza listando TODAS las variables inválidas de una sola vez", () => {
    let message = "";
    try {
      parseEnv({ SESSION_SECRET: "corto" });
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toContain("DATABASE_URL");
    expect(message).toContain("SESSION_SECRET");
  });
});
