"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Template({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true); // Untuk handle fade-out sebelum unmount

  useEffect(() => {
    // Jalankan dari 0 setiap mount
    setLoading(true);
    setVisible(true);
    setProgress(0);

    // Animasi progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          return prev;
        }
        const increment = prev < 40 ? 15 : prev < 70 ? 8 : prev < 90 ? 4 : 2;
        return Math.min(prev + increment, 99);
      });
    }, 100);

    // Mulai fade out
    const fadeOutTimeout = setTimeout(() => {
      setVisible(false); // trigger fade out
    }, 800); // Muncul selama 800ms

    // Hapus dari DOM
    const removeTimeout = setTimeout(() => {
      setLoading(false);
    }, 1300); // 800ms + 500ms fade duration

    return () => {
      clearInterval(interval);
      clearTimeout(fadeOutTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  return (
    <>
      {loading && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-in-out ${visible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          {/* Brutalist Dotted Background (Menyesuaikan dengan page.tsx) */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #000 2px, transparent 2px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Brutalist Card Container */}
          <div className="relative z-10 w-80 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-6 transform -rotate-1">

            {/* Floating Image with Hard Shadow */}
            <div className="relative w-32 h-32 animate-bounce">
              <Image
                src="/livechat.png"
                alt="Loading Icon"
                fill
                sizes="128px"
                className="object-contain drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                priority
              />
            </div>

            {/* Teks Persentase */}
            <div className="text-6xl font-black text-black tracking-tighter">
              {progress}%
            </div>

            {/* Brutalist Loading Bar */}
            <div className="w-full h-6 bg-white border-2 border-black relative overflow-hidden">
              {/* Bar Fill */}
              <div
                className="absolute top-0 left-0 h-full bg-[#c8ff00] transition-all duration-300 ease-out border-r-2 border-black"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Teks Keterangan Label */}
            <div className="text-xs font-black text-black tracking-[0.2em] uppercase px-4 py-2 bg-[#c8ff00] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              Loading
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
