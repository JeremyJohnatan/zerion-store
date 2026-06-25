import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { progress, estimatedTime } = body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(progress !== undefined && { progress: parseInt(progress, 10) }),
        ...(estimatedTime !== undefined && { estimatedTime }),
      },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("PATCH /api/orders/[id]/progress error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
