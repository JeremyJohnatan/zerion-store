"use client";

import { useRef, useState, useEffect } from "react";

export function DraggableMarquee({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scrollPosRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationFrameId: number;

    const scroll = () => {
      if (!isDragging) {
        scrollPosRef.current += 0.5; // Slower speed
        
        // Reset to 0 when we reach exactly half of the scroll width
        // because we assume the children are exactly duplicated twice or more
        if (scrollPosRef.current >= el.scrollWidth / 2) {
          scrollPosRef.current = 0;
        }
        el.scrollLeft = scrollPosRef.current;
      } else {
        // Keep the ref synced with manual dragging
        scrollPosRef.current = el.scrollLeft;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // For touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (!scrollRef.current) return;
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollRef}
      className={`w-full flex overflow-x-hidden gap-6 px-4 py-4 ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* We add an inner wrapper to ensure the children are flexed correctly */}
      <div className="flex w-max gap-6 pointer-events-none">
        {children}
      </div>
    </div>
  );
}
