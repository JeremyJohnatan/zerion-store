"use client";

import { useCartStore } from "@/store/cartStore";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const EMPTY_CART: any[] = [];

export default function CartPage() {
  const { data: session } = useSession();
  const userId = session?.user?.email || "guest";
  
  const removeItem = useCartStore(state => state.removeItem);
  const clearCart = useCartStore(state => state.clearCart);
  const updateItemDetails = useCartStore(state => state.updateItemDetails);
  
  const items = useCartStore(state => state.carts[userId] || EMPTY_CART);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({
    isOpen: false,
    message: "",
    onConfirm: () => {}
  });

  useEffect(() => {
    setMounted(true);
    // Auto select all by default when loaded
    if (items.length > 0 && selectedIds.length === 0) {
      setSelectedIds(items.map(i => i.id));
    }
  }, [items]);

  if (!mounted) {
    return (
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12 md:py-20 flex items-center justify-center">
        <span className="animate-spin text-4xl">⏳</span>
      </main>
    );
  }

  const handleCheckout = () => {
    if (selectedIds.length === 0) return;
    if (!session) {
      router.push('/login');
      return;
    }
    const queryParams = new URLSearchParams({ fromCart: 'true', selectedIds: selectedIds.join(',') });
    router.push(`/checkout?${queryParams.toString()}`);
  };

  const selectedItems = items.filter(i => selectedIds.includes(i.id));
  const totalPrice = selectedItems.reduce((acc, item) => acc + item.totalPrice, 0);

  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(totalPrice);

  if (items.length === 0) {
    return (
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12 md:py-20">
        <div className="bg-white border-2 border-black rounded-sm p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-black uppercase text-black mb-4">Keranjang Kosong</h1>
          <p className="text-zinc-500 font-bold mb-8">Belum ada layanan yang ditambahkan ke keranjang.</p>
          <Link href="/">
            <BrutalistButton variant="primary" className="h-14 px-8 text-base">
              Lihat Katalog Layanan
            </BrutalistButton>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12 md:py-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase text-black leading-tight flex items-center gap-4">
            <div className="w-8 h-8 bg-[#c8ff00] border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
            Keranjang Anda
          </h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">
            {items.length} Layanan dalam keranjang
          </p>
        </div>
        <button 
          onClick={() => {
            setConfirmModal({
              isOpen: true,
              message: "Yakin ingin mengosongkan semua isi keranjang?",
              onConfirm: () => {
                clearCart(userId);
                setConfirmModal({ ...confirmModal, isOpen: false });
              }
            });
          }}
          className="text-xs font-black uppercase tracking-widest text-[#ff4081] hover:underline"
        >
          Kosongkan Keranjang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="bg-white border-2 border-black rounded-sm p-4 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 border-2 border-black accent-[#c8ff00] rounded-sm"
                checked={selectedIds.length === items.length && items.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(items.map(i => i.id));
                  } else {
                    setSelectedIds([]);
                  }
                }}
              />
              <span className="font-black uppercase tracking-widest text-sm text-black">Pilih Semua ({items.length})</span>
            </label>
          </div>

          {items.map((item) => (
            <div key={item.id} className={`bg-white border-2 border-black rounded-sm p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative flex flex-col md:flex-row gap-6 transition-colors ${selectedIds.includes(item.id) ? 'bg-[#c8ff00]/10' : ''}`}>
              <div className="absolute top-4 left-4 z-10">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 border-2 border-black accent-[#c8ff00] rounded-sm bg-white"
                  checked={selectedIds.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([...selectedIds, item.id]);
                    } else {
                      setSelectedIds(selectedIds.filter(id => id !== item.id));
                    }
                  }}
                />
              </div>
              
              {/* Image Thumbnail */}
              <div className="w-full md:w-32 h-32 flex-shrink-0 border-2 border-black rounded-sm overflow-hidden bg-zinc-100 relative ml-8 md:ml-6">
                <img 
                  src={item.imageUrl || "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=1000&auto=format&fit=crop"} 
                  alt={item.title} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Details Section */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="inline-block px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-black border-2 border-black mb-2">
                      {item.gameName}
                    </span>
                    <h3 className="text-lg font-black uppercase text-black leading-tight mb-2">{item.title}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        message: "Yakin ingin menghapus item ini dari keranjang?",
                        onConfirm: () => {
                          removeItem(userId, item.id);
                          setConfirmModal({ ...confirmModal, isOpen: false });
                        }
                      });
                    }}
                    className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-[#ff4081] hover:text-white transition-colors group flex-shrink-0"
                    title="Hapus item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
                
                <div className="mt-auto">
                  <label className="font-black uppercase tracking-widest text-[9px] block text-black mb-1">Catatan Akun / Instruksi Spesifik:</label>
                  <textarea
                    value={item.details || ""}
                    onChange={(e) => updateItemDetails(userId, item.id, e.target.value)}
                    placeholder="Masukkan email, password, server, dsb..."
                    className="w-full bg-zinc-50 border-2 border-black p-3 text-xs font-medium text-black min-h-[60px] resize-y focus:outline-none focus:ring-0 focus:border-violet-600 transition-colors"
                  />
                </div>
              </div>
              
              {/* Pricing & Quantity Section */}
              <div className="flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end md:min-w-[140px] gap-3 pt-4 md:pt-0 border-t-2 md:border-t-0 border-dashed border-zinc-200">
                <div className="flex items-center gap-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <button 
                    onClick={() => {
                      if (item.quantity > 1) {
                        useCartStore.getState().updateQuantity(userId, item.id, -1);
                      } else {
                        setConfirmModal({
                          isOpen: true,
                          message: "Yakin ingin menghapus item ini dari keranjang?",
                          onConfirm: () => {
                            removeItem(userId, item.id);
                            setConfirmModal({ ...confirmModal, isOpen: false });
                          }
                        });
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center font-black text-lg hover:bg-zinc-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => useCartStore.getState().updateQuantity(userId, item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center font-black text-lg hover:bg-[#c8ff00] transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-black text-black text-xl leading-none">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.totalPrice)}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                    @ {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.basePrice)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white border-2 border-black rounded-sm p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-28">
            <h3 className="font-black uppercase text-xl mb-4 border-b-2 border-black pb-4">Ringkasan</h3>
            
            <div className="space-y-4 mb-6 border-b-2 border-black pb-6">
              <div className="flex justify-between text-sm font-bold items-center">
                <span className="text-zinc-500 uppercase tracking-wider">Subtotal</span>
                <span className="text-base text-black">{formattedTotal}</span>
              </div>
              <div className="flex justify-between text-sm font-bold items-center">
                <span className="text-zinc-500 uppercase tracking-wider">Pajak / Biaya</span>
                <span className="text-base text-black">Rp 0</span>
              </div>
            </div>

            <div className="flex flex-col mb-8 bg-zinc-50 border-2 border-black p-4 rounded-sm">
              <span className="font-black uppercase tracking-widest text-black text-[10px] mb-1">Total Pembayaran ({selectedIds.length} Layanan)</span>
              <span className="text-3xl font-black text-violet-600 break-words tracking-tight">{formattedTotal}</span>
            </div>

            <BrutalistButton 
              variant="primary" 
              fullWidth 
              onClick={handleCheckout} 
              className="h-14"
              disabled={selectedIds.length === 0}
            >
              {selectedIds.length === 0 ? 'Pilih Item Dulu' : 'Bayar Sekarang →'}
            </BrutalistButton>
            
            <Link href="/" className="block mt-4 text-center text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
              ← Tambah Joki Lain
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-4 border-black rounded-sm p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-black uppercase text-black mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm font-bold text-zinc-500 mb-8">{confirmModal.message}</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 px-4 py-3 border-2 border-black bg-zinc-100 text-black font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Batal
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="flex-1 px-4 py-3 border-2 border-black bg-[#ff4081] text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
