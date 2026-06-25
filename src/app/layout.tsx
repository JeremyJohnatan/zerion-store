import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { LiveChatWidget } from "@/components/ui/LiveChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zerionstore.com"), // Replace with actual domain later
  title: {
    default: "Zerion Store - Layanan Joki Game Profesional",
    template: "%s | Zerion Store"
  },
  description: "Jasa joki game profesional #1 di Indonesia. Aman, cepat, dan terpercaya.",
  openGraph: {
    title: "Zerion Store - Layanan Joki Game Profesional",
    description: "Jasa joki game profesional #1 di Indonesia. Aman, cepat, dan terpercaya.",
    url: "https://zerionstore.com",
    siteName: "Zerion Store",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/iconlogo.png",
        width: 800,
        height: 600,
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Zerion Store - Layanan Joki Game Profesional",
    description: "Jasa joki game profesional #1 di Indonesia. Aman, cepat, dan terpercaya.",
    images: ["/iconlogo.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <LiveChatWidget />
        </Providers>
      </body>
    </html>
  );
}
