import { describe, expect, it } from "vitest";
import { authenticateUser } from "@/core/use-cases/auth/authenticate-user";
import {
  FakePasswordHasher,
  InMemoryUserRepository,
  buildUser,
} from "@/core/use-cases/auth/__fakes__/in-memory-adapters";

describe("authenticateUser", () => {
  const passwordHasher = new FakePasswordHasher();

  it("devuelve NOT_FOUND si no hay usuario con ese identificador", async () => {
    const userRepository = new InMemoryUserRepository([]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "nadie", password: "secreta" },
    );
    expect(result).toEqual({ ok: false, reason: "NOT_FOUND" });
  });

  it("devuelve INACTIVE aunque la contraseña sea correcta", async () => {
    const userRepository = new InMemoryUserRepository([buildUser({ isActive: false })]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "admin", password: "secreta" },
    );
    expect(result).toEqual({ ok: false, reason: "INACTIVE" });
  });

  it("devuelve INVALID_PASSWORD si la contraseña no coincide", async () => {
    const userRepository = new InMemoryUserRepository([buildUser()]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "admin", password: "incorrecta" },
    );
    expect(result).toEqual({ ok: false, reason: "INVALID_PASSWORD" });
  });

  it("devuelve ok con el usuario cuando el identificador es el username", async () => {
    const user = buildUser();
    const userRepository = new InMemoryUserRepository([user]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "admin", password: "secreta" },
    );
    expect(result).toEqual({ ok: true, user });
  });

  it("acepta también el email como identificador", async () => {
    const user = buildUser();
    const userRepository = new InMemoryUserRepository([user]);
    const result = await authenticateUser(
      { userRepository, passwordHasher },
      { identifier: "admin@example.com", password: "secreta" },
    );
    expect(result).toEqual({ ok: true, user });
  });
});
