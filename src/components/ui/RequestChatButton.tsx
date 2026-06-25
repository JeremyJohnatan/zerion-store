"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BrutalistButton } from "./BrutalistButton";

interface Props {
  defaultMessage: string;
}

export function RequestChatButton({ defaultMessage }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleRequest = () => {
    if (!session) {
      setShowModal(true);
      return;
    }
    window.dispatchEvent(new CustomEvent("open-live-chat", { detail: { message: defaultMessage } }));
  };

  return (
    <>
      <button onClick={handleRequest} className="relative z-10 inline-flex items-center gap-2 bg-[#c8ff00] text-black font-black uppercase tracking-widest px-8 py-4 border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-[#c8ff00] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
        <span className="text-xl">💬</span>
        Request via Live Chat
      </button>

      {/* Brutalist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border-4 border-black p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 relative">
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#ff4081] rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-bounce">
              <span className="text-xl">🔒</span>
            </div>
            
            <h3 className="text-2xl font-black uppercase text-black mb-2">Akses Ditolak</h3>
            <p className="text-zinc-600 font-medium mb-8">
              Wah, Anda belum login! Silakan masuk ke akun Anda terlebih dahulu agar admin kami tahu siapa yang me-request game ini.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => router.push("/login")}
                className="w-full bg-violet-500 text-white font-black uppercase tracking-widest px-6 py-3 border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                Login Sekarang
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-white text-black font-black uppercase tracking-widest px-6 py-3 border-2 border-black rounded-sm hover:bg-zinc-100 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
