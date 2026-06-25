import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Toggle star status of a message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageId, isStarred } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: "messageId is required" },
        { status: 400 }
      );
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isStarred },
    });

    return NextResponse.json({ success: true, message: updatedMessage });
  } catch (error) {
    console.error("Star message error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle star status" },
      { status: 500 }
    );
  }
}
