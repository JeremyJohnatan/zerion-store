import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const unreadCount = await prisma.chatMessage.count({
      where: {
        senderRole: "CUSTOMER",
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    console.error("Unread count GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
