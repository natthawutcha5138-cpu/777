// One-shot migration script — applies the generated SQL to Supabase
// using the transaction pooler URL (SUPABASE_DATABASE_URL).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pg = require('pg');
const { Client } = pg;

const url = process.env.SUPABASE_DATABASE_URL;
if (!url) {
  console.error('SUPABASE_DATABASE_URL not set');
  process.exit(1);
}

const sql = readFileSync(new URL('./migrations/0000_wooden_mister_fear.sql', import.meta.url), 'utf8');

// Split on drizzle's statement-breakpoint marker
const statements = sql
  .split('--> statement-breakpoint')
  .map(s => s.trim())
  .filter(Boolean);

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('Connected to Supabase');

  for (const stmt of statements) {
    const preview = stmt.slice(0, 60).replace(/\n/g, ' ');
    try {
      await client.query(stmt);
      console.log('✓', preview);
    } catch (err) {
      if (err.code === '42P07') {
        // 42P07 = duplicate_table — table already exists, skip
        console.log('⏭ already exists:', preview);
      } else {
        console.error('✗ FAILED:', preview);
        console.error('  ', err.message);
        throw err;
      }
    }
  }

  console.log('\nMigration complete!');
} finally {
  await client.end();
}
