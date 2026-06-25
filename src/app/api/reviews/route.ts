import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const serviceId = url.searchParams.get("serviceId");
    const customerName = url.searchParams.get("customerName");
    const orderId = url.searchParams.get("orderId");

    if (!serviceId || !customerName || !orderId) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const review = await prisma.review.findFirst({
      where: {
        serviceId,
        customerName,
        orderId,
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.serviceId || !data.rating || !data.customerName || !data.orderId) {
      return NextResponse.json(
        { success: false, error: "serviceId, rating, customerName, dan orderId wajib diisi." },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        serviceId: data.serviceId,
        customerName: data.customerName,
        orderId: data.orderId,
      },
    });

    if (existingReview) {
      const review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: Number(data.rating),
          comment: data.comment || null,
        },
      });
      return NextResponse.json({ success: true, data: review, message: "Ulasan berhasil diperbarui!" });
    } else {
      const review = await prisma.review.create({
        data: {
          serviceId: data.serviceId,
          orderId: data.orderId,
          rating: Number(data.rating),
          comment: data.comment || null,
          customerName: data.customerName,
        },
      });
      return NextResponse.json({ success: true, data: review, message: "Ulasan berhasil ditambahkan!" });
    }
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
