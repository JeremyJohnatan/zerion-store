"use client";

import { BrutalistButton } from "@/components/ui/BrutalistButton";

export function OpenChatButton({ 
  message, 
  className 
}: { 
  message: string; 
  className?: string;
}) {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent("open-live-chat", { detail: { message } })
    );
  };

  return (
    <BrutalistButton 
      variant="primary" 
      className={className}
      onClick={handleClick}
    >
      Hubungi Admin (Live Chat)
    </BrutalistButton>
  );
}
