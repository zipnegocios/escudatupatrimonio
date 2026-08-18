import { currentUser } from "@/infrastructure/auth/current-user";

export default async function AdminHomePage() {
  // El layout ya redirigió si no había sesión; esta llamada sale de la caché
  // de `currentUser()` (mismo render pass) y solo sirve para estrechar el tipo.
  const user = await currentUser();
  if (user === null) {
    return null;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-text-primary">
        Bienvenido, {user.displayName ?? user.username}
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Panel de administración. Las secciones de leads, citas y WhatsApp llegan
        en los milestones siguientes.
      </p>
    </section>
  );
}
