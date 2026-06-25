import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all services
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST create a new service
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const service = await prisma.service.create({
      data: {
        gameName: data.gameName,
        category: data.category,
        name: data.name,
        description: data.description || null,
        basePrice: Number(data.basePrice),
        imageUrl: data.imageUrl || null,
        isFeatured: Boolean(data.isFeatured),
        type: data.type || "JOKI",
      },
    });
    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
