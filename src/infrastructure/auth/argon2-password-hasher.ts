import argon2 from "argon2";
import type { PasswordHasher } from "@/core/ports/password-hasher";

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  // argon2.verify lanza si el hash no tiene un formato que reconozca (fila
  // corrupta, hash de otro algoritmo). Para el caller eso es simplemente "no
  // coincide", no un error de programa que deba propagarse.
  async verify(plain: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
