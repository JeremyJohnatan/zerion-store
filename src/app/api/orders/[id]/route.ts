import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET track a single order by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const order = await prisma.order.findUnique({
      where: { id: resolvedParams.id },
      include: { items: { include: { service: true } } },
    });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT update order status (admin)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await req.json();
    const resolvedParams = await params;
    const order = await prisma.order.update({
      where: { id: resolvedParams.id },
      data: {
        status: data.status,
        paymentStatus: data.paymentStatus,
      },
      include: { items: { include: { service: true } } },
    });
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
