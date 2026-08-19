import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { currentUser } from "@/infrastructure/auth/current-user";
import { AdminHeader } from "@/presentation/admin/AdminHeader";

/**
 * Portón de auth REAL (el proxy solo hace un chequeo optimista de cookie).
 * Vive en un route group `(protected)` y no en `admin/layout.tsx` porque ese
 * último también envolvería a /admin/login y armaría un bucle de redirects.
 */
export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (user === null) {
    redirect("/admin/login");
  }

  // globals.css pone overflow:hidden y user-select:none en el body para el
  // wizard; el admin necesita scrollear y poder seleccionar texto.
  return (
    <div className="flex h-full select-text flex-col bg-bg-primary">
      <AdminHeader name={user.displayName ?? user.username} />
      <main className="mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-y-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
