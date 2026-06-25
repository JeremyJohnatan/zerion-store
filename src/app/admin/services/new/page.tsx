"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import Link from "next/link";

export default function AddServicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    gameName: "",
    category: "",
    name: "",
    basePrice: "",
    description: "",
    type: "JOKI",
    isFeatured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let imageUrl = "";

      // 1. Upload image if exists
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok || !uploadResult.success) {
          throw new Error(uploadResult.error || "Gagal mengupload gambar");
        }
        
        imageUrl = uploadResult.fileUrl;
      }

      // 2. Save service data
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          basePrice: Number(formData.basePrice),
          imageUrl,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Gagal menyimpan layanan");
      }

      // Success
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/admin/services");
        router.refresh(); // Refresh server component data
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak terduga.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href="/admin/services"
          className="w-10 h-10 bg-white border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black hover:bg-zinc-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase text-black">Tambah Layanan Baru</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Isi detail katalog joki</p>
        </div>
      </div>

      <div className="bg-white border-2 border-black rounded-md p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        {error && (
          <div className="mb-6 p-4 border-2 border-black bg-[#ff4081] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Tipe Layanan</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all bg-white"
              >
                <option value="JOKI">Jasa Joki</option>
                <option value="APP_PREMIUM">App Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Nama Game / Aplikasi</label>
              <input
                type="text"
                required
                value={formData.gameName}
                onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
                className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                placeholder={formData.type === 'JOKI' ? "Contoh: Genshin Impact" : "Contoh: Netflix"}
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-3 p-4 border-2 border-black rounded-sm bg-[#c8ff00] cursor-pointer hover:bg-[#bbf000] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-6 h-6 border-2 border-black rounded-sm accent-violet-600 cursor-pointer"
              />
              <span className="font-black uppercase tracking-widest text-black text-sm">Tampilkan di Beranda (Featured)</span>
            </label>
          </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Kategori</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                placeholder="Contoh: Eksplorasi / Push Rank"
              />
            </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Nama Layanan Spesifik</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
              placeholder="Contoh: 100% Eksplorasi Natlan"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Harga Dasar (Rupiah)</label>
            <input
              type="text"
              required
              value={formData.basePrice ? Number(formData.basePrice).toLocaleString('id-ID') : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                setFormData({ ...formData, basePrice: rawValue });
              }}
              className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
              placeholder="Contoh: 150.000"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Upload Foto Thumbnail</label>
            <div className="border-2 border-dashed border-black rounded-sm p-6 text-center hover:bg-zinc-50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imagePreview ? (
                <div className="flex flex-col items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="h-32 object-contain border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Klik untuk mengganti gambar</span>
                </div>
              ) : (
                <div className="text-zinc-500">
                  <div className="text-4xl mb-2">📸</div>
                  <span className="text-xs font-bold uppercase tracking-widest">Klik atau tarik gambar ke sini</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Deskripsi Layanan</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
              placeholder="Jelaskan detail apa saja yang akan dikerjakan, estimasi waktu, dll."
            />
          </div>

          <div className="pt-4 border-t-2 border-black">
            <BrutalistButton type="submit" variant="primary" fullWidth className="h-14 text-base" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "💾 Simpan Layanan"}
            </BrutalistButton>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#bbf7d0] border-4 border-black p-8 rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center animate-in fade-in zoom-in duration-300 max-w-sm w-full mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black uppercase text-black mb-2">Berhasil!</h2>
            <p className="text-sm font-bold text-black uppercase tracking-widest mb-6">Data layanan telah ditambahkan</p>
            <BrutalistButton 
              variant="secondary" 
              onClick={() => {
                setShowSuccess(false);
                router.push("/admin/services");
                router.refresh();
              }}
              className="text-xs"
            >
              Tutup & Kembali
            </BrutalistButton>
          </div>
        </div>
      )}
    </div>
  );
}
