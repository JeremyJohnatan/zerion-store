"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BrutalistButton } from "@/components/ui/BrutalistButton";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isChangePassword, setIsChangePassword] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok && data.success) {
        setName(data.data.name);
        setEmail(data.data.email);
        setPhone(data.data.phone || "");
      } else {
        setMessage({ text: data.error || "Gagal memuat data profil", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Terjadi kesalahan sistem", type: "error" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    if (isChangePassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        setMessage({ text: "Semua kolom password wajib diisi", type: "error" });
        setIsLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ text: "Password baru dan konfirmasi tidak cocok!", type: "error" });
        setIsLoading(false);
        return;
      }
    }

    try {
      const payload: any = { name, email, phone };
      if (isChangePassword) {
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || "Gagal menyimpan perubahan", type: "error" });
      } else {
        setMessage({ text: "Profil berhasil diperbarui!", type: "success" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsChangePassword(false);
        // Force update session to reflect new name if it changed
        await update({ name, email });
      }
    } catch (err) {
      setMessage({ text: "Terjadi kesalahan sistem", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  );

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-8 py-12 md:py-20">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black leading-tight flex items-center gap-4">
          <div className="w-8 h-8 bg-violet-500 border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
          Profil Anda
        </h1>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">
          Kelola informasi akun Anda
        </p>
      </div>

      <div className="bg-white border-2 border-black rounded-md p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        {(session?.user as any)?.role === "ADMIN" && (
          <div className="absolute -top-3 -right-3 px-3 py-1 bg-[#c8ff00] text-black border-2 border-black font-black text-[10px] uppercase tracking-widest rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Admin Account
          </div>
        )}

        {message.text && (
          <div className={`mb-8 p-4 border-2 border-black text-xs font-bold uppercase tracking-wider rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            message.type === "error" ? "bg-[#ff4081] text-white" : "bg-[#bbf7d0] text-black"
          }`}>
            {message.type === "error" ? "⚠️ ERROR: " : "✅ SUKSES: "}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                disabled={(session?.user as any)?.role === "ADMIN"}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                disabled={(session?.user as any)?.role === "ADMIN"}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Nomor WhatsApp</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
              placeholder="081234567890"
              disabled={(session?.user as any)?.role === "ADMIN"}
            />
          </div>

          {(session?.user as any)?.role !== "ADMIN" && (
            <div className="pt-6 border-t-2 border-dashed border-zinc-200 mt-6">
              <label className="flex items-center gap-3 cursor-pointer group mb-6">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChangePassword}
                    onChange={(e) => setIsChangePassword(e.target.checked)}
                  />
                  <div className={`w-6 h-6 border-2 border-black rounded-sm flex items-center justify-center transition-all ${
                    isChangePassword ? 'bg-[#c8ff00]' : 'bg-white group-hover:bg-zinc-100'
                  }`}>
                    {isChangePassword && <span className="text-black font-black text-sm leading-none">✓</span>}
                  </div>
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-black group-hover:text-violet-600 transition-colors">
                  Ubah Password
                </span>
              </label>

              {isChangePassword && (
                <div className="space-y-6 bg-zinc-50 p-6 border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-4 duration-200">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Password Lama</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        required={isChangePassword}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full rounded-sm border-2 border-black p-4 pr-12 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-violet-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showOldPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Password Baru</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required={isChangePassword}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-sm border-2 border-black p-4 pr-12 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-violet-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Konfirmasi Password Baru</label>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required={isChangePassword}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-6">
            <BrutalistButton 
              type="submit" 
              variant="primary" 
              fullWidth 
              className="h-14 text-base"
              disabled={isLoading || (session?.user as any)?.role === "ADMIN"}
            >
              {isLoading ? "Menyimpan..." : "💾 Simpan Perubahan"}
            </BrutalistButton>
            
            {(session?.user as any)?.role === "ADMIN" && (
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-4">
                Akun admin tidak dapat diubah dari halaman ini.
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
