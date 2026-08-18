"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminHeader({ name }: { name: string }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // `refresh()` invalida el render cacheado del server component antes de
    // navegar; sin esto el shell del admin puede volver a pintarse con el
    // usuario viejo.
    router.refresh();
    router.push("/admin/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-border-card bg-bg-surface px-4 py-3">
      <span className="text-sm font-medium text-text-primary">{name}</span>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-lg border border-border-card px-3 py-1.5 text-sm text-text-secondary disabled:opacity-60"
      >
        {isLoggingOut ? "Saliendo…" : "Cerrar sesión"}
      </button>
    </header>
  );
}
