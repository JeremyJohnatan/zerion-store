import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { OrdersFilter } from "./OrdersFilter";
import { Prisma } from "../../../../prisma/generated/client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const statusParam = typeof resolvedParams.status === "string" ? resolvedParams.status : "";

  // Build the Prisma "where" clause
  const where: Prisma.OrderWhereInput = {};
  
  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q, mode: "insensitive" } },
      { items: { some: { service: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }
  
  if (statusParam === "PENDING" || statusParam === "IN_PROGRESS" || statusParam === "COMPLETED") {
    where.status = statusParam as any;
  }

  let orders: any[] = [];
  let totalCount = 0;
  
  try {
    const [fetchedOrders, count] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: { items: { include: { service: true } }, user: true },
      }),
      prisma.order.count({ where }),
    ]);
    
    orders = fetchedOrders;
    totalCount = count;
  } catch (error) {
    console.warn("Database connection failed, using empty array for orders list.");
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase text-black mb-2">Manajemen Pesanan</h1>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Daftar Transaksi Pelanggan</p>
      </div>

      <OrdersFilter />

      <div className="bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-violet-500 border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-white">
                <th className="p-4 border-r-2 border-black">Order ID</th>
                <th className="p-4 border-r-2 border-black">Pelanggan</th>
                <th className="p-4 border-r-2 border-black">Layanan</th>
                <th className="p-4 border-r-2 border-black">Total Harga</th>
                <th className="p-4 border-r-2 border-black">Pembayaran</th>
                <th className="p-4 border-r-2 border-black">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm font-bold text-zinc-500 uppercase tracking-widest">Belum ada pesanan yang sesuai</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                    <td className="p-4 border-r border-zinc-200 font-mono text-xs max-w-[100px] truncate" title={order.id}>{order.id}</td>
                    <td className="p-4 border-r border-zinc-200">
                      <div className="font-bold uppercase text-xs">{order.customerName}</div>
                      <div className="font-bold text-[10px] text-zinc-500 mt-1">{order.customerPhone || "-"}</div>
                    </td>
                    <td className="p-4 border-r border-zinc-200 font-bold uppercase text-xs text-violet-600 max-w-[200px] truncate">
                      {order.items.length === 1 ? order.items[0].service.name : `${order.items.length} Layanan`}
                    </td>
                    <td className="p-4 border-r border-zinc-200 font-bold text-xs">Rp {order.totalPrice.toLocaleString("id-ID")}</td>
                    <td className="p-4 border-r border-zinc-200">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        order.paymentStatus === "PAID" ? "bg-[#c8ff00] text-black" : "bg-[#ff4081] text-white"
                      }`}>
                        {order.paymentStatus === "PAID" ? "LUNAS" : "BELUM BAYAR"}
                      </span>
                    </td>
                    <td className="p-4 border-r border-zinc-200">
                      <OrderStatusSelect id={order.id} currentStatus={order.status} />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/chat?roomId=${encodeURIComponent(order.user?.email || order.customerName)}`}>
                          <button className="px-3 py-1 bg-[#c8ff00] border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all" title="Chat Pelanggan">
                            Chat
                          </button>
                        </Link>
                        <Link href={`/admin/orders/${order.id}`}>
                          <button className="px-3 py-1 bg-white border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">Detail</button>
                        </Link>
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
            href={`?q=${q}&status=${statusParam}&page=${Math.max(1, page - 1)}`}
            className={`px-4 py-2 bg-white border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            ← Prev
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest text-black bg-white border-2 border-black px-4 py-2 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Page {page} of {totalPages}
          </span>
          <Link 
            href={`?q=${q}&status=${statusParam}&page=${Math.min(totalPages, page + 1)}`}
            className={`px-4 py-2 bg-[#c8ff00] border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#b3e600] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
