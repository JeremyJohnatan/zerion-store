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
    const { isFeatured } = await req.json();

    if (isFeatured) {
      const existingService = await prisma.service.findUnique({ where: { id } });
      if (!existingService) {
        return NextResponse.json({ success: false, error: "Layanan tidak ditemukan" }, { status: 404 });
      }

      const featuredCount = await prisma.service.count({
        where: {
          type: existingService.type,
          isFeatured: true,
        },
      });

      if (featuredCount >= 4) {
        return NextResponse.json(
          { success: false, error: "Maksimal 4 sorotan per kategori!" },
          { status: 400 }
        );
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: { isFeatured: Boolean(isFeatured) },
    });

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    console.error("PATCH /api/services/[id]/featured error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
