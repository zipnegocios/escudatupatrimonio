import { currentUser } from "@/infrastructure/auth/current-user";
import { AccountSettingsForm } from "@/presentation/admin/account/AccountSettingsForm";

export default async function AdminAccountPage() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-text-primary">Mi cuenta</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Editá tus datos de acceso al panel — quedan guardados en la base de datos.
      </p>
      <div className="mt-6">
        <AccountSettingsForm
          user={{ username: user.username, email: user.email, displayName: user.displayName }}
        />
      </div>
    </section>
  );
}
