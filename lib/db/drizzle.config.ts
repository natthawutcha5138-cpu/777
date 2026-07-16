import { defineConfig } from "drizzle-kit";
import path from "path";

// SUPABASE_DIRECT_URL is the direct (non-pooled) connection required for
// schema migrations. SUPABASE_DATABASE_URL is the pooled URL used at runtime.
if (!process.env.SUPABASE_DIRECT_URL) {
  throw new Error("SUPABASE_DIRECT_URL must be set for schema migrations");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_DIRECT_URL,
  },
});
