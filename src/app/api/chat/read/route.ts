import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Mark all CUSTOMER messages in a room as read
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "roomId is required" },
        { status: 400 }
      );
    }

    await prisma.chatMessage.updateMany({
      where: {
        roomId,
        senderRole: "CUSTOMER",
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark as read" },
      { status: 500 }
    );
  }
}
