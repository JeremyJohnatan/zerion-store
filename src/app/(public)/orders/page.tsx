"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BrutalistButton } from "@/components/ui/BrutalistButton";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  // Custom Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const ordersRes = await fetch("/api/user/orders");
      const ordersData = await ordersRes.json();
      if (ordersRes.ok && ordersData.success) {
        setOrders(ordersData.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const openReviewModal = async (serviceId: string, serviceName: string, orderId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedServiceName(serviceName);
    setSelectedOrderId(orderId);
    setReviewRating(5);
    setReviewComment("");
    setIsReviewModalOpen(true);
    setIsLoadingReview(true);

    try {
      const customerName = session?.user?.name || "Pelanggan";
      const res = await fetch(`/api/reviews?serviceId=${serviceId}&orderId=${orderId}&customerName=${encodeURIComponent(customerName)}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setReviewRating(data.data.rating);
        setReviewComment(data.data.comment || "");
      }
    } catch (error) {
      console.error("Failed to fetch existing review:", error);
    } finally {
      setIsLoadingReview(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          orderId: selectedOrderId,
          rating: reviewRating,
          comment: reviewComment,
          customerName: session?.user?.name || "Pelanggan",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Ulasan berhasil dikirim!", "success");
        setIsReviewModalOpen(false);
        fetchOrders();
      } else {
        showToast("Gagal mengirim ulasan: " + data.error, "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (status === "loading" || isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-8 py-12 md:py-20">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black leading-tight flex items-center gap-4">
          <div className="w-8 h-8 bg-[#ff4081] border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
          Riwayat Pesanan
        </h1>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">
          Pantau status pesanan dan pembayaran Anda
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="w-20 h-20 bg-zinc-100 border-4 border-black rounded-full mx-auto flex items-center justify-center mb-6">
            <span className="text-3xl">🛒</span>
          </div>
          <h3 className="text-2xl font-black uppercase text-black mb-4">Belum Ada Pesanan</h3>
          <p className="font-bold text-zinc-500 uppercase tracking-widest mb-8">
            Anda belum melakukan pemesanan layanan joki apapun.
          </p>
          <BrutalistButton variant="primary" onClick={() => router.push("/")} className="px-8">
            Mulai Pesan Sekarang
          </BrutalistButton>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const isPaid = order.paymentStatus === "PAID";
            const formattedPrice = new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(order.totalPrice);

            return (
              <div key={order.id} className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-6 mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">ID Pesanan</p>
                    <p className="font-bold text-2xl font-mono">{order.id}</p>
                    <p className="text-xs font-bold text-zinc-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`inline-block text-xs font-black uppercase tracking-widest px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white ${
                      order.status === "COMPLETED" ? "bg-[#25D366]" :
                      order.status === "IN_PROGRESS" ? "bg-blue-600" : "bg-orange-500"
                    }`}>
                      {order.status === "COMPLETED" ? "SELESAI" : order.status === "IN_PROGRESS" ? "DIPROSES" : "MENUNGGU"}
                    </span>
                    <span className={`inline-block text-xs font-black uppercase tracking-widest px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      isPaid ? "bg-[#c8ff00] text-black" : "bg-[#ff4081] text-white"
                    }`}>
                      {isPaid ? "LUNAS" : "BELUM BAYAR"}
                    </span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Item Pesanan</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {order.items.map((item: any, idx: number) => {
                      const userReview = order.reviews?.find((r: any) => r.serviceId === item.serviceId);

                      return (
                        <div key={idx} className="bg-zinc-50 border-2 border-black p-4 flex flex-col justify-between h-full gap-4">
                          <div>
                            <p className="font-black uppercase text-lg leading-tight">{item.service.name}</p>
                            <p className="text-sm font-bold text-zinc-600 mb-2">{item.service.gameName} (x{item.quantity})</p>
                            
                            {order.status === "COMPLETED" && userReview && (
                              <div className="mt-2 mb-2 p-3 bg-white border-2 border-dashed border-zinc-300 rounded-sm">
                                <div className="flex items-center gap-1 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-xs ${i < userReview.rating ? "opacity-100" : "opacity-20 grayscale"}`}>⭐</span>
                                  ))}
                                </div>
                                {userReview.comment && (
                                  <p className="text-xs font-medium text-zinc-600 italic">&quot;{userReview.comment}&quot;</p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {order.status === "COMPLETED" && (
                            <button
                              onClick={() => openReviewModal(item.serviceId, item.service.name, order.id)}
                              className="mt-auto self-start text-xs font-black uppercase tracking-widest px-4 py-2 border-2 border-black bg-[#c8ff00] text-black hover:bg-black hover:text-[#c8ff00] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              {userReview ? "Edit Ulasan" : "Beri Ulasan"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50 border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Pembayaran</p>
                    <p className="text-3xl font-black text-violet-600">{formattedPrice}</p>
                  </div>
                  <BrutalistButton 
                    variant="primary" 
                    onClick={() => router.push(isPaid ? `/track-order?id=${order.id}` : `/checkout/success/${order.id}`)}
                    className="w-full sm:w-auto h-14 px-8 text-base"
                  >
                    {isPaid ? "Lihat Detail" : "Bayar Sekarang"}
                  </BrutalistButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-8 relative">
            <button 
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-[#ff4081] border-2 border-black rounded-full flex items-center justify-center text-white font-black text-xl hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              ×
            </button>
            
            <h3 className="text-2xl font-black uppercase text-black mb-2">Beri Ulasan</h3>
            <p className="text-sm font-bold text-zinc-500 mb-6">{selectedServiceName}</p>

            {isLoadingReview ? (
              <div className="flex justify-center py-8"><span className="animate-spin text-3xl">⏳</span></div>
            ) : (
              <form onSubmit={submitReview} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-3">Rating (1-5 Bintang)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`w-12 h-12 border-2 border-black flex items-center justify-center text-2xl transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 ${
                          reviewRating >= star ? "bg-[#c8ff00] grayscale-0" : "bg-zinc-100 grayscale opacity-50"
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
                    className="w-full rounded-sm border-2 border-black p-4 font-medium text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all min-h-[120px] resize-none"
                    placeholder="Ceritakan pengalaman Anda menggunakan joki kami..."
                  ></textarea>
                </div>

                <BrutalistButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? "Mengirim..." : "Simpan Ulasan"}
                </BrutalistButton>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Custom Toast */}
      {toastMessage && (
        <div className={`fixed bottom-8 right-8 p-4 border-4 border-black font-black uppercase tracking-widest text-xs z-[200] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-8 ${
          toastType === "success" ? "bg-[#c8ff00] text-black" : "bg-[#ff4081] text-white"
        }`}>
          {toastMessage}
        </div>
      )}
    </main>
  );
}
