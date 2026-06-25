import { prisma } from "@/lib/prisma";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import Link from "next/link";
import { DeleteButton } from "./DeleteButton";
import { ServicesFilter } from "./ServicesFilter";
import { ToggleFeaturedButton } from "./ToggleFeaturedButton";
import { Prisma } from "../../../../prisma/generated/client";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const limit = 15;
  const skip = (page - 1) * limit;
  
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const typeParam = typeof resolvedParams.type === "string" ? resolvedParams.type : "";

  // Build the Prisma "where" clause
  const where: Prisma.ServiceWhereInput = {};
  
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { gameName: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }
  
  if (typeParam === "JOKI" || typeParam === "APP_PREMIUM") {
    where.type = typeParam as any;
  }

  let services: any[] = [];
  let totalCount = 0;
  
  try {
    const [fetchedServices, count] = await prisma.$transaction([
      prisma.service.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.service.count({ where }),
    ]);
    
    services = fetchedServices;
    totalCount = count;
  } catch (error) {
    console.warn("Database connection failed, using empty array for services list.");
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase text-black mb-2">Manajemen Layanan</h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Katalog Jasa Zerion Store</p>
        </div>
        <Link href="/admin/services/new">
          <BrutalistButton variant="primary">
            + Tambah Layanan
          </BrutalistButton>
        </Link>
      </div>

      <ServicesFilter />

      <div className="bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#c8ff00] border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-black">
                <th className="p-4 border-r-2 border-black">Tipe</th>
                <th className="p-4 border-r-2 border-black">Game/Aplikasi</th>
                <th className="p-4 border-r-2 border-black">Kategori</th>
                <th className="p-4 border-r-2 border-black">Nama Layanan</th>
                <th className="p-4 border-r-2 border-black">Sorotan</th>
                <th className="p-4 border-r-2 border-black">Harga Dasar</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm font-bold text-zinc-500 uppercase tracking-widest">Belum ada layanan yang sesuai</td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                    <td className="p-4 border-r border-zinc-200 font-bold uppercase text-xs">
                      <span className={`px-2 py-1 border border-black rounded-sm ${service.type === 'APP_PREMIUM' ? 'bg-[#c8ff00]' : 'bg-violet-200'}`}>
                        {service.type === 'APP_PREMIUM' ? 'App Premium' : 'Jasa Joki'}
                      </span>
                    </td>
                    <td className="p-4 border-r border-zinc-200 font-bold uppercase text-xs">{service.gameName}</td>
                    <td className="p-4 border-r border-zinc-200 font-bold text-xs"><span className="px-2 py-1 bg-zinc-100 border border-black rounded-sm">{service.category}</span></td>
                    <td className="p-4 border-r border-zinc-200 font-bold uppercase text-xs text-violet-600 max-w-[200px] truncate">{service.name}</td>
                    <td className="p-4 border-r border-zinc-200 font-bold text-center">
                      <ToggleFeaturedButton id={service.id} initialStatus={service.isFeatured} />
                    </td>
                    <td className="p-4 border-r border-zinc-200 font-bold text-xs">Rp {service.basePrice.toLocaleString("id-ID")}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/services/${service.id}/edit`}>
                          <button className="px-3 py-1 bg-white border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">Edit</button>
                        </Link>
                        <DeleteButton id={service.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <Link 
            href={`?q=${q}&type=${typeParam}&page=${Math.max(1, page - 1)}`}
            className={`px-4 py-2 bg-white border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            ← Prev
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest text-black bg-white border-2 border-black px-4 py-2 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Page {page} of {totalPages}
          </span>
          <Link 
            href={`?q=${q}&type=${typeParam}&page=${Math.min(totalPages, page + 1)}`}
            className={`px-4 py-2 bg-[#c8ff00] border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#b3e600] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
