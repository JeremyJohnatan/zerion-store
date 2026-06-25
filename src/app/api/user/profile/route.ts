import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.email === process.env.ADMIN_EMAIL) {
      return NextResponse.json({
        success: true,
        data: {
          name: "Admin Zerion Store",
          email: process.env.ADMIN_EMAIL,
          role: "ADMIN"
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { name: true, email: true, phone: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, oldPassword, newPassword } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ success: false, error: "Nama, email, dan nomor WhatsApp wajib diisi" }, { status: 400 });
    }

    // Block admin from changing profile via this route
    if (session.user.email === process.env.ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: "Admin profile tidak bisa diubah dari sini" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Check if new email is taken by someone else
    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ success: false, error: "Email sudah digunakan" }, { status: 400 });
      }
    }

    let updateData: any = { name, email, phone };

    // If attempting to change password
    if (oldPassword && newPassword) {
      if (!user.password) {
        return NextResponse.json({ success: false, error: "Akun ini tidak memiliki password." }, { status: 400 });
      }
      
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ success: false, error: "Password lama salah" }, { status: 400 });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
