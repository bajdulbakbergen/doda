"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter } from "next-intl";
import { Avatar } from "@/shared/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/shared/lib/cn";

type Message = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
};

type Sender = {
  id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
};

type Props = {
  conversationId: string;
  initialMessages: Message[];
  myUserId: string;
  participants: Sender[];
};

export function MessageThreadRealtime({
  conversationId,
  initialMessages,
  myUserId,
  participants,
}: Props) {
  const format = useFormatter();
  const [messages, setMessages] = useState(initialMessages);
  const containerRef = useRef<HTMLDivElement>(null);
  const senderMap = new Map(participants.map((p) => [p.id, p]));

  useEffect(() => {
    const supabase = createClient();

    // Помечаем диалог прочитанным
    void supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId });

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg],
          );
          if (newMsg.sender_id !== myUserId) {
            void supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, myUserId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div
        ref={containerRef}
        className="border-foreground/10 flex flex-1 items-center justify-center rounded-2xl border p-12 text-center"
      >
        <p className="text-foreground/60 text-sm">Начните диалог первым сообщением</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="border-foreground/10 flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border p-4"
      style={{ minHeight: "400px", maxHeight: "60vh" }}
    >
      {messages.map((msg, i) => {
        const isMine = msg.sender_id === myUserId;
        const sender = senderMap.get(msg.sender_id);
        const showHeader =
          i === 0 || messages[i - 1].sender_id !== msg.sender_id;
        const time = format.dateTime(new Date(msg.created_at), { timeStyle: "short" });

        return (
          <div
            key={msg.id}
            className={cn("flex items-end gap-2", isMine ? "flex-row-reverse" : "flex-row")}
          >
            {showHeader && sender ? (
              <Avatar src={sender.avatar_url} alt={sender.display_name} size={28} />
            ) : (
              <div className="size-7 shrink-0" />
            )}
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                isMine
                  ? "bg-foreground text-background rounded-br-md"
                  : "bg-foreground/5 rounded-bl-md",
              )}
            >
              {showHeader && sender && !isMine ? (
                <div className="text-foreground/70 mb-1 text-xs font-medium">
                  {sender.display_name}
                </div>
              ) : null}
              <div className="whitespace-pre-wrap break-words">{msg.body}</div>
              <div
                className={cn(
                  "mt-0.5 text-[11px] tabular-nums",
                  isMine ? "text-background/60" : "text-foreground/40",
                )}
              >
                {time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
