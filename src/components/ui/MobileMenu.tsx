"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden flex items-center ml-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-[#c8ff00] border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center gap-1 z-[60] relative active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all"
      >
        <div className={`w-5 h-0.5 bg-black transition-all ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
        <div className={`w-5 h-0.5 bg-black transition-all ${isOpen ? 'opacity-0' : ''}`} />
        <div className={`w-5 h-0.5 bg-black transition-all ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
      </button>

      {/* Full screen menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-zinc-50 z-50 flex flex-col pt-24 px-8 pb-8 animate-in fade-in slide-in-from-top-10 duration-200">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          
          <nav className="flex flex-col gap-6 text-2xl font-black uppercase tracking-tight text-black relative z-10">
            <Link href="/katalog/joki" onClick={() => setIsOpen(false)} className="hover:text-violet-600 transition-colors border-b-4 border-black pb-4 hover:translate-x-2">
              Jasa Joki <span className="text-violet-600">→</span>
            </Link>
            <Link href="/katalog/apps" onClick={() => setIsOpen(false)} className="hover:text-[#b3e600] transition-colors border-b-4 border-black pb-4 hover:translate-x-2">
              App Premium <span className="text-[#b3e600]">→</span>
            </Link>
            <Link href="/track-order" onClick={() => setIsOpen(false)} className="hover:text-violet-600 transition-colors border-b-4 border-black pb-4 hover:translate-x-2">
              Lacak Pesanan <span className="text-violet-600">→</span>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
