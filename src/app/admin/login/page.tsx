"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

const REASON_MESSAGES: Record<string, string> = {
  NOT_FOUND: "Usuario o contraseña incorrectos.",
  INVALID_PASSWORD: "Usuario o contraseña incorrectos.",
  INACTIVE: "Esta cuenta está desactivada.",
  INVALID_BODY: "Completá usuario y contraseña.",
};

function errorMessageFor(data: unknown): string {
  if (typeof data === "object" && data !== null && "reason" in data) {
    const reason = (data as { reason: unknown }).reason;
    if (typeof reason === "string" && reason in REASON_MESSAGES) {
      return REASON_MESSAGES[reason];
    }
  }
  return "No se pudo iniciar sesión.";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        setError(errorMessageFor(data));
        return;
      }

      // `refresh()` antes de navegar: el layout de /admin es un server
      // component y tiene que re-renderizar viendo la cookie recién seteada.
      router.refresh();
      router.push("/admin");
    } catch {
      setError("No se pudo conectar con el servidor. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex h-full items-center justify-center bg-bg-primary px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-border-card bg-bg-surface p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-text-primary">Panel de administración</h1>
        <p className="mt-1 text-sm text-text-muted">Ingresá con tu usuario o email.</p>

        <label className="mt-6 block text-sm font-medium text-text-secondary" htmlFor="identifier">
          Usuario o email
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          className="mt-1 w-full rounded-lg border border-border-card bg-bg-input px-3 py-2 text-text-primary outline-none focus:border-border-focus"
        />

        <label className="mt-4 block text-sm font-medium text-text-secondary" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-lg border border-border-card bg-bg-input px-3 py-2 text-text-primary outline-none focus:border-border-focus"
        />

        {error !== null && (
          <p role="alert" className="mt-4 rounded-lg bg-caution-bg px-3 py-2 text-sm text-caution">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-lg bg-bg-trust-dark px-4 py-2.5 font-medium text-text-ondark disabled:opacity-60"
        >
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
