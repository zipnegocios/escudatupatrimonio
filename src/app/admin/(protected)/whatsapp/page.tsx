import { ChatInbox } from "@/presentation/admin/whatsapp/ChatInbox";
import { WhatsAppQrPanel } from "@/presentation/admin/whatsapp/WhatsAppQrPanel";

export default function AdminWhatsAppPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-text-primary">WhatsApp</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Gateway no oficial (Baileys) — vinculá el número escaneando el QR.
      </p>
      <div className="mt-4">
        <WhatsAppQrPanel />
      </div>
      <ChatInbox />
    </section>
  );
}
