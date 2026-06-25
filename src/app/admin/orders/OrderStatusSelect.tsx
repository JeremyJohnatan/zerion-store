"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderStatusSelect({ id, currentStatus }: { id: string, currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      
      if (!data.success) {
        showToast(data.error || "Gagal mengubah status", "error");
        setStatus(currentStatus); // Revert on failure
      } else {
        showToast("Status berhasil diubah!", "success");
        router.refresh();
      }
    } catch (error) {
      showToast("Terjadi kesalahan saat mengubah status", "error");
      setStatus(currentStatus);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block w-full min-w-[120px]">
      {toast && (
        <div className={`absolute bottom-full mb-2 left-0 right-0 p-2 border-2 border-black rounded-sm text-center font-black uppercase tracking-widest text-[8px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-2 fade-in duration-300 z-50 ${
          toast.type === 'success' ? 'bg-[#c8ff00] text-black' : 'bg-[#ff4081] text-white'
        }`}>
          {toast.message}
        </div>
      )}
      <select 
        value={status}
        onChange={handleChange}
        disabled={isLoading}
        className={`w-full px-2 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none appearance-none cursor-pointer disabled:opacity-50 transition-colors ${
          status === 'COMPLETED' ? 'bg-[#c8ff00] text-black' : 
          status === 'IN_PROGRESS' ? 'bg-violet-500 text-white' : 'bg-white text-black'
        }`}
      >
        <option value="PENDING" className="bg-white text-black">PENDING</option>
        <option value="IN_PROGRESS" className="bg-violet-500 text-white">IN PROGRESS</option>
        <option value="COMPLETED" className="bg-[#c8ff00] text-black">COMPLETED</option>
      </select>
      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-[10px] font-black">
        {isLoading ? "⏳" : "▼"}
      </div>
    </div>
  );
}
