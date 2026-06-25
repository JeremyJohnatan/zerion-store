import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all chat rooms with latest message & unread count
export async function GET() {
  try {
    // Get all distinct rooms with their latest message
    const allMessages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Group by roomId
    const roomMap = new Map<string, {
      roomId: string;
      customerName: string;
      lastMessage: string;
      lastMessageAt: Date;
      unreadCount: number;
    }>();

    for (const msg of allMessages) {
      if (!roomMap.has(msg.roomId)) {
        roomMap.set(msg.roomId, {
          roomId: msg.roomId,
          customerName: msg.senderRole === "CUSTOMER" ? msg.customerName : "Pelanggan",
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }

      // Always prefer the customer's own name for the room label
      const room = roomMap.get(msg.roomId)!;
      if (msg.senderRole === "CUSTOMER" && room.customerName === "Pelanggan") {
        room.customerName = msg.customerName;
      }

      // Count unread CUSTOMER messages (admin hasn't read yet)
      if (msg.senderRole === "CUSTOMER" && !msg.isRead) {
        room.unreadCount += 1;
      }
    }

    const rooms = Array.from(roomMap.values()).sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
    );

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error("Chat rooms GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
