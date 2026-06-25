const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    await pool.query(`ALTER TABLE "Order" REPLICA IDENTITY FULL;`);
    console.log("Replica identity set to FULL for Order table.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}
main();
