"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconCaretLeft,
  IconCheck,
  IconMic,
  IconPaperclip,
  IconRefresh,
  IconSearch,
  IconSend,
  IconStop,
  IconTrash,
  IconUserPlus,
} from "@/presentation/admin/icons";
import { Avatar } from "@/presentation/admin/whatsapp/Avatar";

interface Conversation {
  id: string;
  remoteJid: string;
  phoneNumber: string | null;
  displayName: string | null;
  avatarUrl: string | null;
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
  status: string;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  createdAt: string;
}

// Con @lid, remoteJid es un identificador opaco de WhatsApp, no el teléfono
// real — hay que preferir phoneNumber (resuelto en el backend) cuando existe.
function contactPhone(conversation: Conversation): string {
  return conversation.phoneNumber ?? conversation.remoteJid.split("@")[0];
}

function isLidJid(remoteJid: string): boolean {
  return remoteJid.endsWith("@lid") || remoteJid.endsWith("@hosted.lid");
}

function contactName(conversation: Conversation): string {
  return conversation.displayName ?? contactPhone(conversation);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.toDateString() === b.toDateString();
  if (sameDay(date, today)) return "Hoy";
  if (sameDay(date, yesterday)) return "Ayer";
  return date.toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" });
}

function MediaBubble({ message }: { message: Message }) {
  if (!message.mediaUrl) {
    return <span>{message.contentText ?? "(adjunto no disponible)"}</span>;
  }
  if (message.messageType === "IMAGE") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={message.mediaUrl}
        alt={message.contentText ?? "imagen"}
        className="max-w-full rounded-lg"
      />
    );
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
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [newLeadNombre, setNewLeadNombre] = useState("");
  const [creatingLead, setCreatingLead] = useState(false);
  const [resolvingPhone, setResolvingPhone] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const pendingLeadIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

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

    // Envuelto en una función local a propósito: el linter marca como
    // error llamar a un setState directo en el cuerpo síncrono de un
    // efecto (ver el mismo patrón en WhatsAppQrPanel).
    const resetForNewConversation = (): void => {
      // Se limpia al cambiar de conversación — si no, se ven por un
      // instante los mensajes de la conversación anterior mientras carga
      // la nueva.
      setMessages([]);
      previousMessageCountRef.current = 0;
    };
    resetForNewConversation();

    const loadMessages = async (): Promise<void> => {
      const response = await fetch(`/api/admin/whatsapp/conversations/${selected.id}/messages`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!data.ok) return;
      setMessages((prev) => {
        const prevById = new Map(prev.map((m) => [m.id, m]));
        // La URL firmada de un adjunto cambia en cada respuesta aunque sea
        // el mismo archivo — si se la reemplaza en cada poll, <audio>/
        // <video>/<img> reinician la carga solos cada 3s y cortan la
        // reproducción. Se conserva la URL ya vista para mensajes que ya
        // teníamos.
        return (data.messages as Message[]).map((incoming) => {
          const existing = prevById.get(incoming.id);
          if (existing?.mediaUrl && incoming.mediaUrl) {
            return { ...incoming, mediaUrl: existing.mediaUrl };
          }
          return incoming;
        });
      });
    };
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selected]);

  // Solo baja el scroll cuando realmente llegan mensajes nuevos — antes se
  // disparaba en cada poll (cada 3s) aunque no hubiera nada nuevo, lo que
  // se sentía como que "la pantalla salta sola" cada pocos segundos.
  useEffect(() => {
    if (messages.length > previousMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ block: "end" });
    }
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  const visible = useMemo(() => {
    const inTab = conversations.filter((conversation) => conversation.kind === tab);
    if (query.trim().length === 0) return inTab;
    const q = query.trim().toLowerCase();
    return inTab.filter((c) => contactName(c).toLowerCase().includes(q));
  }, [conversations, tab, query]);

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

  const handleResolvePhone = async (conversationId: string, remoteJid: string): Promise<void> => {
    setResolvingPhone(true);
    try {
      const response = await fetch(`/api/admin/whatsapp/conversations/${conversationId}/resolve-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remoteJid }),
      });
      const data = (await response.json()) as { ok: boolean; phoneNumber: string | null };
      if (data.ok && data.phoneNumber) {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, phoneNumber: data.phoneNumber } : c)),
        );
        if (selected?.id === conversationId) {
          setSelected((prev) => (prev ? { ...prev, phoneNumber: data.phoneNumber } : prev));
        }
      }
    } finally {
      setResolvingPhone(false);
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

  const handleAttach = async (file: File): Promise<void> => {
    if (!selected) return;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("remoteJid", selected.remoteJid);
    try {
      const response = await fetch(`/api/admin/whatsapp/conversations/${selected.id}/media`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setUploadError(data?.message ?? data?.reason ?? `Error ${response.status} al enviar.`);
      }
    } catch {
      setUploadError("No se pudo conectar con el servidor.");
    }
    setUploading(false);
  };

  const handleStartRecording = async (): Promise<void> => {
    setUploadError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setUploadError("No se pudo acceder al micrófono — revisá los permisos del navegador.");
      return;
    }
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
      void handleAttach(file);
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
    const telefono = contactPhone(selected);
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

  // Agrupa por día para los separadores tipo "Hoy" / "Ayer" / fecha.
  const messageGroups = useMemo(() => {
    const groups: { label: string; items: Message[] }[] = [];
    for (const message of messages) {
      const label = dayLabel(message.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.items.push(message);
      } else {
        groups.push({ label, items: [message] });
      }
    }
    return groups;
  }, [messages]);

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border-card">
      <div
        className="grid min-h-0 grid-cols-1 md:grid-cols-3"
        style={{ height: "min(75vh, 720px)" }}
      >
        {/* ---- Lista de conversaciones ---- */}
        <div
          className={`h-full min-h-0 flex-col border-border-card md:col-span-1 md:border-r ${
            selected ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="border-b border-border-card bg-wa-header px-3 py-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <IconSearch size={16} />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conversación"
                className="w-full rounded-full border border-border-card bg-bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
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
                    className={`cursor-pointer rounded-full px-2.5 py-1 text-xs transition-colors ${
                      tab === t.value
                        ? "bg-wa-accent-dark text-white"
                        : "bg-bg-surface text-text-secondary hover:bg-bg-elevated"
                    }`}
                  >
                    {t.label} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {visible.map((conversation) => (
              <li key={conversation.id} className="border-b border-border-subtle">
                <button
                  type="button"
                  onClick={() => setSelected(conversation)}
                  className={`flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-bg-elevated ${
                    selected?.id === conversation.id ? "bg-bg-elevated" : ""
                  }`}
                >
                  <Avatar name={contactName(conversation)} avatarUrl={conversation.avatarUrl} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-text-primary">
                        {contactName(conversation)}
                      </span>
                      {conversation.lastMessageAt && (
                        <span className="shrink-0 text-xs text-text-muted">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-text-muted">
                        {conversation.kind === "LEAD" ? "Lead" : conversation.kind === "DIRECT_CLIENT" ? "Cliente directo" : contactPhone(conversation)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-wa-accent px-1.5 text-[11px] font-medium text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </span>
                  </span>
                </button>

                {tab === "UNCLASSIFIED" && (
                  <div className="flex gap-2 px-3 pb-2.5 pl-[3.75rem]">
                    <button
                      type="button"
                      onClick={() => classify(conversation.id, "DIRECT_CLIENT")}
                      className="cursor-pointer rounded-full border border-border-card px-2.5 py-1 text-xs text-text-secondary hover:bg-bg-elevated"
                    >
                      Atender
                    </button>
                    <button
                      type="button"
                      onClick={() => classify(conversation.id, "IGNORED")}
                      className="cursor-pointer rounded-full border border-border-card px-2.5 py-1 text-xs text-caution hover:bg-caution-bg"
                    >
                      Ignorar
                    </button>
                  </div>
                )}

                {tab === "IGNORED" && (
                  <div className="px-3 pb-2.5 pl-[3.75rem]">
                    <button
                      type="button"
                      onClick={() => classify(conversation.id, "UNCLASSIFIED")}
                      className="cursor-pointer rounded-full border border-border-card px-2.5 py-1 text-xs text-text-secondary hover:bg-bg-elevated"
                    >
                      Restaurar
                    </button>
                  </div>
                )}
              </li>
            ))}
            {visible.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-text-secondary">Nada acá.</li>
            )}
          </ul>
        </div>

        {/* ---- Conversación activa ---- */}
        <div
          className={`h-full min-h-0 flex-col md:col-span-2 ${selected ? "flex" : "hidden md:flex"}`}
        >
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-border-card bg-wa-header px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="cursor-pointer text-text-secondary md:hidden"
                  aria-label="Volver a la lista"
                >
                  <IconCaretLeft />
                </button>
                <Avatar name={contactName(selected)} avatarUrl={selected.avatarUrl} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {contactName(selected)}
                  </p>
                  {selected.leadId ? (
                    <Link
                      href={`/admin/leads/${selected.leadId}`}
                      className="text-xs text-wa-accent-dark underline"
                    >
                      Ver perfil del lead →
                    </Link>
                  ) : (
                    <p className="text-xs text-text-muted">Sin lead asociado</p>
                  )}
                </div>
                {isLidJid(selected.remoteJid) && !selected.phoneNumber && (
                  <button
                    type="button"
                    onClick={() => handleResolvePhone(selected.id, selected.remoteJid)}
                    disabled={resolvingPhone}
                    title="Resolver número real"
                    aria-label="Resolver número real"
                    className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1.5 text-xs text-text-muted hover:bg-bg-elevated hover:text-text-primary disabled:opacity-50"
                  >
                    <IconRefresh size={15} />
                    {resolvingPhone ? "Resolviendo…" : "Resolver número"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(selected.id)}
                  title="Borrar conversación"
                  aria-label="Borrar conversación"
                  className="cursor-pointer rounded-full p-2 text-text-muted hover:bg-caution-bg hover:text-caution"
                >
                  <IconTrash size={18} />
                </button>
              </div>

              {!selected.leadId && (
                <div className="flex items-center gap-2 border-b border-border-card bg-bg-surface px-3 py-2">
                  <IconUserPlus size={16} />
                  <input
                    type="text"
                    value={newLeadNombre}
                    onChange={(e) => setNewLeadNombre(e.target.value)}
                    placeholder="Nombre para crear perfil de lead…"
                    className="flex-1 rounded-full border border-border-card px-3 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCreateLead}
                    disabled={creatingLead || newLeadNombre.trim().length === 0}
                    className="cursor-pointer rounded-full border border-border-card px-2.5 py-1 text-xs text-text-secondary hover:bg-bg-elevated disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingLead ? "Creando…" : "Crear perfil de lead"}
                  </button>
                </div>
              )}

              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto bg-wa-chat-bg p-4">
                {messageGroups.map((group) => (
                  <div key={group.label}>
                    <div className="my-2 flex justify-center">
                      <span className="rounded-lg bg-bg-surface px-3 py-1 text-xs text-text-muted shadow-sm">
                        {group.label}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {group.items.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                              message.messageType === "AUDIO" || message.messageType === "VOICE_NOTE"
                                ? "min-w-[250px]"
                                : ""
                            } ${
                              message.direction === "OUTBOUND"
                                ? "rounded-tr-sm bg-wa-bubble-out text-text-primary"
                                : "rounded-tl-sm bg-wa-bubble-in text-text-primary"
                            }`}
                          >
                            <MediaBubble message={message} />
                            <div className="mt-1 flex items-center justify-end gap-1">
                              <span className="text-[11px] text-text-muted">
                                {formatTime(message.createdAt)}
                              </span>
                              {message.direction === "OUTBOUND" && (
                                <IconCheck size={13} className="text-text-muted" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {uploadError && (
                <p className="border-t border-border-card bg-caution-bg px-3 py-2 text-sm text-caution">
                  {uploadError}
                </p>
              )}

              <div className="flex items-center gap-2 border-t border-border-card bg-wa-header p-2.5">
                <button
                  type="button"
                  onClick={recording ? handleStopRecording : handleStartRecording}
                  title={recording ? "Detener y enviar" : "Grabar nota de voz"}
                  aria-label={recording ? "Detener y enviar nota de voz" : "Grabar nota de voz"}
                  className={`cursor-pointer rounded-full p-2.5 transition-colors ${
                    recording
                      ? "bg-caution text-white"
                      : "text-text-secondary hover:bg-bg-elevated"
                  }`}
                >
                  {recording ? <IconStop size={18} /> : <IconMic size={18} />}
                </button>
                <label
                  title="Adjuntar imagen, video, audio o documento"
                  className="cursor-pointer rounded-full p-2.5 text-text-secondary hover:bg-bg-elevated"
                >
                  <IconPaperclip size={18} />
                  <input
                    type="file"
                    // Sin esto el selector de archivos ni siquiera dejaba
                    // elegir un PDF u otro documento — quedaban afuera del
                    // todo, no es que fallara el envío.
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleAttach(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSend();
                  }}
                  placeholder={uploading ? "Subiendo…" : "Escribí un mensaje…"}
                  disabled={uploading}
                  className="flex-1 rounded-full border border-border-card bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || draft.trim().length === 0}
                  aria-label="Enviar mensaje"
                  className="cursor-pointer rounded-full bg-wa-accent p-2.5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <IconSend size={17} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-wa-chat-bg p-4 text-center">
              <p className="text-sm text-text-secondary">Elegí una conversación para empezar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
