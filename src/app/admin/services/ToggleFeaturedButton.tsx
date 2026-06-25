"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ToggleFeaturedButton({ id, initialStatus }: { id: string, initialStatus: boolean }) {
  const [isFeatured, setIsFeatured] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/services/${id}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (res.ok) {
        setIsFeatured(!isFeatured);
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal mengubah status sorotan");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleToggle} 
        disabled={isLoading}
        className={`text-xl transition-all hover:scale-125 ${isLoading ? 'opacity-50' : ''}`}
        title={isFeatured ? "Hapus dari Beranda" : "Tampilkan di Beranda"}
      >
        {isFeatured ? "⭐" : <span className="text-zinc-300">☆</span>}
      </button>

      {/* Brutalist Error Modal */}
      {errorMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border-4 border-black p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 relative text-left">
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#ff4081] rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-bounce">
              <span className="text-xl">⚠️</span>
            </div>
            
            <h3 className="text-2xl font-black uppercase text-black mb-2">Aksi Ditolak</h3>
            <p className="text-zinc-600 font-medium mb-8">
              {errorMsg}
            </p>
            
            <button 
              onClick={() => setErrorMsg("")}
              className="w-full bg-black text-white font-black uppercase tracking-widest px-6 py-3 border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
