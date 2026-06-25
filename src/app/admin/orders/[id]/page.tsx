import { prisma } from "@/lib/prisma";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import Link from "next/link";
import { OrderStatusSelect } from "../OrderStatusSelect";
import { OrderProgressEditor } from "../OrderProgressEditor";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { service: true } } },
  });

  if (!order) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-black uppercase mb-4">Pesanan Tidak Ditemukan</h1>
        <Link href="/admin/orders">
          <BrutalistButton variant="primary">Kembali ke Daftar Pesanan</BrutalistButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href="/admin/orders"
          className="w-10 h-10 bg-white border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black hover:bg-zinc-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase text-black">Detail Pesanan</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">ID: {order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Kiri: Info Pelanggan & Layanan */}
        <div className="space-y-8">
          <div className="bg-white border-2 border-black rounded-md p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black uppercase border-b-2 border-black pb-2 mb-4">Data Pelanggan</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Nama</p>
                <p className="font-bold text-lg">{order.customerName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Nomor Telepon / WA</p>
                <p className="font-bold text-lg">{order.customerPhone || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#c8ff00] border-2 border-black rounded-md p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black uppercase border-b-2 border-black pb-2 mb-4">Layanan Dipesan ({order.items.length})</h2>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={item.id} className={index !== 0 ? "pt-6 border-t-2 border-black/20" : ""}>
                  <div className="mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Game / App</p>
                    <p className="font-bold text-lg uppercase">{item.service.gameName}</p>
                  </div>
                  <div className="mb-3 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Nama Layanan</p>
                      <p className="font-bold text-lg">{item.service.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Kuantitas</p>
                      <p className="font-bold text-lg text-violet-600">x{item.quantity}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Catatan Tambahan</p>
                    <p className="font-bold bg-white border-2 border-black p-3 rounded-sm text-sm whitespace-pre-wrap">
                      {item.details || "Tidak ada catatan"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Status & Pembayaran */}
        <div className="space-y-8">
          <div className="bg-white border-2 border-black rounded-md p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black uppercase border-b-2 border-black pb-2 mb-4">Status & Pembayaran</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Status Pesanan</p>
                <OrderStatusSelect id={order.id} currentStatus={order.status} />
              </div>
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Status Pembayaran</p>
                <span className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  order.paymentStatus === 'PAID' ? 'bg-[#c8ff00] text-black' : 'bg-red-500 text-white'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>

              <div className="border-t-2 border-dashed border-zinc-200 pt-6">
                <h3 className="text-sm font-black uppercase mb-4">Progress & Estimasi</h3>
                <OrderProgressEditor 
                  id={order.id} 
                  currentStatus={order.status}
                  currentProgress={order.progress} 
                  currentEstimatedTime={order.estimatedTime || ""} 
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Harga</p>
                <p className="font-black text-3xl text-violet-600">Rp {order.totalPrice.toLocaleString("id-ID")}</p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Tanggal Pemesanan</p>
                <p className="font-bold text-sm">
                  {new Date(order.createdAt).toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "short"
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
