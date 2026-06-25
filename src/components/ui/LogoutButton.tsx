"use client";

import { signOut } from "next-auth/react";
import { BrutalistButton } from "./BrutalistButton";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="h-10 px-4 border-2 border-black bg-white text-black font-black uppercase text-[10px] tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff4081] hover:text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
    >
      Keluar
    </button>
  );
}
