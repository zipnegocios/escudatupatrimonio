"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconCalendarDays,
  IconClose,
  IconHome,
  IconLogout,
  IconMail,
  IconMenu,
  IconMessageCircle,
  IconUserCircle,
  IconUsers,
} from "@/presentation/admin/icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Inicio", icon: IconHome },
  { href: "/admin/leads", label: "Leads", icon: IconUsers },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: IconMessageCircle },
  { href: "/admin/email", label: "Emails", icon: IconMail },
  { href: "/admin/calendar", label: "Calendario", icon: IconCalendarDays },
  { href: "/admin/account", label: "Mi cuenta", icon: IconUserCircle },
];

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // "/admin" es exacto (si no, siempre quedaría marcado activo por ser
  // prefijo de todas las demás rutas); el resto es startsWith porque cada
  // sección tiene subrutas (ej. /admin/leads/[id]).
  const isActive = (href: string): boolean =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/admin/login");
  };

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsDrawerOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? "bg-trust-bg text-trust"
                : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-border-card bg-bg-surface px-3 py-4 md:flex">
        <p className="truncate px-3 pb-4 text-sm font-semibold text-text-primary">{name}</p>
        {navLinks}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-caution-bg hover:text-caution disabled:opacity-60"
        >
          <IconLogout size={18} />
          {isLoggingOut ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </aside>

      <header className="flex items-center justify-between border-b border-border-card bg-bg-surface px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Abrir menú"
          className="cursor-pointer text-text-secondary"
        >
          <IconMenu size={22} />
        </button>
        <p className="truncate text-sm font-medium text-text-primary">{name}</p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Cerrar sesión"
          className="cursor-pointer text-text-secondary disabled:opacity-60"
        >
          <IconLogout size={20} />
        </button>
      </header>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 cursor-pointer bg-[var(--bg-overlay)]"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-bg-surface px-3 py-4">
            <div className="mb-4 flex items-center justify-between px-3">
              <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="cursor-pointer text-text-secondary"
              >
                <IconClose size={20} />
              </button>
            </div>
            {navLinks}
          </div>
        </div>
      )}
    </>
  );
}
