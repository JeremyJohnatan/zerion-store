"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

interface ChatMessage {
  id: string;
  roomId: string;
  customerName: string;
  senderRole: "CUSTOMER" | "ADMIN";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function LiveChatWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use email as roomId, or a persistent guest ID
  const roomId = session?.user?.email || (() => {
    if (typeof window === "undefined") return "guest";
    let guestId = localStorage.getItem("zerionstore-guest-id");
    if (!guestId) {
      guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("zerionstore-guest-id", guestId);
    }
    return guestId;
  })();

  const customerName = session?.user?.name || session?.user?.email || "Pelanggan";

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history when widget opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?roomId=${encodeURIComponent(roomId)}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchMessages();
  }, [isOpen, roomId]);

  // Subscribe to Supabase Realtime
  useEffect(() => {
    const sb = getSupabase();
    const channel = sb
      .channel(`chat-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ChatMessage",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.senderRole === "ADMIN") {
            setHasNewMessage(true);
            try {
              const audio = new Audio("/ting.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => { });
            } catch { }
          }
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [roomId]);

  // Listen for external open event
  useEffect(() => {
    const handleOpenChat = (e: CustomEvent<{ message?: string }>) => {
      setIsOpen(true);
      if (e.detail?.message) {
        setInput(e.detail.message);
      }
    };
    window.addEventListener("open-live-chat" as any, handleOpenChat as any);
    return () => window.removeEventListener("open-live-chat" as any, handleOpenChat as any);
  }, []);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const trimmedInput = input.trim();
    setInput("");
    setIsSending(true);

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      roomId,
      customerName,
      senderRole: "CUSTOMER",
      message: trimmedInput,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          customerName,
          senderRole: "CUSTOMER",
          message: trimmedInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? data.message : m))
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Don't show widget on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* ═══════ Chat Window ═══════ */}
      {isOpen && (
        <div className="w-[380px] h-[520px] bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-0">
          {/* Header */}
          <div className="bg-black text-white px-5 py-4 flex justify-between items-center border-b-4 border-[#c8ff00] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#c8ff00] rounded-full animate-pulse" />
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">
                  Live Chat
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Zerion Store Support
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/10 border-2 border-white/30 flex items-center justify-center text-white font-black text-sm hover:bg-[#ff4081] hover:border-[#ff4081] transition-all"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="text-4xl">💬</div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Mulai Percakapan
                </p>
                <p className="text-[10px] text-zinc-400 max-w-[200px]">
                  Kirim pesan dan admin kami akan segera membalas!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderRole === "CUSTOMER"
                    ? "justify-end"
                    : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[75%] p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${msg.senderRole === "CUSTOMER"
                      ? "bg-violet-500 text-white"
                      : "bg-white text-black"
                      }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                      {msg.senderRole === "CUSTOMER" ? "Anda" : "Admin"}
                    </p>
                    <p className="text-sm font-medium leading-relaxed break-words">
                      {msg.message}
                    </p>
                    <p
                      className={`text-[9px] font-bold mt-1 ${msg.senderRole === "CUSTOMER"
                        ? "text-white/60"
                        : "text-zinc-400"
                        }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t-4 border-black bg-white flex gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 px-4 py-3 border-2 border-black text-sm font-medium focus:outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-400"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="px-4 py-3 bg-[#c8ff00] border-2 border-black font-black text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? "..." : "Kirim"}
            </button>
          </form>
        </div>
      )}

      {/* ═══════ Toggle Button ═══════ */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setHasNewMessage(false);
        }}
        className="w-14 h-14 bg-black border-2 border-black text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all relative"
      >
        <span className="text-2xl">{isOpen ? "✕" : "💬"}</span>
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff4081] border-2 border-black rounded-full animate-bounce" />
        )}
      </button>
    </div>
  );
}
