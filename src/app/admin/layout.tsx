"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/chat/unread");
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    fetchUnreadCount();

    const sb = getSupabase();
    const chatChannel = sb
      .channel("admin-global-chat-notif")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ChatMessage" },
        (payload) => {
          // Play sound if it's a new message from CUSTOMER
          if (payload.eventType === "INSERT" && payload.new.senderRole === "CUSTOMER") {
            // Only play sound if we are not on the chat page
            if (!window.location.pathname.startsWith("/admin/chat")) {
              try {
                const audio = new Audio("/ting.mp3");
                audio.volume = 0.5;
                audio.play().catch(() => { });
              } catch { }
            }
          }
          // Refetch unread count on any change
          fetchUnreadCount();
        }
      )
      .subscribe();

    const orderChannel = sb
      .channel("admin-global-order-notif")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Order" },
        (payload) => {
          const oldRow = payload.old as any;
          const newRow = payload.new as any;

          // Hanya bunyi jika status pembayaran BERUBAH menjadi PAID
          if (oldRow.paymentStatus === "UNPAID" && newRow.paymentStatus === "PAID") {
            try {
              const audio = new Audio("/ting1.mp3");
              audio.volume = 1.0;
              audio.play().catch(() => { });
            } catch { }
          }
        }
      )
      .subscribe();

    // Listen for custom event from chat page to instantly update badge
    const handleReadEvent = () => fetchUnreadCount();
    window.addEventListener("chat-read", handleReadEvent);

    return () => {
      sb.removeChannel(chatChannel);
      sb.removeChannel(orderChannel);
      window.removeEventListener("chat-read", handleReadEvent);
    };
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="font-black text-xl animate-pulse">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-sans text-black">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b-2 md:border-b-0 md:border-r-2 border-black flex flex-col z-10 shadow-[4px_0_0_0_rgba(0,0,0,1)]">
        <div className="p-6 border-b-2 border-black bg-[#c8ff00]">
          <Link href="/admin/dashboard" className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            Admin<span className="text-violet-600">.</span>
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 mt-1">Zerion Store Dashboard</p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link
            href="/admin/dashboard"
            className={`px-4 py-3 text-sm font-black uppercase tracking-wider rounded-sm transition-all border-2 ${pathname === "/admin/dashboard"
                ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]"
                : "bg-white text-black border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
          >
            📊 Analytics
          </Link>
          <Link
            href="/admin/orders"
            className={`px-4 py-3 text-sm font-black uppercase tracking-wider rounded-sm transition-all border-2 ${pathname?.startsWith("/admin/orders")
                ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]"
                : "bg-white text-black border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
          >
            🛒 Pesanan
          </Link>
          <Link
            href="/admin/services"
            className={`px-4 py-3 text-sm font-black uppercase tracking-wider rounded-sm transition-all border-2 ${pathname?.startsWith("/admin/services")
                ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]"
                : "bg-white text-black border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
          >
            🎮 Layanan
          </Link>
          <Link
            href="/admin/chat"
            className={`px-4 py-3 text-sm font-black uppercase tracking-wider rounded-sm transition-all border-2 ${pathname?.startsWith("/admin/chat")
                ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]"
                : "bg-white text-black border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
          >
            💬 Live Chat
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-[#ff4081] text-white text-[10px] font-black rounded-full border border-black animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="p-4 border-t-2 border-black">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-2">Akun</div>
          <p className="font-bold text-sm px-2 mb-4 truncate">{session?.user?.email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full px-4 py-3 text-sm font-black uppercase tracking-wider text-white bg-[#ff4081] border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 relative overflow-y-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
