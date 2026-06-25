const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    console.log("Ensuring publication exists...");
    await pool.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
              CREATE PUBLICATION supabase_realtime;
          END IF;
      END
      $$;
    `);
    
    console.log("Adding tables to realtime publication...");
    try {
      await pool.query(`ALTER PUBLICATION supabase_realtime ADD TABLE "Order"`);
      console.log("- Order added");
    } catch(e) { console.log("- Order likely already added:", e.message); }
    
    try {
      await pool.query(`ALTER PUBLICATION supabase_realtime ADD TABLE "ChatMessage"`);
      console.log("- ChatMessage added");
    } catch(e) { console.log("- ChatMessage likely already added:", e.message); }

    console.log("Success!");
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    await pool.end();
  }
}

main();
