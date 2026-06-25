"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrutalistButton } from "@/components/ui/BrutalistButton";

export function OrderProgressEditor({ 
  id, 
  currentStatus,
  currentProgress, 
  currentEstimatedTime 
}: { 
  id: string, 
  currentStatus: string,
  currentProgress: number, 
  currentEstimatedTime: string 
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(currentProgress ?? 0);
  const [estimatedTime, setEstimatedTime] = useState(currentEstimatedTime || "");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/orders/${id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress, estimatedTime }),
      });
      const data = await res.json();
      
      if (!data.success) {
        showToast(data.error || "Gagal menyimpan perubahan", "error");
      } else {
        showToast("Perubahan berhasil disimpan!", "success");
        router.refresh();
      }
    } catch (error) {
      showToast("Terjadi kesalahan saat menyimpan perubahan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 relative">
      {toast && (
        <div className={`absolute -top-16 left-0 right-0 p-3 border-2 border-black rounded-sm text-center font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-4 fade-in duration-300 z-50 ${
          toast.type === 'success' ? 'bg-[#c8ff00] text-black' : 'bg-[#ff4081] text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
          Progress Pengerjaan ({progress}%)
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="5"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          disabled={isLoading || currentStatus !== 'IN_PROGRESS'}
          className="w-full accent-violet-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
          Estimasi Selesai
        </label>
        <input 
          type="text"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
          disabled={isLoading}
          placeholder="Contoh: Besok Malam"
          className="w-full px-3 py-2 text-sm font-bold border-2 border-black rounded-sm focus:outline-none focus:ring-0 focus:border-violet-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        />
      </div>

      <BrutalistButton 
        variant="primary" 
        onClick={handleSave} 
        disabled={isLoading}
        className="w-full py-2 text-xs"
      >
        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
      </BrutalistButton>
    </div>
  );
}
