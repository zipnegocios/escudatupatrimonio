"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  createdAt: string;
}

type Tab = "UNCLASSIFIED" | "LEAD" | "DIRECT_CLIENT" | "IGNORED";

const TABS: { value: Tab; label: string }[] = [
  { value: "UNCLASSIFIED", label: "Sin clasificar" },
  { value: "LEAD", label: "Leads" },
  { value: "DIRECT_CLIENT", label: "Clientes directos" },
  { value: "IGNORED", label: "Ignoradas" },
];

export function ChatInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tab, setTab] = useState<Tab>("UNCLASSIFIED");
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

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

  const classify = async (conversationId: string, kind: string): Promise<void> => {
    await fetch(`/api/admin/whatsapp/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, leadId: kind === "LEAD" ? selected?.leadId : null }),
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, kind } : c)),
    );
    if (selected?.id === conversationId) {
      setSelected((prev) => (prev ? { ...prev, kind } : prev));
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
              {selected.kind === "LEAD" && selected.leadId && (
                <div className="border-b border-border-card px-4 py-2">
                  <Link
                    href={`/admin/leads/${selected.leadId}`}
                    className="text-sm text-text-secondary underline"
                  >
                    Ver perfil del lead →
                  </Link>
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
                    {message.contentText ?? "(sin texto)"}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 border-t border-border-card p-3">
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
            </>
          ) : (
            <p className="p-4 text-sm text-text-secondary">Elegí una conversación.</p>
          )}
        </div>
      </div>
    </div>
  );
}
