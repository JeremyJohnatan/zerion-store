"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok!");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mendaftar");
        setIsLoading(false);
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <Link href="/" className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
          <div className="w-10 h-10 bg-[#c8ff00] border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <span className="text-black text-sm font-black">JP</span>
          </div>
          Zerion Store<span className="text-violet-600">.</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border-2 border-black rounded-md p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        <div className="absolute -top-3 -right-3 px-3 py-1 bg-violet-500 text-white border-2 border-black font-black text-[10px] uppercase tracking-widest rotate-3">
          Member Baru
        </div>

        <h2 className="text-2xl font-black uppercase text-black mb-4">Daftar Akun</h2>

        {error && (
          <div className="mb-4 p-3 border-2 border-black bg-[#ff4081] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-sm border-2 border-black p-3 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border-2 border-black p-3 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-1">Nomor WhatsApp</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-sm border-2 border-black p-3 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
              placeholder="081234567890"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border-2 border-black p-3 pr-10 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-violet-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-1">Konfirmasi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-sm border-2 border-black p-3 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <BrutalistButton type="submit" variant="primary" fullWidth disabled={isLoading} className="mt-4">
            {isLoading ? "Memproses..." : "Daftar Sekarang →"}
          </BrutalistButton>
        </form>

        <p className="mt-6 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Sudah punya akun? <Link href="/login" className="text-violet-600 hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
