"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrutalistButton } from './BrutalistButton';
import { useCartStore } from '@/store/cartStore';
import { useSession } from "next-auth/react";

interface CheckoutFormProps {
  serviceId?: string;
  title?: string;
  price?: string;
  details?: string;
  initialName?: string;
  initialPhone?: string;
  fromCart?: boolean;
  selectedIds?: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  serviceId,
  title,
  price,
  details,
  initialName = '',
  initialPhone = '',
  fromCart = false,
  selectedIds = '',
}) => {
  const [customerName, setCustomerName] = useState(initialName);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user?.email || "guest";

  const getItems = useCartStore((state) => state.getItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);

  const allCartItems = getItems(userId);
  const selectedIdArray = selectedIds ? selectedIds.split(',') : [];
  const cartItems = fromCart && selectedIdArray.length > 0
    ? allCartItems.filter(item => selectedIdArray.includes(item.id))
    : allCartItems;

  const cartTotal = fromCart ? cartItems.reduce((acc, item) => acc + item.totalPrice, 0) : 0;

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine items and total price based on fromCart flag
  const itemsToCheckout = fromCart
    ? cartItems
    : [{ serviceId, title, quantity: 1, details, price: Number(price) || 0 }];

  const checkoutTotal = fromCart ? cartTotal : (Number(price) || 0);

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(checkoutTotal);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Mohon isi nama dan nomor telepon Anda.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          totalPrice: checkoutTotal,
          items: itemsToCheckout,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success && result.data?.id && result.data?.paymentUrl) {
        if (fromCart) {
          if (selectedIdArray.length > 0 && selectedIdArray.length < allCartItems.length) {
            // Remove only selected items
            selectedIdArray.forEach(id => removeItem(userId, id));
          } else {
            clearCart(userId);
          }
        }
        
        // Redirect to Xendit Invoice URL
        setIsRedirecting(true);
        window.location.href = result.data.paymentUrl;
        
      } else {
        alert("Gagal membuat pesanan: " + (result.error || "Unknown error"));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-md border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-2xl font-black uppercase text-black mb-6 flex items-center gap-2">
        <span className="w-4 h-4 bg-violet-500 border-2 border-black rounded-sm inline-block" />
        Detail Tagihan
      </h3>

      <div className="bg-zinc-50 rounded-sm border-2 border-dashed border-black mb-8">
        {mounted && itemsToCheckout.map((item, idx) => (
          <div key={idx} className="p-6 border-b-2 border-dashed border-zinc-200 last:border-b-0 space-y-4">
            <div className="flex justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Layanan</span>
              <span className="font-bold text-black uppercase text-right max-w-[60%]">{item.title} (x{item.quantity})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Instruksi Khusus</span>
              <span className="font-medium text-black text-right max-w-[60%] text-sm">{item.details || '-'}</span>
            </div>
          </div>
        ))}

        <div className="p-6 border-t-2 border-black bg-[#c8ff00] flex justify-between items-center rounded-b-sm">
          <span className="text-sm font-black uppercase tracking-widest text-black">Total Pembayaran</span>
          <span className="text-2xl font-black text-black">{formattedPrice}</span>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">Nama Lengkap</label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-sm border-2 border-black p-4 font-medium text-black focus:outline-none focus:ring-0 focus:border-[#c8ff00] focus:shadow-[4px_4px_0px_0px_rgba(200,255,0,1)] transition-all"
            placeholder="Masukkan nama Anda"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">Nomor Telepon / WA</label>
          <input
            type="tel"
            required
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full rounded-sm border-2 border-black p-4 font-medium text-black focus:outline-none focus:ring-0 focus:border-[#c8ff00] focus:shadow-[4px_4px_0px_0px_rgba(200,255,0,1)] transition-all"
            placeholder="Contoh: 081234567890"
          />
        </div>

        <BrutalistButton
          type="submit"
          variant="primary"
          fullWidth
          className="h-14 text-base mt-4 flex items-center justify-center gap-2"
          disabled={isLoading || isRedirecting}
        >
          {isRedirecting ? "Mengalihkan ke Xendit..." : isLoading ? "Memproses..." : "Buat Pesanan →"}
        </BrutalistButton>
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-4">
          Anda akan dialihkan ke halaman instruksi pembayaran.
        </p>
      </form>
    </div>
  );
};
