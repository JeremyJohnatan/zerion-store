import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking publication status...");
    // Create publication if it doesn't exist (Supabase usually has it, but just in case)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
              CREATE PUBLICATION supabase_realtime;
          END IF;
      END
      $$;
    `);
    
    console.log("Enabling Realtime for Order table...");
    // Add the table to the publication
    await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "Order";`);
    
    console.log("Success! Realtime enabled for Order table.");
  } catch (error: any) {
    // If it says it's already in the publication, that's fine
    if (error.message?.includes("already in publication")) {
      console.log("Order table is already enabled for Realtime.");
    } else {
      console.error("Failed to enable Realtime:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
