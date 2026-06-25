import { CatalogCard } from "@/components/ui/CatalogCard";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import { RequestChatButton } from "@/components/ui/RequestChatButton";
import { DraggableMarquee } from "@/components/ui/DraggableMarquee";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let jokiServices: any[] = [];
  let appServices: any[] = [];
  let featuredReviews: any[] = [];
  let stats = { orders: 0, satisfaction: 0 }; // Initialize from 0

  try {
    const allServices = await prisma.service.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
    });

    jokiServices = allServices.filter(s => s.type === "JOKI").slice(0, 4);
    appServices = allServices.filter(s => s.type === "APP_PREMIUM").slice(0, 4);

    featuredReviews = await prisma.review.findMany({
      where: { isFeatured: true },
      include: { service: true },
      orderBy: { createdAt: "desc" },
    });

    // Dynamic stats
    stats.orders = await prisma.order.count({ where: { status: "COMPLETED" } });

    const reviews = await prisma.review.aggregate({
      _avg: { rating: true },
      _count: true,
    });

    if (reviews._count > 0 && reviews._avg.rating) {
      // Convert e.g. 4.9 to 98%
      stats.satisfaction = Math.round((reviews._avg.rating / 5) * 100);
    }
  } catch (error) {
    console.error("Database error in page.tsx:", error);
  }

  return (
    <main className="flex-1 w-full">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative w-full overflow-hidden bg-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#c8ff00]/10 blur-[120px] rounded-full pointer-events-none" />

        {/* DECORATIVE ELEMENTS SPREAD AROUND THE ENTIRE SCREEN */}
        <div className="absolute top-[15%] left-[3%] w-16 h-16 bg-[#c8ff00] border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-float z-0 hidden xl:flex">
          <span className="text-2xl">🎮</span>
        </div>
        <div className="absolute bottom-[20%] left-[5%] w-14 h-14 bg-violet-500 border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-float-delayed z-0 hidden xl:flex">
          <span className="text-xl">⚔️</span>
        </div>
        <div className="absolute top-[45%] left-[2%] w-12 h-12 bg-white border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-6 animate-float z-0 hidden 2xl:flex">
          <span className="text-lg">🏆</span>
        </div>
        <div className="absolute top-[5%] left-[10%] w-10 h-10 bg-pink-400 border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-12 animate-float-delayed z-0 hidden xl:flex">
          <span className="text-sm">⭐</span>
        </div>
        <div className="absolute bottom-[5%] left-[15%] w-12 h-12 bg-blue-400 border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-12 animate-spin-slow z-0 hidden xl:flex">
          <span className="text-sm">⚙️</span>
        </div>
        <div className="absolute top-[30%] left-[8%] w-14 h-14 bg-yellow-400 border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-bounce z-0 hidden xl:flex">
          <span className="text-xl">🔥</span>
        </div>
        
        <div className="absolute top-[15%] right-[3%] w-10 h-10 bg-cyan-400 border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-45 animate-float z-0 hidden xl:flex">
          <span className="text-sm">💎</span>
        </div>
        <div className="absolute bottom-[25%] right-[5%] w-14 h-14 bg-orange-400 border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-12 animate-float-delayed z-0 hidden xl:flex">
          <span className="text-xl">🚀</span>
        </div>
        <div className="absolute top-[50%] right-[2%] w-12 h-12 bg-lime-400 border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-spin-slow z-0 hidden 2xl:flex">
          <span className="text-lg">🍀</span>
        </div>
        <div className="absolute top-[8%] right-[10%] w-10 h-10 bg-rose-400 border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-bounce z-0 hidden xl:flex">
          <span className="text-sm">❤️</span>
        </div>
        <div className="absolute bottom-[10%] right-[15%] w-16 h-16 bg-indigo-400 border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-12 animate-float z-0 hidden xl:flex">
          <span className="text-2xl">🔮</span>
        </div>
        <div className="absolute top-[35%] right-[8%] w-8 h-8 bg-teal-400 border-2 border-black rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-6 animate-float-delayed z-0 hidden xl:flex">
          <span className="text-xs">⚡</span>
        </div>

        <div className="relative max-w-7xl mx-auto px-8 pt-12 pb-20 md:pt-16 md:pb-28 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#c8ff00] border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-[0.2em] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-8">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              Layanan Joki #1 Indonesia
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] tracking-tight text-black mb-8">
              Level up{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600">
                  Pengalaman
                </span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#c8ff00] -z-0 -rotate-1" />
              </span>
              <br />
              Gaming Anda.
            </h1>

            <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-lg mb-10 border-l-4 border-black pl-5">
              Tingkatkan rank, farming materi, dan eksplorasi map—tanpa buang waktu. Dikerjakan oleh
              <span className="text-black font-extrabold"> pro player terverifikasi.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#katalog">
                <BrutalistButton variant="primary" className="px-8 text-sm">
                  ⚡ Lihat Katalog
                </BrutalistButton>
              </Link>
              <Link href="https://wa.me/6281234567890" target="_blank">
                <BrutalistButton variant="secondary" className="px-8 text-sm">
                  💬 Konsultasi Gratis
                </BrutalistButton>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 pt-6 border-t-2 border-dashed border-zinc-200">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-black">{stats.orders}+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Order Selesai</span>
              </div>
              <div className="w-px h-10 bg-zinc-200" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-black">{stats.satisfaction}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Kepuasan</span>
              </div>
              <div className="w-px h-10 bg-zinc-200" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-black">24/7</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Support</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-[450px] lg:min-h-[650px] xl:min-h-[750px]">
            <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none p-4 lg:p-8 animate-float">
              <Image 
                src="/maskot.png" 
                alt="Maskot Joki" 
                width={720} 
                height={720} 
                className="object-contain drop-shadow-[12px_12px_0px_rgba(0,0,0,0.8)] scale-[1.3] lg:scale-[1.5] hover:scale-[1.4] lg:hover:scale-[1.6] transition-transform duration-500 ease-in-out pointer-events-auto"
                priority
              />
            </div>
          </div>
        </div>
        <div className="w-full h-[2px] bg-black" />
      </section>

      {/* ═══════════ MARQUEE REVIEWS ═══════════ */}
      {featuredReviews.length > 0 && (
        <section className="w-full bg-[#c8ff00] border-b-4 border-black py-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #000 2px, transparent 2px)", backgroundSize: "16px 16px" }}></div>

          <div className="max-w-7xl mx-auto px-8 mb-8 relative z-10">
            <h2 className="text-3xl font-black uppercase text-black tracking-tight">Apa Kata Mereka?</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-black/70">Ulasan Pilihan Pelanggan Kami</p>
          </div>

          <div className="w-full overflow-hidden">
            {/* We duplicate the array 10 times to ensure half of it is wider than the screen, then duplicate it again so it loops perfectly */}
            <DraggableMarquee>
              {Array.from({ length: 20 }).flatMap(() => featuredReviews).map((review, idx) => (
                <div key={`${review.id}-${idx}`} className="w-[350px] shrink-0 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative transition-transform hover:-translate-y-2">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black uppercase text-black truncate max-w-[180px]">{review.customerName}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 truncate max-w-[180px] mt-1">{review.service.name}</p>
                    </div>
                    <div className="flex text-[#ff4081]">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "opacity-100 text-sm" : "opacity-20 grayscale text-sm"}>⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-zinc-700 italic line-clamp-3">
                    &quot;{review.comment || "Pelanggan ini memberikan rating tanpa komentar."}&quot;
                  </p>
                </div>
              ))}
            </DraggableMarquee>
          </div>
        </section>
      )}

      {/* ═══════════ KATALOG SECTION ═══════════ */}
      <section id="katalog" className="w-full bg-zinc-50 scroll-mt-20">
        {appServices.length > 0 && (
          <>
            <div className="w-full bg-black text-white py-4 px-8 border-b-4 border-[#c8ff00]">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-3">
                  <span className="w-3 h-3 bg-[#c8ff00] rounded-sm inline-block" />
                  Jualan App Premium
                </h2>
                <Link href="/katalog/apps" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#c8ff00] transition-colors flex items-center gap-1">
                  Lihat Semua App →
                </Link>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-16">
              <p className="text-zinc-500 font-medium mb-10 max-w-lg">
                Dapatkan aplikasi premium favorit Anda dengan harga jauh lebih murah dan garansi anti-banned.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {appServices.map((service) => (
                  <CatalogCard
                    key={service.id}
                    gameName={service.gameName}
                    category={service.category}
                    title={service.name}
                    price={service.basePrice}
                    imageUrl={service.imageUrl || undefined}
                    href={`/services/${service.id}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <div className="w-full bg-black text-white py-4 px-8 border-t-2 border-zinc-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-3">
              <span className="w-3 h-3 bg-violet-500 rounded-sm inline-block" />
              Layanan Jasa Joki
            </h2>
            <Link href="/katalog/joki" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-violet-400 transition-colors flex items-center gap-1">
              Jelajahi Semua Game →
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-16">
          <p className="text-zinc-500 font-medium mb-10 max-w-lg">
            Pilih layanan profesional dari game favorit Anda. Semua dikerjakan secara manual oleh pemain berpengalaman.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {jokiServices.map((service) => (
              <CatalogCard
                key={service.id}
                gameName={service.gameName}
                category={service.category}
                title={service.name}
                price={service.basePrice}
                imageUrl={service.imageUrl || undefined}
                href={`/services/${service.id}`}
              />
            ))}
          </div>
        </div>

        {/* Custom Request CTA */}
        <div className="max-w-7xl mx-auto px-8 pb-20">
          <div className="bg-white border-4 border-black p-8 md:p-12 text-center rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#c8ff00] rounded-full blur-[40px] opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500 rounded-full blur-[40px] opacity-50 pointer-events-none"></div>
            
            <h2 className="text-2xl md:text-3xl font-black uppercase text-black mb-4 relative z-10">Tidak Menemukan Apa Yang Anda Cari?</h2>
            <p className="text-zinc-600 font-medium mb-8 max-w-xl mx-auto relative z-10">
              Game atau Aplikasi Premium yang Anda inginkan belum masuk katalog? Hubungi kami, dan kami akan berikan penawaran terbaik untuk Anda!
            </p>
            <RequestChatButton defaultMessage="Halo Admin, saya mau request Game atau Aplikasi yang tidak ada di katalog." />
          </div>
        </div>
      </section>

    </main>
  );
}
