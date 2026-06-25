import { prisma } from "@/lib/prisma";
import { ReviewTable } from "./ReviewTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let totalOrders = 0;
  let totalServices = 0;
  let completedOrders = 0;
  let pendingOrders = 0;
  let totalRevenue = 0;
  let recentOrders: any[] = [];
  let reviews: any[] = [];

  try {
    totalOrders = await prisma.order.count();
    totalServices = await prisma.service.count();
    completedOrders = await prisma.order.count({ where: { status: "COMPLETED" } });
    pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });
    
    const revenueAgg = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: "COMPLETED" },
    });
    totalRevenue = revenueAgg._sum.totalPrice || 0;

    recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { service: true } }, user: true },
    });
    reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: { service: true },
    });
  } catch (error) {
    console.warn("Database connection failed, using 0 for dashboard metrics.");
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase text-black mb-2">Overview</h1>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Pantau Performa Zerion Store</p>
      </div>

      {/* Revenue Banner */}
      <div className="bg-black border-4 border-[#ff4081] rounded-md p-8 mb-8 shadow-[8px_8px_0px_0px_rgba(255,64,129,1)] text-white relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-[#ffb3c6] mb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-[#c8ff00] rounded-sm animate-pulse" />
              Total Pendapatan Bersih
            </p>
            <p className="text-5xl md:text-6xl font-black text-white tracking-tight">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest max-w-[200px]">
              Dihitung berdasarkan pesanan yang telah berstatus "Selesai" (Completed).
            </p>
          </div>
        </div>
        {/* Background decorative element */}
        <div className="absolute -right-10 -bottom-10 text-[150px] opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          💰
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border-2 border-black rounded-md p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Pesanan</p>
          <p className="text-4xl font-black text-black">{totalOrders}</p>
        </div>
        <div className="bg-[#c8ff00] border-2 border-black rounded-md p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Pesanan Baru (Pending)</p>
          <p className="text-4xl font-black text-black">{pendingOrders}</p>
        </div>
        <div className="bg-violet-500 border-2 border-black rounded-md p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-200 mb-1">Pesanan Selesai</p>
          <p className="text-4xl font-black text-white">{completedOrders}</p>
        </div>
        <div className="bg-white border-2 border-black rounded-md p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Layanan Aktif</p>
          <p className="text-4xl font-black text-black">{totalServices}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-2xl font-black uppercase text-black mb-6 flex items-center gap-2">
          <span className="w-3 h-3 bg-black inline-block" />
          Pesanan Terbaru <span className="text-sm font-bold text-zinc-500 lowercase">(5 terbaru)</span>
        </h2>
        
        <div className="bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-black">
                  <th className="p-4 border-r-2 border-black">Order ID</th>
                  <th className="p-4 border-r-2 border-black">Pelanggan</th>
                  <th className="p-4 border-r-2 border-black">Layanan</th>
                  <th className="p-4 border-r-2 border-black">Status</th>
                  <th className="p-4 border-r-2 border-black">Pembayaran</th>
                  <th className="p-4 border-r-2 border-black">Tanggal</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm font-bold text-zinc-500 uppercase tracking-widest">Belum ada pesanan</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="p-4 border-r border-zinc-200 font-mono text-xs">{order.id}</td>
                      <td className="p-4 border-r border-zinc-200 font-bold uppercase text-xs">{order.customerName}</td>
                      <td className="p-4 border-r border-zinc-200 font-bold uppercase text-xs text-violet-600 truncate max-w-[200px]">
                        {order.items && order.items.length > 0 ? order.items[0]?.service?.name : "-"}
                      </td>
                      <td className="p-4 border-r border-zinc-200">
                        <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          order.status === 'COMPLETED' ? 'bg-[#c8ff00]' : 
                          order.status === 'IN_PROGRESS' ? 'bg-violet-500 text-white' : 'bg-white'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 border-r border-zinc-200">
                        <span className={`inline-block px-2 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          order.paymentStatus === 'PAID' ? 'bg-[#c8ff00] text-black' : 'bg-[#ff4081] text-white'
                        }`}>
                          {order.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'}
                        </span>
                      </td>
                      <td className="p-4 border-r border-zinc-200 text-xs font-bold text-zinc-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 text-center">
                        <a href={`/admin/chat?roomId=${encodeURIComponent(order.user?.email || order.customerName)}`}>
                          <button className="px-3 py-1 bg-[#c8ff00] border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all" title="Chat Pelanggan">
                            Chat
                          </button>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-2xl font-black uppercase text-black mb-6 flex items-center gap-2">
          <span className="w-3 h-3 bg-violet-500 inline-block" />
          Ulasan Pelanggan
        </h2>
        <ReviewTable initialReviews={reviews} />
      </div>
    </div>
  );
}
