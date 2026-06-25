"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function OrdersFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const initialStatus = searchParams.get("status") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "PENDING", label: "PENDING" },
    { value: "IN_PROGRESS", label: "IN PROGRESS" },
    { value: "COMPLETED", label: "COMPLETED" },
  ];

  const currentStatusLabel = statusOptions.find(opt => opt.value === status)?.label || "Semua Status";

  const initialMount = useRef(true);

  // Debounce search
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      
      if (status) {
        params.set("status", status);
      } else {
        params.delete("status");
      }
      
      params.set("page", "1");
      
      const newQueryString = params.toString();
      if (window.location.search !== `?${newQueryString}` && window.location.search !== newQueryString) {
        router.push(`?${newQueryString}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.status-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Cari Pesanan</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari Order ID, Pelanggan, atau Layanan..."
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
      <div className="md:w-1/3 relative status-dropdown">
        <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">Filter Status</label>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-between rounded-sm border-2 border-black px-4 py-3 font-bold text-black transition-all bg-white cursor-pointer ${isDropdownOpen ? 'border-violet-600 shadow-[4px_4px_0px_0px_rgba(124,58,237,1)]' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
        >
          {currentStatusLabel}
          <span className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute top-[100%] left-0 w-full mt-2 bg-white border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatus(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 font-bold border-b-2 border-black last:border-b-0 transition-colors ${status === option.value ? 'bg-[#c8ff00] text-black' : 'hover:bg-zinc-100 text-black'}`}
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
