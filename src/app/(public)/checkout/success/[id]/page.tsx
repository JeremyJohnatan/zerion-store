import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import { OpenChatButton } from "@/components/ui/OpenChatButton";
import { Xendit } from 'xendit-node';

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the order
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { service: true } } },
  });

  if (!order) {
    redirect("/");
  }

  let isPaid = order.paymentStatus === 'PAID';

  // Fallback: If DB says UNPAID, check Xendit directly to prevent race conditions
  if (!isPaid) {
    try {
      const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY || "" });
      const invoices = await xenditClient.Invoice.getInvoices({ externalId: id });
      
      const paidInvoice = invoices.find(inv => inv.status === 'PAID' || inv.status === 'SETTLED');
      
      if (paidInvoice) {
        isPaid = true;
        // Self-heal the database
        await prisma.order.update({
          where: { id },
          data: { paymentStatus: 'PAID' },
        });
      }
    } catch (e) {
      console.error("Failed to verify invoice with Xendit:", e);
    }
  }

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(order.totalPrice);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
      <div className="w-16 h-16 bg-[#c8ff00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-black">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h1 className="text-4xl font-black uppercase text-center text-black mb-2">
        {isPaid ? "Pembayaran Berhasil!" : "Pesanan Dibuat!"}
      </h1>
      <p className="text-center font-bold text-zinc-600 mb-8 uppercase tracking-wider text-sm">
        {isPaid ? "Pesanan Anda sedang diproses" : "Menunggu Pembayaran"}
      </p>

      <div className="w-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
        <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">ID Pesanan</p>
            <p className="font-bold text-lg font-mono">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status Pembayaran</p>
            <span className={`inline-block text-white text-xs font-black uppercase tracking-widest px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isPaid ? 'bg-[#c8ff00] text-black' : 'bg-[#ff4081]'}`}>
              {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Layanan</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="mb-2">
                <p className="font-black text-xl uppercase">{item.service.name}</p>
                <p className="text-sm font-bold text-zinc-600">{item.service.gameName} (x{item.quantity})</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Data Pelanggan</p>
            <p className="font-bold">{order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}</p>
          </div>
        </div>

        <div className="bg-zinc-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
          <p className="text-sm font-black uppercase tracking-widest text-black">Total</p>
          <p className="text-2xl font-black text-violet-600">{formattedPrice}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link href="/">
          <BrutalistButton variant="secondary" className="w-full sm:w-auto">
            Kembali ke Beranda
          </BrutalistButton>
        </Link>
        {!isPaid && order.paymentUrl && (
          <Link href={order.paymentUrl}>
            <BrutalistButton variant="primary" className="w-full sm:w-auto">
              Lanjutkan ke Pembayaran
            </BrutalistButton>
          </Link>
        )}
        <OpenChatButton 
          message={`Halo Admin, saya sudah membuat pesanan dengan ID: ${order.id}. Mohon segera diproses ya!`} 
          className="w-full sm:w-auto bg-[#ff4081] text-white hover:bg-[#e03571]" 
        />
      </div>
    </main>
  );
}
