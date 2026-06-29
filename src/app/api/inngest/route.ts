import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { checkUnreadChat, notifyPaidOrder } from "../../../inngest/functions";

// Remove manual dev mode override to allow Vercel production sync

// Ekspor endpoint Inngest (GET, POST, PUT)
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkUnreadChat, // Daftarkan fungsi di sini
    notifyPaidOrder,
  ],
});
