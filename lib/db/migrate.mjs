// Direct migration script — bypasses drizzle-kit CLI for Supabase compatibility
import pg from '/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';

const { Client } = pg;

const url = process.env.SUPABASE_DIRECT_URL;
if (!url) {
  console.error('SUPABASE_DIRECT_URL not set');
  process.exit(1);
}

// Test connection first
const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const result = await client.query('SELECT current_database(), current_user, version()');
  console.log('Connected!', result.rows[0]);
  await client.end();
} catch (err) {
  console.error('Connection failed:', err.message);
  process.exit(1);
}
