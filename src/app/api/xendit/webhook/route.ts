import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Verify Xendit Token
    const xenditToken = req.headers.get("x-callback-token");
    if (process.env.XENDIT_WEBHOOK_TOKEN && xenditToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ success: false, message: "Invalid webhook token" }, { status: 401 });
    }

    const orderId = data.external_id;
    const status = data.status; // PAID, EXPIRED, SETTLED

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID not found" }, { status: 400 });
    }

    let paymentStatus = "UNPAID";

    if (status === "PAID" || status === "SETTLED") {
      paymentStatus = "PAID";
    } else if (status === "EXPIRED") {
      paymentStatus = "FAILED";
    }

    // Update the database
    if (paymentStatus === "PAID" || paymentStatus === "FAILED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: paymentStatus as any,
        },
      });

      if (paymentStatus === "PAID") {
        await inngest.send({ name: "order/paid", data: { orderId } });
      }
    }

    return NextResponse.json({ success: true, message: "OK" });
  } catch (error) {
    console.error("Xendit webhook error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
