import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "../../../inngest/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch chat messages for a specific room
export async function GET(req: NextRequest) {
  try {
    const roomId = req.nextUrl.searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "roomId is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user && (session.user as any).role === "ADMIN";

    // SECURITY: If the roomId is an email, ensure the requester is that user or an Admin
    if (roomId.includes("@")) {
      if (!isAdmin && session?.user?.email !== roomId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized access to chat room" },
          { status: 401 }
        );
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST: Send a new chat message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, customerName, senderRole, message } = body;

    if (!roomId || !senderRole || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "roomId, senderRole, and message are required" },
        { status: 400 }
      );
    }

    if (!["CUSTOMER", "ADMIN"].includes(senderRole)) {
      return NextResponse.json(
        { success: false, error: "Invalid senderRole" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user && (session.user as any).role === "ADMIN";

    // SECURITY: If sending as ADMIN, verify the session
    if (senderRole === "ADMIN" && !isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized as ADMIN" }, { status: 403 });
    }

    // SECURITY: If the roomId is an email, verify the user
    if (roomId.includes("@")) {
      if (!isAdmin && session?.user?.email !== roomId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized access to chat room" },
          { status: 401 }
        );
      }
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        roomId,
        customerName: customerName || "Pelanggan",
        senderRole,
        message: message.trim(),
      },
    });

    // Trigger Inngest fallback if the sender is CUSTOMER
    if (senderRole === "CUSTOMER") {
      console.log("TRIGGERING INNGEST EVENT for message:", chatMessage.id);
      try {
        await inngest.send({
          name: "chat/customer.message",
          data: {
            messageId: chatMessage.id,
            roomId: chatMessage.roomId,
            customerName: chatMessage.customerName,
            message: chatMessage.message,
          },
        });
        console.log("INNGEST EVENT TRIGGERED SUCCESSFULLY");
      } catch (err) {
        console.error("FAILED TO TRIGGER INNGEST:", err);
      }
    }

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
