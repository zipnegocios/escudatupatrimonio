import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/core/ports/password-hasher";

// FALLBACK: argon2 requiere compilar un binario nativo (node-gyp + Python),
// y la imagen node:20-alpine de EasyPanel no trae ese toolchain — el build
// fallaba en `npm ci`. bcryptjs es JS puro, sin binario nativo, así que evita
// el problema por completo. Se mantiene el nombre de clase/archivo para no
// arrastrar el cambio al resto de la app (puerto, tests y composition root
// quedan iguales).
const COST_FACTOR = 12;

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, COST_FACTOR);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plain, hash);
    } catch {
      return false;
    }
  }
}
