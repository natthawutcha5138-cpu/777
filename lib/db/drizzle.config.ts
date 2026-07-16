import { defineConfig } from "drizzle-kit";
import path from "path";

// SUPABASE_DIRECT_URL: direct (non-pooled) connection for migrations — format:
//   postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
// Falls back to SUPABASE_DATABASE_URL so `drizzle-kit generate` still works.
const migrateUrl = process.env.SUPABASE_DIRECT_URL || process.env.SUPABASE_DATABASE_URL;
if (!migrateUrl) {
  throw new Error("SUPABASE_DIRECT_URL (or SUPABASE_DATABASE_URL) must be set");
}

// Ensure SSL is required for Supabase.
const directUrl = migrateUrl.includes("sslmode")
  ? migrateUrl
  : migrateUrl + (migrateUrl.includes("?") ? "&" : "?") + "sslmode=require";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  out: path.join(__dirname, "./migrations"),
  dialect: "postgresql",
  dbCredentials: {
    url: directUrl,
  },
});
