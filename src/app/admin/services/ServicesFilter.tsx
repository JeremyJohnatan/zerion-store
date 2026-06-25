"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function ServicesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const typeOptions = [
    { value: "", label: "Semua Tipe" },
    { value: "JOKI", label: "Jasa Joki" },
    { value: "APP_PREMIUM", label: "App Premium" },
  ];

  const currentTypeLabel = typeOptions.find(opt => opt.value === type)?.label || "Semua Tipe";

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      
      if (type) {
        params.set("type", type);
      } else {
        params.delete("type");
      }
      
      // Reset to page 1 on filter change
      params.set("page", "1");
      
      router.push(`?${params.toString()}`);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, type, router, searchParams]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.custom-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Cari Layanan</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama game, layanan..."
            className="w-full rounded-sm border-2 border-black px-4 py-3 font-bold text-black focus:outline-none focus:ring-0 focus:border-violet-600 focus:shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] transition-all bg-white pr-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-black text-white font-bold rounded-sm hover:bg-red-500 transition-colors"
              title="Hapus pencarian"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="md:w-1/3 relative custom-dropdown">
        <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Filter Tipe</label>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-between rounded-sm border-2 border-black px-4 py-3 font-bold text-black transition-all bg-white cursor-pointer ${isDropdownOpen ? 'border-violet-600 shadow-[4px_4px_0px_0px_rgba(124,58,237,1)]' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
        >
          {currentTypeLabel}
          <span className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute top-[100%] left-0 w-full mt-2 bg-white border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setType(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 font-bold border-b-2 border-black last:border-b-0 transition-colors ${type === option.value ? 'bg-[#c8ff00] text-black' : 'hover:bg-zinc-100 text-black'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
