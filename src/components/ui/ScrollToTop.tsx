"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Handle scroll restoration on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    const timer = setTimeout(() => {
      const smoothScrollToTop = () => {
        const c = document.documentElement.scrollTop || document.body.scrollTop;
        if (c > 0) {
          window.requestAnimationFrame(smoothScrollToTop);
          window.scrollTo(0, c - Math.max(c / 10, 5)); // Scroll up by 10% or at least 5px
        }
      };
      smoothScrollToTop();
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
