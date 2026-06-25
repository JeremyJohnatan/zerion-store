import { CatalogCard } from "@/components/ui/CatalogCard";
import { RequestChatButton } from "@/components/ui/RequestChatButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function KatalogJokiPage() {
  let jokiServices: any[] = [];

  try {
    jokiServices = await prisma.service.findMany({
      where: { type: "JOKI" },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Database error:", error);
  }

  return (
    <main className="flex-1 w-full bg-zinc-50 min-h-screen pt-12 md:pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-8 mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black mb-4">
          Semua <span className="text-violet-600">Jasa Joki</span>
        </h1>
        <p className="text-lg text-zinc-500 font-medium max-w-2xl">
          Eksplorasi seluruh katalog jasa joki kami. Dikerjakan profesional, cepat, dan aman.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {jokiServices.length === 0 ? (
          <div className="bg-white border-2 border-black p-12 text-center rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase text-zinc-400">Belum ada layanan tersedia</h2>
          </div>
        ) : (
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
        )}

        {/* Custom Request CTA */}
        <div className="mt-20 bg-white border-4 border-black p-8 md:p-12 text-center rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#c8ff00] rounded-full blur-[40px] opacity-50 pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500 rounded-full blur-[40px] opacity-50 pointer-events-none"></div>
          
          <h2 className="text-2xl md:text-3xl font-black uppercase text-black mb-4 relative z-10">Tidak Menemukan Game Anda?</h2>
          <p className="text-zinc-600 font-medium mb-8 max-w-xl mx-auto relative z-10">
            Game yang Anda mainkan belum ada di katalog? Jangan khawatir! Anda bisa request jasa joki game apapun langsung ke admin kami.
          </p>
          <RequestChatButton defaultMessage="Halo Admin, saya mau request jasa joki untuk game yang tidak ada di katalog." />
        </div>
      </div>
    </main>
  );
}
