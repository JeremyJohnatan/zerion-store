import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { checkUnreadChat, notifyPaidOrder } from "../../../inngest/functions";

// Force local dev mode for Inngest locally to avoid signing key error
if (process.env.NODE_ENV === "development") {
  process.env.INNGEST_DEV = "1";
}

// Ekspor endpoint Inngest (GET, POST, PUT)
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkUnreadChat, // Daftarkan fungsi di sini
    notifyPaidOrder,
  ],
});
