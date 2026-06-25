import { BrutalistButton } from "@/components/ui/BrutalistButton";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { CartIcon } from "@/components/ui/CartIcon";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserMenu } from "@/components/ui/UserMenu";
import { MobileMenu } from "@/components/ui/MobileMenu";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Header / Navbar — Zen White with hard border */}
      <header className="w-full px-8 py-4 flex justify-between items-center sticky top-0 z-50 bg-white border-b-2 border-black">
        <Link
          href="/"
          className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-white border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
            <Image src="/icon.svg" alt="Zerion Store Logo" width={32} height={32} className="object-contain" />
          </div>
          Zerion Store<span className="text-violet-600">.</span>
        </Link>

        <nav className="hidden md:flex gap-8 font-bold text-xs uppercase tracking-widest text-zinc-500 items-center">
          <div className="relative group cursor-pointer py-2">
            <span className="hover:text-black transition-colors flex items-center gap-1">
              Katalog <span className="text-[8px] transform group-hover:rotate-180 transition-transform">▼</span>
            </span>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col z-50">
              <Link href="/katalog/apps" className="px-4 py-3 hover:bg-[#c8ff00] hover:text-black border-b-2 border-black transition-colors font-black text-black">
                App Premium
              </Link>
              <Link href="/katalog/joki" className="px-4 py-3 hover:bg-violet-500 hover:text-white transition-colors font-black text-black">
                Jasa Joki
              </Link>
            </div>
          </div>
          <Link href="/track-order" className="hover:text-black transition-colors py-2">
            Lacak Pesanan
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <CartIcon />

          {session?.user ? (
            <div className="flex items-center gap-4 border-l-2 border-zinc-200 pl-4">
              <UserMenu
                name={session.user.name?.split(" ")[0] || "User"}
                role={(session.user as any).role || "USER"}
              />
            </div>
          ) : (
            <div className="border-l-2 border-zinc-200 pl-4">
              <Link href="/login">
                <BrutalistButton variant="primary" className="h-10 px-5 text-xs">
                  Login
                </BrutalistButton>
              </Link>
            </div>
          )}

          <MobileMenu />
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Footer — Brutalist bar */}
      <footer className="w-full border-t-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-black rounded-sm flex items-center justify-center overflow-hidden">
              <Image src="/icon.svg" alt="Zerion Store Logo" width={24} height={24} className="object-contain" />
            </div>
            Zerion Store<span className="text-violet-600">.</span>
          </div>

          {/* Social Links */}
          <div className="flex gap-4">
            <a href="https://wa.me/6285182734247" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white flex items-center justify-center border-2 border-black rounded-sm hover:bg-[#c8ff00] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
              {/* WhatsApp Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </a>
            <a href="https://instagram.com/jeremyjohnatan_" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white flex items-center justify-center border-2 border-black rounded-sm hover:bg-[#ff4081] hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
              {/* Instagram Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 text-center md:text-right">
            © 2026 Zerion Store — All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
