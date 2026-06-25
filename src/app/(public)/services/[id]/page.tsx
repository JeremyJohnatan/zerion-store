import { PriceCalculator } from "@/components/ui/PriceCalculator";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let service: any = null;
  try {
    service = await prisma.service.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Database Error in ServiceDetailPage:", error);
    if (id === "1" || id === "dummy") {
      service = {
        id: id,
        gameName: "Genshin Impact",
        category: "Eksplorasi",
        name: "100% Eksplorasi Natlan",
        description: "Layanan joki eksplorasi map Natlan hingga 100%. Mencakup semua chest, oculus, puzzle, dan world quest utama. Estimasi pengerjaan 2-4 hari.",
        basePrice: 150000,
        imageUrl: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=1000&auto=format&fit=crop",
        reviews: [],
      };
    }
  }

  if (!service) {
    notFound();
  }

  const averageRating = service.reviews && service.reviews.length > 0
    ? (service.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / service.reviews.length).toFixed(1)
    : "Belum ada rating";

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Service Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-[#c8ff00] text-black border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
              {service.category}
            </span>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
              {service.gameName}
            </p>
            <h1 className="text-4xl md:text-5xl font-black uppercase text-black leading-tight mb-2">
              {service.name}
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xl">⭐</span>
              <span className="font-bold text-black">{averageRating}</span>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                ({service.reviews?.length || 0} Ulasan)
              </span>
            </div>
          </div>

          <div className="h-64 md:h-80 w-full relative overflow-hidden border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4">
            {service.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.imageUrl}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                <span className="font-mono text-zinc-400">No Image</span>
              </div>
            )}
          </div>

          <div className="mt-8 p-6 lg:p-8 bg-white rounded-sm border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute -top-3 -left-3 px-3 py-1 bg-[#c8ff00] text-black border-2 border-black font-black text-[10px] uppercase tracking-widest -rotate-2">
              Info Detail
            </div>
            <h4 className="font-black uppercase text-lg tracking-wider text-black mb-4 flex items-center gap-2">
              Deskripsi Layanan
            </h4>
            <div className="text-sm md:text-base text-zinc-700 leading-relaxed whitespace-pre-wrap font-medium">
              {service.description || "Tidak ada deskripsi tersedia."}
            </div>
          </div>

          {/* Ulasan Pelanggan Section */}
          <div className="mt-12 mb-12">
            <h2 className="text-2xl font-black uppercase text-black mb-6 flex items-center gap-3">
              <div className="w-6 h-6 bg-violet-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
              Ulasan Pelanggan
            </h2>

            {(!service.reviews || service.reviews.length === 0) ? (
              <div className="p-8 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                <p className="font-bold text-zinc-500 uppercase tracking-widest">Belum ada ulasan untuk layanan ini.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {service.reviews.map((review: any) => (
                  <div key={review.id} className="p-6 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-black uppercase text-black">{review.customerName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="flex text-[#ff4081]">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? "opacity-100 text-lg" : "opacity-20 grayscale text-lg"}>⭐</span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm font-medium text-zinc-700 bg-zinc-50 border-2 border-dashed border-zinc-300 p-4">
                        &quot;{review.comment}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calculator Widget */}
        <div className="lg:pl-8">
          <div className="sticky top-28">
            <PriceCalculator
              serviceId={service.id}
              gameName={service.gameName}
              title={service.name}
              basePrice={service.basePrice}
              imageUrl={service.imageUrl}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
