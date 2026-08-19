"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface Conversation {
  id: string;
  remoteJid: string;
  displayName: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  kind: string;
  leadId: string | null;
}

interface Message {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  contentText: string | null;
  messageType: string;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  createdAt: string;
}

function MediaBubble({ message }: { message: Message }) {
  if (!message.mediaUrl) {
    return <span>{message.contentText ?? "(adjunto no disponible)"}</span>;
  }
  if (message.messageType === "IMAGE") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={message.mediaUrl} alt={message.contentText ?? "imagen"} className="max-w-full rounded-lg" />;
  }
  if (message.messageType === "VIDEO") {
    return <video src={message.mediaUrl} controls className="max-w-full rounded-lg" />;
  }
  if (message.messageType === "AUDIO" || message.messageType === "VOICE_NOTE") {
    return <audio src={message.mediaUrl} controls className="w-full" />;
  }
  return (
    <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="underline">
      {message.contentText ?? "Descargar archivo"}
    </a>
  );
}

type Tab = "UNCLASSIFIED" | "LEAD" | "DIRECT_CLIENT" | "IGNORED";

const TABS: { value: Tab; label: string }[] = [
  { value: "UNCLASSIFIED", label: "Sin clasificar" },
  { value: "LEAD", label: "Leads" },
  { value: "DIRECT_CLIENT", label: "Clientes directos" },
  { value: "IGNORED", label: "Ignoradas" },
];

export function ChatInbox() {
  const searchParams = useSearchParams();
  const startLeadId = searchParams.get("leadId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tab, setTab] = useState<Tab>("UNCLASSIFIED");
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [asVoiceNote, setAsVoiceNote] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [newLeadNombre, setNewLeadNombre] = useState("");
  const [creatingLead, setCreatingLead] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const pendingLeadIdRef = useRef<string | null>(null);

  useEffect(() => {
    const loadConversations = async (): Promise<void> => {
      const response = await fetch("/api/admin/whatsapp/conversations", { cache: "no-store" });
      const data = await response.json();
      if (data.ok) setConversations(data.conversations);
    };
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Si venimos desde "Escribir por WhatsApp" en el detalle de un lead
  // (?leadId=...), esa conversación ya se creó del lado del server — acá
  // solo hace falta seleccionarla apenas aparezca en la lista.
  useEffect(() => {
    if (!startLeadId) return;
    pendingLeadIdRef.current = startLeadId;
  }, [startLeadId]);

  useEffect(() => {
    if (!pendingLeadIdRef.current) return;
    const match = conversations.find((c) => c.leadId === pendingLeadIdRef.current);
    if (match) {
      setSelected(match);
      setTab(match.kind as Tab);
      pendingLeadIdRef.current = null;
    }
  }, [conversations]);

  useEffect(() => {
    if (!selected) return;
    const loadMessages = async (): Promise<void> => {
      const response = await fetch(`/api/admin/whatsapp/conversations/${selected.id}/messages`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (data.ok) setMessages(data.messages);
    };
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selected]);

  const visible = useMemo(
    () => conversations.filter((conversation) => conversation.kind === tab),
    [conversations, tab],
  );

  const classify = async (
    conversationId: string,
    kind: string,
    leadIdOverride?: string,
  ): Promise<void> => {
    const leadId = kind === "LEAD" ? (leadIdOverride ?? selected?.leadId ?? null) : null;
    await fetch(`/api/admin/whatsapp/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, leadId }),
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, kind, leadId } : c)),
    );
    if (selected?.id === conversationId) {
      setSelected((prev) => (prev ? { ...prev, kind, leadId } : prev));
    }
  };

  const handleDelete = async (conversationId: string): Promise<void> => {
    if (!window.confirm("¿Borrar esta conversación completa? Se pierden todos los mensajes.")) {
      return;
    }
    await fetch(`/api/admin/whatsapp/conversations/${conversationId}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (selected?.id === conversationId) {
      setSelected(null);
      setMessages([]);
    }
  };

  const handleSend = async (): Promise<void> => {
    if (!selected || draft.trim().length === 0) return;
    setSending(true);
    await fetch(`/api/admin/whatsapp/conversations/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remoteJid: selected.remoteJid, text: draft.trim() }),
    });
    setDraft("");
    setSending(false);
  };

  const handleAttach = async (file: File, forceVoiceNote?: boolean): Promise<void> => {
    if (!selected) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("remoteJid", selected.remoteJid);
    formData.append("asVoiceNote", String(forceVoiceNote ?? asVoiceNote));
    await fetch(`/api/admin/whatsapp/conversations/${selected.id}/media`, {
      method: "POST",
      body: formData,
    });
    setUploading(false);
  };

  const handleStartRecording = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Formato que Chrome/Edge/Firefox saben grabar sin librerías aparte —
    // el worker no necesita convertirlo, WhatsApp acepta ogg/opus.
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    recordedChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "nota-de-voz.webm", { type: "audio/webm" });
      void handleAttach(file, true);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const handleStopRecording = (): void => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleCreateLead = async (): Promise<void> => {
    if (!selected || newLeadNombre.trim().length === 0) return;
    setCreatingLead(true);
    const telefono = selected.remoteJid.split("@")[0];
    const response = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: newLeadNombre.trim(), telefono, canal: "WHATSAPP" }),
    });
    const data = await response.json();
    if (data.ok) {
      await classify(selected.id, "LEAD", data.lead.id);
      setNewLeadNombre("");
    }
    setCreatingLead(false);
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = conversations.filter((c) => c.kind === t.value).length;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTab(t.value);
                setSelected(null);
              }}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                tab === t.value
                  ? "border-text-primary text-text-primary"
                  : "border-border-card text-text-secondary"
              }`}
            >
              {t.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 rounded-xl border border-border-card md:grid-cols-3">
        <div className="border-border-card md:col-span-1 md:border-r">
          <ul>
            {visible.map((conversation) => (
              <li key={conversation.id} className="border-b border-border-card last:border-b-0">
                <button
                  type="button"
                  onClick={() => setSelected(conversation)}
                  className={`w-full px-4 py-3 text-left text-sm ${
                    selected?.id === conversation.id ? "bg-bg-surface" : ""
                  }`}
                >
                  <span className="block text-text-primary">
                    {conversation.displayName ?? conversation.remoteJid}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="text-xs text-text-secondary">
                      {conversation.unreadCount} sin leer
                    </span>
                  )}
                </button>

                {tab === "UNCLASSIFIED" && (
                  <div className="flex gap-2 px-4 pb-3">
                    <button
                      type="button"
                      onClick={() => classify(conversation.id, "DIRECT_CLIENT")}
                      className="rounded border border-border-card px-2 py-1 text-xs text-text-secondary"
                    >
                      Atender (cliente directo)
                    </button>
                    <button
                      type="button"
                      onClick={() => classify(conversation.id, "IGNORED")}
                      className="rounded border border-border-card px-2 py-1 text-xs text-caution"
                    >
                      Ignorar
                    </button>
                  </div>
                )}

                {tab === "IGNORED" && (
                  <div className="px-4 pb-3">
                    <button
                      type="button"
                      onClick={() => classify(conversation.id, "UNCLASSIFIED")}
                      className="rounded border border-border-card px-2 py-1 text-xs text-text-secondary"
                    >
                      Restaurar
                    </button>
                  </div>
                )}
              </li>
            ))}
            {visible.length === 0 && (
              <li className="px-4 py-3 text-sm text-text-secondary">Nada acá.</li>
            )}
          </ul>
        </div>

        <div className="flex flex-col md:col-span-2">
          {selected ? (
            <>
              <div className="flex items-center justify-between border-b border-border-card px-4 py-2">
                {selected.leadId ? (
                  <Link
                    href={`/admin/leads/${selected.leadId}`}
                    className="text-sm text-text-secondary underline"
                  >
                    Ver perfil del lead →
                  </Link>
                ) : (
                  <span className="text-sm text-text-secondary">Sin lead asociado</span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(selected.id)}
                  className="rounded border border-border-card px-2 py-1 text-xs text-caution"
                >
                  Borrar conversación
                </button>
              </div>

              {!selected.leadId && (
                <div className="flex items-center gap-2 border-b border-border-card px-4 py-2">
                  <input
                    type="text"
                    value={newLeadNombre}
                    onChange={(e) => setNewLeadNombre(e.target.value)}
                    placeholder="Nombre para crear perfil de lead…"
                    className="flex-1 rounded-lg border border-border-card px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCreateLead}
                    disabled={creatingLead || newLeadNombre.trim().length === 0}
                    className="rounded border border-border-card px-2 py-1 text-xs text-text-secondary disabled:opacity-60"
                  >
                    {creatingLead ? "Creando…" : "Crear perfil de lead"}
                  </button>
                </div>
              )}
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      message.direction === "OUTBOUND"
                        ? "ml-auto bg-bg-surface text-text-primary"
                        : "bg-bg-primary text-text-primary"
                    }`}
                  >
                    <MediaBubble message={message} />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 border-t border-border-card p-3">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <button
                    type="button"
                    onClick={recording ? handleStopRecording : handleStartRecording}
                    className={`rounded border px-2 py-1 ${
                      recording
                        ? "border-caution text-caution"
                        : "border-border-card text-text-secondary"
                    }`}
                  >
                    {recording ? "⏹ Detener y enviar nota de voz" : "🎤 Grabar nota de voz"}
                  </button>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={asVoiceNote}
                      onChange={(e) => setAsVoiceNote(e.target.checked)}
                    />
                    Enviar audio adjunto como nota de voz
                  </label>
                  <label className="cursor-pointer rounded border border-border-card px-2 py-1">
                    {uploading ? "Subiendo…" : "Adjuntar imagen/audio/video"}
                    <input
                      type="file"
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleAttach(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escribí un mensaje…"
                    className="flex-1 rounded-lg border border-border-card px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="rounded-lg bg-bg-surface px-3 py-2 text-sm text-text-primary disabled:opacity-60"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="p-4 text-sm text-text-secondary">Elegí una conversación.</p>
          )}
        </div>
      </div>
    </div>
  );
}
