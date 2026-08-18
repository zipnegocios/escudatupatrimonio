"use client";

import { useEffect, useState } from "react";

interface Conversation {
  id: string;
  remoteJid: string;
  displayName: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface Message {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  contentText: string | null;
  createdAt: string;
}

export function ChatInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
    <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-border-card md:grid-cols-3">
      <div className="border-border-card md:col-span-1 md:border-r">
        <ul>
          {conversations.map((conversation) => (
            <li key={conversation.id}>
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
            </li>
          ))}
          {conversations.length === 0 && (
            <li className="px-4 py-3 text-sm text-text-secondary">Sin conversaciones aún.</li>
          )}
        </ul>
      </div>

      <div className="flex flex-col md:col-span-2">
        {selected ? (
          <>
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
  );
}
