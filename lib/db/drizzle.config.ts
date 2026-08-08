import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.SUPABASE_DIRECT_URL;

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL or SUPABASE_DIRECT_URL must be set"
  );
}

const url = databaseUrl.includes("sslmode=")
  ? databaseUrl
  : `${databaseUrl}${databaseUrl.includes("?") ? "&" : "?"}sslmode=require`;

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});