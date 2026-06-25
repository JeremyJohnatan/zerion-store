import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export const checkUnreadChat = inngest.createFunction(
  { id: "check-unread-chat", triggers: [{ event: "chat/customer.message" }] },
  async ({ event, step }) => {
    const { messageId, roomId, customerName, message } = event.data;

    // Tunggu 5 menit
    await step.sleep("wait-5-mins", "5m");

    // Setelah 5 menit, cek apakah pesan sudah dibaca (isRead == true)
    const chatMessage = await step.run("check-db-read-status", async () => {
      return await prisma.chatMessage.findUnique({
        where: { id: messageId },
        select: { isRead: true },
      });
    });

    if (chatMessage && chatMessage.isRead === false) {
      // Jika belum dibaca, kirim notifikasi Email
      await step.run("send-email-notification", async () => {
        const smtpEmail = process.env.SMTP_EMAIL;
        const smtpPassword = process.env.SMTP_PASSWORD;

        if (!smtpEmail || !smtpPassword || smtpPassword === "MASUKKAN_APP_PASSWORD_GMAIL_DI_SINI") {
          console.warn("⚠️ SMTP credentials not set. Skipping email notification.");
          return { success: false, reason: "Missing SMTP credentials" };
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: smtpEmail,
            pass: smtpPassword,
          },
        });

        const mailOptions = {
          from: `"Zerion Store System" <${smtpEmail}>`,
          to: smtpEmail, // Send to the admin's email
          subject: `🚨 Pesan Baru Belum Dibaca dari ${customerName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #000; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #000; color: #c8ff00; padding: 20px; text-align: center;">
                <h1 style="margin: 0; text-transform: uppercase;">Notifikasi Zerion Store</h1>
              </div>
              <div style="padding: 30px; background-color: #f4f4f5;">
                <p style="font-size: 16px; margin-bottom: 20px;">Ada pesan baru yang <strong>belum dibaca selama 5 menit</strong>.</p>
                <div style="background-color: #fff; padding: 15px; border-left: 4px solid #ff4081; margin-bottom: 25px;">
                  <p style="margin: 0; font-size: 14px; color: #666;">Dari: <strong>${customerName}</strong></p>
                  <p style="margin: 10px 0 0 0; font-size: 16px;">"${message}"</p>
                </div>
                <a href="http://localhost:3000/admin/chat" style="display: inline-block; background-color: #8b5cf6; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase;">
                  Buka Live Chat
                </a>
              </div>
            </div>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent successfully to ${smtpEmail}`);
          return { success: true, notified: smtpEmail };
        } catch (error) {
          console.error("❌ Failed to send email:", error);
          return { success: false, error };
        }
      });
    }

    return { success: true, isRead: chatMessage?.isRead };
  }
);

export const notifyPaidOrder = inngest.createFunction(
  { id: "notify-paid-order", triggers: [{ event: "order/paid" }] },
  async ({ event, step }) => {
    const { orderId } = event.data;

    const orderData = await step.run("fetch-order-details", async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { service: true } }, user: true },
      });
    });

    if (!orderData) {
      return { success: false, reason: "Order not found" };
    }

    await step.run("send-paid-order-email", async () => {
      const smtpEmail = process.env.SMTP_EMAIL;
      const smtpPassword = process.env.SMTP_PASSWORD;

      if (!smtpEmail || !smtpPassword || smtpPassword === "MASUKKAN_APP_PASSWORD_GMAIL_DI_SINI") {
        console.warn("⚠️ SMTP credentials not set. Skipping email notification.");
        return { success: false, reason: "Missing SMTP credentials" };
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpEmail,
          pass: smtpPassword,
        },
      });

      const itemsHtml = orderData.items.map((item: any) => `
        <div style="padding: 10px; border-bottom: 1px solid #e4e4e7;">
          <strong>${item.service.gameName} - ${item.service.name}</strong> (x${item.quantity})
          <br/>Harga: Rp ${item.price.toLocaleString("id-ID")}
        </div>
      `).join("");

      const mailOptions = {
        from: `"Zerion Store System" <${smtpEmail}>`,
        to: smtpEmail,
        subject: `💰 Pembayaran Berhasil: Order ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #000; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #c8ff00; color: #000; padding: 20px; text-align: center;">
              <h1 style="margin: 0; text-transform: uppercase; font-weight: 900;">Pembayaran Diterima!</h1>
            </div>
            <div style="padding: 30px; background-color: #f4f4f5;">
              <p style="font-size: 16px; margin-bottom: 20px;">Pesanan baru telah berhasil dibayar (LUNAS).</p>
              
              <div style="background-color: #fff; padding: 20px; border: 2px solid #000; border-radius: 4px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Detail Pelanggan</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">${orderData.customerName}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Nomor WA/Telp: ${orderData.customerPhone || "-"}</p>
              </div>

              <div style="background-color: #fff; padding: 20px; border: 2px solid #000; border-radius: 4px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Detail Pesanan (${orderId})</p>
                ${itemsHtml}
                <div style="padding-top: 15px; margin-top: 15px; border-top: 2px dashed #000; text-align: right;">
                  <strong style="font-size: 18px; color: #8b5cf6;">TOTAL: Rp ${orderData.totalPrice.toLocaleString("id-ID")}</strong>
                </div>
              </div>

              <a href="http://localhost:3000/admin/orders/${orderId}" style="display: block; text-align: center; background-color: #8b5cf6; color: #fff; padding: 15px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; border: 2px solid #000;">
                Proses Pesanan Sekarang
              </a>
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Paid Order Email sent successfully to Admin (${smtpEmail})`);

        // Send to Customer if email exists
        if (orderData.user?.email) {
          const customerMailOptions = {
            from: `"Zerion Store" <${smtpEmail}>`,
            to: orderData.user.email,
            subject: `🎉 Pesanan #${orderId} Sedang Diproses!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #000; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #c8ff00; color: #000; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; text-transform: uppercase; font-weight: 900;">Pembayaran Berhasil!</h1>
                </div>
                <div style="padding: 30px; background-color: #f4f4f5;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Halo <strong>${orderData.customerName}</strong>,</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">Terima kasih atas pesanan Anda. Pembayaran Anda untuk pesanan <strong>${orderId}</strong> telah berhasil kami terima. Admin kami akan segera memproses pesanan Anda!</p>
                  
                  <div style="background-color: #fff; padding: 20px; border: 2px solid #000; border-radius: 4px; margin-bottom: 25px;">
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Detail Pesanan</p>
                    ${itemsHtml}
                    <div style="padding-top: 15px; margin-top: 15px; border-top: 2px dashed #000; text-align: right;">
                      <strong style="font-size: 18px; color: #8b5cf6;">TOTAL: Rp ${orderData.totalPrice.toLocaleString("id-ID")}</strong>
                    </div>
                  </div>

                  <a href="http://localhost:3000/track-order" style="display: block; text-align: center; background-color: #8b5cf6; color: #fff; padding: 15px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; border: 2px solid #000;">
                    Lacak Pesanan Anda
                  </a>
                </div>
              </div>
            `,
          };
          await transporter.sendMail(customerMailOptions);
          console.log(`✅ Invoice Email sent successfully to Customer (${orderData.user.email})`);
        }

        return { success: true, notified: smtpEmail };
      } catch (error) {
        console.error("❌ Failed to send Paid Order email:", error);
        return { success: false, error };
      }
    });

    return { success: true };
  }
);
