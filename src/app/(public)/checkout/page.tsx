import { CheckoutForm } from "@/components/ui/CheckoutForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string; title?: string; price?: string; details?: string; fromCart?: string; selectedIds?: string }>;
}) {
  const { serviceId, title, price, details, fromCart, selectedIds } = await searchParams;

  // If missing critical params and not from cart, redirect back to home
  if (!fromCart && (!serviceId || !title || !price)) {
    redirect("/");
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
  let initialName = "";
  let initialPhone = "";

  if (session?.user?.email && session.user.email !== process.env.ADMIN_EMAIL) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { name: true, phone: true }
    });
    if (dbUser) {
      initialName = dbUser.name || "";
      initialPhone = dbUser.phone || "";
    }
  }

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-8 py-12 md:py-20">
      <div className="mb-8">
        <Link href={`/services/${serviceId}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mb-4">
          ← Kembali ke Detail Layanan
        </Link>
        <h1 className="text-4xl font-bold text-zinc-900 leading-tight">
          Selesaikan Pesanan Anda
        </h1>
        <p className="text-lg text-zinc-500 mt-2">
          Lengkapi data diri Anda untuk melanjutkan pembayaran.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <CheckoutForm 
          serviceId={serviceId}
          title={title}
          price={price}
          details={details || ''}
          initialName={initialName}
          initialPhone={initialPhone}
          fromCart={fromCart === 'true'}
          selectedIds={selectedIds}
        />
      </div>
    </main>
  );
}
