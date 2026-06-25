"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrutalistButton } from "@/components/ui/BrutalistButton";

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        router.refresh(); // Refresh the server component to fetch updated list
      } else {
        alert(data.error || "Gagal menghapus layanan");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="px-3 py-1 bg-[#ff4081] text-white border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50"
      >
        Hapus
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white border-4 border-black p-8 rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center animate-in fade-in zoom-in duration-200 max-w-sm w-full">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-black uppercase text-black mb-2">Hapus Layanan?</h2>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="flex gap-4">
              <BrutalistButton 
                variant="secondary" 
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="flex-1 text-xs px-2"
              >
                Batal
              </BrutalistButton>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-[#ff4081] text-white border-2 border-black rounded-sm text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
