"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { getSupabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

interface ChatRoom {
  roomId: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  roomId: string;
  customerName: string;
  senderRole: "CUSTOMER" | "ADMIN";
  message: string;
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
}

function AdminChatContent() {
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get("roomId");

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(initialRoomId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [showStarred, setShowStarred] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ""});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const showToastMsg = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/rooms");
      const data = await res.json();
      if (data.success) {
        let fetchedRooms = data.rooms as ChatRoom[];
        
        // If there's an initialRoomId from URL and it doesn't exist in the fetched rooms, add a temporary one
        if (initialRoomId && !fetchedRooms.some(r => r.roomId === initialRoomId)) {
          fetchedRooms = [{
            roomId: initialRoomId,
            customerName: initialRoomId.includes("@") ? initialRoomId.split("@")[0] : initialRoomId,
            lastMessage: "Belum ada pesan",
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0
          }, ...fetchedRooms];
        }

        setRooms(fetchedRooms);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [initialRoomId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Fetch messages for selected room
  useEffect(() => {
    if (!selectedRoom) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?roomId=${encodeURIComponent(selectedRoom)}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    fetchMessages();

    // Mark messages as read
    fetch("/api/chat/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: selectedRoom }),
    }).then(() => {
      // Dispatch event to update global unread count instantly
      window.dispatchEvent(new Event("chat-read"));
    }).catch(() => {});
  }, [selectedRoom]);

  const toggleStar = async (msgId: string, currentStatus: boolean) => {
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isStarred: !currentStatus } : m))
    );

    try {
      await fetch("/api/chat/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId, isStarred: !currentStatus }),
      });
      
      if (!currentStatus) {
        showToastMsg("Pesan berhasil disimpan! ⭐");
      } else {
        showToastMsg("Pesan dihapus dari tersimpan.");
      }
    } catch (err) {
      console.error("Failed to toggle star:", err);
      // Revert on error
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isStarred: currentStatus } : m))
      );
    }
  };

  // Subscribe to all chat messages via Supabase Realtime
  useEffect(() => {
    const sb = getSupabase();
    const channel = sb
      .channel("admin-chat-all")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ChatMessage",
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;

          // Update room list
          fetchRooms();

          // If the message is for the currently selected room, add it
          if (newMsg.roomId === selectedRoom) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Mark as read since admin is viewing
            if (newMsg.senderRole === "CUSTOMER") {
              fetch("/api/chat/read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: selectedRoom }),
              }).then(() => {
                window.dispatchEvent(new Event("chat-read"));
              }).catch(() => {});
            }
          }

          // Play sound for customer messages
          if (newMsg.senderRole === "CUSTOMER") {
            try {
              const audio = new Audio("/ting.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
          }
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [selectedRoom, fetchRooms]);

  // Send message as admin
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !selectedRoom) return;

    const trimmedInput = input.trim();
    setInput("");
    setIsSending(true);

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      roomId: selectedRoom,
      customerName: "Admin",
      senderRole: "ADMIN",
      message: trimmedInput,
      isRead: true,
      isStarred: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoom,
          customerName: "Admin",
          senderRole: "ADMIN",
          message: trimmedInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => {
          if (prev.some(m => m.id === data.message.id && m.id !== tempMsg.id)) {
            return prev.filter(m => m.id !== tempMsg.id);
          }
          return prev.map((m) => (m.id === tempMsg.id ? data.message : m));
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const selectedRoomData = rooms.find((r) => r.roomId === selectedRoom);

  const displayedMessages = showStarred
    ? messages.filter((m) => m.isStarred)
    : messages;

  return (
    <div>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-[#c8ff00] border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-10">
          <span className="w-3 h-3 bg-black rounded-full animate-bounce" />
          {toast.message}
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase text-black mb-2">Live Chat</h1>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
          Kelola percakapan pelanggan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-[600px] overflow-hidden">
        {/* ═══ Room List ═══ */}
        <div className="lg:col-span-4 border-r-2 border-black flex flex-col min-h-0">
          <div className="p-4 border-b-2 border-black bg-zinc-100 shrink-0">
            <h2 className="font-black uppercase text-sm tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-black inline-block" />
              Daftar Chat ({rooms.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingRooms ? (
              <div className="p-8 text-center">
                <span className="animate-spin text-2xl">⏳</span>
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Belum ada percakapan
                </p>
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.roomId}
                  onClick={() => setSelectedRoom(room.roomId)}
                  className={`w-full text-left p-4 border-b border-zinc-200 transition-colors relative ${
                    selectedRoom === room.roomId
                      ? "bg-[#c8ff00]/30 border-l-4 border-l-black"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-black uppercase text-sm truncate">
                        {room.customerName}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate mt-0.5">
                        {room.roomId}
                      </p>
                      <p className="text-xs text-zinc-500 truncate mt-1">
                        {room.lastMessage}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <span className="text-[9px] font-bold text-zinc-400">
                        {formatDate(room.lastMessageAt)}
                      </span>
                      {room.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-[#ff4081] border-2 border-black rounded-full flex items-center justify-center">
                          <span className="text-[9px] font-black text-white">
                            {room.unreadCount}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ═══ Chat Area ═══ */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          {!selectedRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 gap-3">
              <div className="text-6xl">💬</div>
              <p className="font-black uppercase text-lg text-zinc-300">Pilih Percakapan</p>
              <p className="text-xs text-zinc-400 max-w-[250px] text-center">
                Klik salah satu room di kiri untuk mulai membalas pelanggan
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b-2 border-black bg-black text-white shrink-0 flex items-center gap-3">
                <div className="w-3 h-3 bg-[#c8ff00] rounded-full animate-pulse" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    {selectedRoomData?.customerName || "Pelanggan"}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {selectedRoom}
                  </p>
                </div>
                <div className="ml-auto flex bg-white/10 rounded-sm p-1">
                  <button
                    onClick={() => setShowStarred(false)}
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all ${
                      !showStarred ? "bg-[#c8ff00] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "text-white hover:bg-white/20"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setShowStarred(true)}
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all ${
                      showStarred ? "bg-[#c8ff00] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "text-white hover:bg-white/20"
                    }`}
                  >
                    ⭐ Tersimpan
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 min-h-0">
                {displayedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <span className="text-3xl">🕊️</span>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      {showStarred ? "Belum ada pesan tersimpan" : "Belum ada pesan"}
                    </p>
                  </div>
                ) : (
                  displayedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderRole === "ADMIN" ? "justify-end" : "justify-start"
                      } group`}
                    >
                      <div className="flex items-start gap-2 max-w-[70%]">
                        {/* Star Button for CUSTOMER messages */}
                        {msg.senderRole === "CUSTOMER" && (
                          <button
                            onClick={() => toggleStar(msg.id, msg.isStarred)}
                            className={`mt-2 shrink-0 transition-opacity ${
                              msg.isStarred ? "opacity-100 text-[#ff4081]" : "opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-black"
                            }`}
                          >
                            <span className="text-lg">⭐</span>
                          </button>
                        )}

                        <div
                          className={`p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            msg.senderRole === "ADMIN"
                              ? "bg-[#c8ff00] text-black"
                              : "bg-white text-black"
                          }`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">
                            {msg.senderRole === "ADMIN" ? "Anda (Admin)" : msg.customerName}
                          </p>
                          <p className="text-sm font-medium leading-relaxed break-words">
                            {msg.message}
                          </p>
                          <p className="text-[9px] font-bold mt-1 text-zinc-400">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>

                        {/* Star Button for ADMIN messages */}
                        {msg.senderRole === "ADMIN" && (
                          <button
                            onClick={() => toggleStar(msg.id, msg.isStarred)}
                            className={`mt-2 shrink-0 transition-opacity ${
                              msg.isStarred ? "opacity-100 text-[#ff4081]" : "opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-black"
                            }`}
                          >
                            <span className="text-lg">⭐</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t-2 border-black bg-white flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Balas pesan pelanggan..."
                  className="flex-1 px-4 py-3 border-2 border-black text-sm font-medium focus:outline-none focus:border-violet-600 transition-colors placeholder:text-zinc-400"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="px-5 py-3 bg-violet-500 text-white border-2 border-black font-black text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? "..." : "Kirim"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex justify-center items-center py-20"><div className="animate-spin text-4xl">⏳</div></div>}>
      <AdminChatContent />
    </Suspense>
  );
}
