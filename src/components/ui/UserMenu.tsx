"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function UserMenu({ name, role }: { name: string; role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-black uppercase text-black flex items-center gap-1 hover:text-violet-600 transition-colors"
      >
        Halo, {name}!
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-6 w-48 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden">
          <div className="py-2 flex flex-col">
            <Link 
              href="/profile" 
              className="px-4 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-[#c8ff00] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Edit Profil
            </Link>
            <Link 
              href="/orders" 
              className="px-4 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-[#c8ff00] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Riwayat Pesanan
            </Link>
            {role === "ADMIN" && (
              <Link 
                href="/admin/dashboard" 
                className="px-4 py-3 text-xs font-black uppercase tracking-widest text-violet-600 hover:bg-zinc-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            <div className="border-t-2 border-dashed border-zinc-200 mt-1 pt-2 px-2 flex justify-center">
               <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
