"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AccountUser {
  username: string;
  email: string;
  displayName: string | null;
}

const PROFILE_ERROR_LABEL: Record<string, string> = {
  USERNAME_TAKEN: "Ese nombre de usuario ya está en uso.",
  EMAIL_TAKEN: "Ese email ya está en uso.",
  INVALID_BODY: "Revisá los datos ingresados.",
};

const PASSWORD_ERROR_LABEL: Record<string, string> = {
  INVALID_CURRENT_PASSWORD: "La contraseña actual no es correcta.",
  INVALID_BODY: "La contraseña nueva debe tener al menos 8 caracteres.",
};

export function AccountSettingsForm({ user }: { user: AccountUser }) {
  const router = useRouter();

  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (): Promise<void> => {
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    const response = await fetch("/api/admin/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, displayName: displayName || null }),
    });

    setSavingProfile(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setProfileError(
        PROFILE_ERROR_LABEL[data?.reason as string] ?? "No se pudieron guardar los cambios.",
      );
      return;
    }

    setProfileSuccess(true);
    router.refresh();
  };

  const handleChangePassword = async (): Promise<void> => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setSavingPassword(true);
    const response = await fetch("/api/admin/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSavingPassword(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setPasswordError(
        PASSWORD_ERROR_LABEL[data?.reason as string] ?? "No se pudo cambiar la contraseña.",
      );
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border-card bg-bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">Perfil</h2>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="type-caption mb-1 block">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="type-caption mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="type-caption mb-1 block">Nombre para mostrar</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
            />
          </div>
        </div>

        {profileError && <p className="mt-2 text-sm text-caution">{profileError}</p>}
        {profileSuccess && <p className="mt-2 text-sm text-text-secondary">Guardado.</p>}

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="mt-4 rounded-lg bg-bg-primary px-4 py-2 text-sm text-text-primary disabled:opacity-60"
        >
          {savingProfile ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      <div className="rounded-xl border border-border-card bg-bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">Cambiar contraseña</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Al cambiarla, se cierran todas tus demás sesiones activas.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="type-caption mb-1 block">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="type-caption mb-1 block">Contraseña nueva</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="type-caption mb-1 block">Confirmar contraseña nueva</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
            />
          </div>
        </div>

        {passwordError && <p className="mt-2 text-sm text-caution">{passwordError}</p>}
        {passwordSuccess && (
          <p className="mt-2 text-sm text-text-secondary">Contraseña actualizada.</p>
        )}

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={savingPassword}
          className="mt-4 rounded-lg bg-bg-primary px-4 py-2 text-sm text-text-primary disabled:opacity-60"
        >
          {savingPassword ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </div>
    </div>
  );
}
