import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Xendit } from 'xendit-node';

const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY || "" });

// POST create a new order
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const session = await getServerSession(authOptions);

    // Get user id if logged in
    let userId = null;
    if (session && session.user && (session.user as any).email) {
      const user = await prisma.user.findUnique({
        where: { email: (session.user as any).email },
      });
      if (user) {
        userId = user.id;
      }
    }

    // Generate Order ID (e.g., ION-001)
    const lastOrder = await prisma.order.findFirst({
      where: { id: { startsWith: "ION-" } },
      orderBy: { createdAt: "desc" },
    });

    let newOrderId = "ION-001";
    if (lastOrder) {
      const lastNumberStr = lastOrder.id.replace("ION-", "");
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) {
        newOrderId = `ION-${String(lastNumber + 1).padStart(3, "0")}`;
      }
    }

    const order = await prisma.order.create({
      data: {
        id: newOrderId,
        userId: userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone || null,
        totalPrice: Number(data.totalPrice),
        items: {
          create: data.items.map((item: any) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            details: item.details || null,
            price: Number(item.price || item.basePrice || 0),
          })),
        },
      },
      include: { items: { include: { service: true } } },
    });

    // Determine Base URL for redirects
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
      return process.env.NEXTAUTH_URL || "http://localhost:3000";
    };
    const baseUrl = getBaseUrl();

    // Create Xendit Invoice
    const invoiceRequest = {
      externalId: order.id,
      amount: Math.round(order.totalPrice),
      payerEmail: "user@example.com", // You can use session.user.email if available
      description: `Pembayaran Pesanan #${order.id}`,
      customer: {
        givenNames: order.customerName,
        mobileNumber: order.customerPhone || undefined,
      },
      successRedirectUrl: `${baseUrl}/checkout/success/${order.id}`,
      failureRedirectUrl: `${baseUrl}/checkout/success/${order.id}`,
    };

    const invoice = await xenditClient.Invoice.createInvoice({ data: invoiceRequest });

    // Update order with paymentUrl
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { paymentUrl: invoice.invoiceUrl },
      include: { items: { include: { service: true } } },
    });

    return NextResponse.json({ success: true, data: updatedOrder }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET all orders (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: { items: { include: { service: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
