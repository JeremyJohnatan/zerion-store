"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { BrutalistButton } from '@/components/ui/BrutalistButton';
import { useSearchParams } from 'next/navigation';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [orderId, setOrderId] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Review states
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ text: "", type: "" });

  const fetchOrderData = async (idToFetch: string) => {
    if (!idToFetch) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const res = await fetch(`/api/orders/${idToFetch.trim()}`);
      const result = await res.json();

      if (res.ok && result.success && result.data) {
        const orderData = result.data;
        setSearchResult({
          id: orderData.id,
          status: orderData.status,
          serviceId: orderData.items?.[0]?.serviceId,
          serviceName: orderData.items?.[0]?.service?.name || "Layanan Joki",
          customerName: orderData.customerName,
          progress: `${orderData.progress || 0}%`,
          estimatedTime: orderData.estimatedTime || "Dalam antrean",
          lastUpdate: new Date(orderData.updatedAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });
          
        // Reset review states on new search
        setRating(5);
        setReviewComment("");
        setReviewMessage({ text: "", type: "" });
      } else {
        setSearchResult({ error: true });
      }
    } catch (error) {
      console.error("Tracking error:", error);
      setSearchResult({ error: true });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderData(orderId);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchResult?.serviceId || !searchResult?.id) return;

    setIsSubmittingReview(true);
    setReviewMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: searchResult.serviceId,
          orderId: searchResult.id,
          customerName: searchResult.customerName,
          rating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewMessage({ text: data.message || "Ulasan berhasil dikirim!", type: "success" });
      } else {
        setReviewMessage({ text: data.error || "Gagal mengirim ulasan.", type: "error" });
      }
    } catch (err) {
      setReviewMessage({ text: "Terjadi kesalahan sistem.", type: "error" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrderData(initialId);
    }
  }, [initialId]);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black leading-tight mb-4">
          Lacak Pesanan Anda
        </h1>
        <p className="text-lg text-zinc-500 font-medium">
          Masukkan ID Pesanan (Order ID) yang Anda dapatkan saat checkout untuk melihat status pengerjaan secara real-time.
        </p>
      </div>

      <div className="bg-white rounded-md border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 rounded-sm border-2 border-black px-6 py-4 font-black uppercase text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all placeholder:text-zinc-400 placeholder:normal-case placeholder:font-medium"
            placeholder="Masukkan Order ID (contoh: DUMMY-123)"
          />
          <BrutalistButton 
            type="submit" 
            variant="primary" 
            className="h-auto py-4 md:w-40 rounded-sm"
            disabled={isSearching}
          >
            {isSearching ? "Mencari..." : "Lacak"}
          </BrutalistButton>
        </form>

        {searchResult && !searchResult.error && (
          <div className="bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-black uppercase tracking-wider text-black mb-6 border-b-2 border-dashed border-zinc-200 pb-4">
              <span className="w-3 h-3 bg-violet-500 inline-block mr-2" />
              Detail Pesanan
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status Saat Ini</span>
                <span className={`px-3 py-1 border-2 border-black font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  searchResult.status === 'COMPLETED' ? 'bg-[#c8ff00] text-black' : 
                  searchResult.status === 'IN_PROGRESS' ? 'bg-violet-500 text-white' : 'bg-white text-black'
                }`}>
                  {searchResult.status === 'PENDING' ? 'PENDING' : 
                   searchResult.status === 'IN_PROGRESS' ? 'Sedang Diproses' : 
                   searchResult.status === 'COMPLETED' ? 'Selesai' : searchResult.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Layanan</span>
                <span className="text-black font-bold uppercase">{searchResult.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nama Pelanggan</span>
                <span className="text-black font-bold uppercase">{searchResult.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Estimasi Selesai</span>
                <span className="text-black font-bold uppercase">{searchResult.estimatedTime}</span>
              </div>
            </div>

            <div className="mt-8 border-t-2 border-black pt-6">
              <div className="flex justify-between text-[10px] font-black text-black mb-2 uppercase tracking-widest">
                <span>Progress Pengerjaan</span>
                <span>{searchResult.progress}</span>
              </div>
              <div className="w-full bg-zinc-100 border-2 border-black rounded-sm h-4 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative">
                <div 
                  className="bg-violet-500 h-full border-r-2 border-black transition-all duration-1000 ease-out"
                  style={{ width: searchResult.progress }}
                ></div>
                {/* Diagonal stripes overlay for progress bar */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)",
                    backgroundSize: "20px 20px"
                  }}
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-3 text-right">
                Update terakhir: {searchResult.lastUpdate}
              </p>
            </div>

            {/* Review Section */}
            {searchResult.status === 'COMPLETED' && (
              <div className="mt-8 border-t-4 border-black pt-8 animate-in fade-in duration-500">
                <h3 className="text-xl font-black uppercase text-black mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 bg-[#c8ff00] inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                  Berikan Ulasan Anda
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
                  Pesanan sudah selesai. Bagaimana pengalaman Anda?
                </p>

                {reviewMessage.text && (
                  <div className={`mb-6 p-4 border-2 border-black font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    reviewMessage.type === 'success' ? 'bg-[#c8ff00] text-black' : 'bg-[#ff4081] text-white'
                  }`}>
                    {reviewMessage.type === 'success' ? '✅ ' : '❌ '}{reviewMessage.text}
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Rating Bintang</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-3xl hover:scale-110 transition-transform ${
                            star <= rating ? "grayscale-0" : "grayscale opacity-50"
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Komentar (Opsional)</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Bagaimana pelayanan kami? Cepat? Memuaskan?"
                      className="w-full rounded-sm border-2 border-black p-4 font-medium text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all min-h-[100px]"
                    />
                  </div>

                  <BrutalistButton 
                    type="submit" 
                    variant="primary" 
                    fullWidth 
                    className="h-12 text-sm"
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
                  </BrutalistButton>
                </form>
              </div>
            )}
          </div>
        )}

        {searchResult?.error && (
          <div className="bg-[#ff4081] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md p-6 text-center animate-in fade-in duration-300">
            <p className="font-black uppercase tracking-wider mb-2">Pesanan tidak ditemukan!</p>
            <p className="text-xs font-bold">Pastikan Order ID yang Anda masukkan benar. Hubungi admin jika butuh bantuan.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex justify-center items-center py-20"><div className="animate-spin text-4xl">⏳</div></div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
