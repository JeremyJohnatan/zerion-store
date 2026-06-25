"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (res?.error) {
      setError("Email atau password salah.");
    } else {
      // If callbackUrl exists, go there (e.g., /checkout)
      // Otherwise, go to home (for customers) or /admin/dashboard (we don't know their role directly here without fetching session, but they can navigate naturally)
      if (callbackUrl && callbackUrl !== "/") {
        router.push(callbackUrl);
      } else {
        // Just go to home page, if they are admin, they can click admin portal
        // Alternatively, hardcode redirect if email is admin email
        if (email === "admin@zerionstore.com") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <Link href="/" className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
          <div className="w-10 h-10 bg-[#c8ff00] border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <span className="text-black text-sm font-black">JP</span>
          </div>
          Zerion Store<span className="text-violet-600">.</span>
        </Link>

        <Link href="/" className="px-4 py-2 bg-violet-600 border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-violet-500 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2">
          <span className="text-sm leading-none">←</span> Kembali
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border-2 border-black rounded-md p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        <div className="absolute -top-3 -right-3 px-3 py-1 bg-[#c8ff00] border-2 border-black font-black text-[10px] uppercase tracking-widest rotate-3">
          Login Portal
        </div>

        <h2 className="text-2xl font-black uppercase text-black mb-6">Masuk Akun</h2>

        {isRegistered && (
          <div className="mb-4 p-3 border-2 border-black bg-[#c8ff00] text-black text-xs font-bold uppercase tracking-wider rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Pendaftaran berhasil! Silakan login.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 border-2 border-black bg-[#ff4081] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border-2 border-black p-4 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
              placeholder="admin@zerionstore.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border-2 border-black p-4 pr-12 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-violet-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <BrutalistButton type="submit" variant="primary" fullWidth disabled={isLoading} className="mt-4">
            {isLoading ? "Memproses..." : "Masuk →"}
          </BrutalistButton>
        </form>

        <p className="mt-6 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Belum punya akun? <Link href="/register" className="text-violet-600 hover:underline">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
