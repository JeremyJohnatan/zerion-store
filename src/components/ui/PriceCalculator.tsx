"use client";

import React, { useState } from 'react';
import { BrutalistButton } from './BrutalistButton';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useSession } from "next-auth/react";

interface PriceCalculatorProps {
  serviceId: string;
  gameName: string;
  title: string;
  basePrice: number;
  imageUrl?: string | null;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  serviceId,
  gameName,
  title,
  basePrice,
  imageUrl,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [details, setDetails] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.email || "guest";
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const totalPrice = basePrice * quantity;

  const formattedBasePrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(basePrice);

  const formattedTotalPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(totalPrice);

  const handleCheckout = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    const query = new URLSearchParams({
      serviceId,
      title,
      price: totalPrice.toString(),
      details,
    }).toString();
    router.push(`/checkout?${query}`);
  };

  const handleAddToCart = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    addItem(userId, {
      serviceId,
      title,
      gameName,
      quantity,
      details,
      basePrice,
      totalPrice,
      imageUrl: imageUrl || undefined,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-sm border-2 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
      <div className="absolute -top-3 -right-3 px-3 py-1 bg-violet-500 text-white border-2 border-black font-black text-[10px] uppercase tracking-widest rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        Pemesanan
      </div>
      
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-black">
        <div className="w-6 h-6 bg-[#c8ff00] border-2 border-black rounded-sm flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
        <h3 className="text-2xl font-black uppercase text-black tracking-tight">
          Kalkulator
        </h3>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Detail Layanan */}
        <div className="flex justify-between items-start pb-4 border-b-2 border-dashed border-zinc-200">
          <div className="pr-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{gameName}</p>
            <p className="font-bold text-black uppercase leading-tight">{title}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Harga Dasar</p>
            <p className="font-black text-black">{formattedBasePrice}</p>
          </div>
        </div>

        {/* Input Kuantitas / Target */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">
            Target / Jumlah Kuantitas
          </label>
          <div className="flex items-center gap-0 w-full md:w-3/4">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 flex-shrink-0 border-2 border-black bg-white flex items-center justify-center text-black font-black text-xl hover:bg-violet-500 hover:text-white transition-colors"
            >
              -
            </button>
            <div className="flex-1 h-12 border-y-2 border-black flex items-center justify-center bg-zinc-50">
              <span className="font-black text-xl text-black">{quantity}</span>
            </div>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 flex-shrink-0 border-2 border-black bg-white flex items-center justify-center text-black font-black text-xl hover:bg-violet-500 hover:text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Input Detail Spesifik */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">
            Catatan Spesifik (Level, Server, dll)
          </label>
          <textarea 
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full rounded-sm border-2 border-black p-4 min-h-[80px] font-bold text-sm text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all resize-y"
            placeholder="Ketik catatan di sini..."
          />
        </div>

        {/* Total Harga */}
        <div className="bg-[#c8ff00] rounded-sm p-4 mt-2 flex flex-col md:flex-row md:items-center justify-between border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/40 rotate-45 translate-x-8 -translate-y-8" />
          <span className="text-[10px] font-black uppercase tracking-widest text-black mb-1 md:mb-0">Total Tagihan</span>
          <span className="text-2xl md:text-3xl font-black text-black tracking-tight">{formattedTotalPrice}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <BrutalistButton 
            variant="secondary" 
            fullWidth 
            onClick={handleAddToCart} 
            className="h-14 text-sm"
          >
            {isAdded ? "✓ Masuk Keranjang" : "🛒 Tambah ke Keranjang"}
          </BrutalistButton>
          <BrutalistButton 
            variant="primary" 
            fullWidth 
            onClick={handleCheckout} 
            className="h-14 text-sm"
          >
            ⚡ Beli Langsung
          </BrutalistButton>
        </div>
      </div>
    </div>
  );
};
