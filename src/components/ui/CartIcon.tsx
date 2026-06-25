"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const EMPTY_CART: any[] = [];

export const CartIcon = () => {
  const { data: session } = useSession();
  const userId = session?.user?.email || "guest";
  
  const items = useCartStore((state) => state.carts[userId] || EMPTY_CART);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) return null;

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 border-2 border-black rounded-sm bg-white hover:bg-[#c8ff00] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
      <span className="text-xl">🛒</span>
      {itemCount > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#ff4081] border-2 border-black rounded-full flex items-center justify-center">
          <span className="text-[10px] font-black text-white">{itemCount}</span>
        </div>
      )}
    </Link>
  );
};
