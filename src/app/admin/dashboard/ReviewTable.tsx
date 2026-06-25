"use client";

import { useState } from "react";
import { BrutalistButton } from "@/components/ui/BrutalistButton";

export function ReviewTable({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map((r) => r.id === id ? { ...r, isFeatured: !currentStatus } : r));
      } else {
        alert("Gagal mengubah status ulasan.");
      }
    } catch (error) {
      alert("Terjadi kesalahan.");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + itemsPerPage);

  if (reviews.length === 0) {
    return (
      <div className="bg-white border-2 border-black rounded-md p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Belum ada ulasan dari pelanggan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#c8ff00] border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-black">
              <th className="p-4 border-r-2 border-black">Pelanggan</th>
              <th className="p-4 border-r-2 border-black">Layanan</th>
              <th className="p-4 border-r-2 border-black text-center">Rating</th>
              <th className="p-4 border-r-2 border-black">Komentar</th>
              <th className="p-4 text-center">Tampil di Beranda?</th>
            </tr>
          </thead>
          <tbody>
            {currentReviews.map((review) => (
              <tr key={review.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="p-4 border-r border-zinc-200 font-bold uppercase text-xs">{review.customerName}</td>
                <td className="p-4 border-r border-zinc-200 font-bold uppercase text-xs text-violet-600 max-w-[150px] truncate">{review.service.name}</td>
                <td className="p-4 border-r border-zinc-200 text-center text-sm font-bold">{review.rating} ⭐</td>
                <td className="p-4 border-r border-zinc-200 text-xs text-zinc-600 italic max-w-[250px] truncate">&quot;{review.comment || "-"}&quot;</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleFeatured(review.id, review.isFeatured)}
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors ${
                      review.isFeatured ? "bg-violet-500 text-white" : "bg-white text-black hover:bg-zinc-100"
                    }`}
                  >
                    {review.isFeatured ? "TAMPIL" : "SEMBUNYI"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="p-4 border-t-2 border-black flex items-center justify-between bg-zinc-50">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-black bg-white text-xs font-black uppercase disabled:opacity-50 hover:bg-zinc-100 transition-colors"
          >
            Prev
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-black bg-white text-xs font-black uppercase disabled:opacity-50 hover:bg-zinc-100 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
