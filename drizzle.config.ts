import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
// Note: We might need the user to provide the DB Connection String explicitly for Drizzle Kit if fetching from .env.local isn't sufficient (Supabase API URL != DB URL).
// For now, I will assume we might prompt for DATABASE_URL later or try to construct it.
// Actually, `supabase-mcp` might allow applying migrations without needing the connection string locally if we use the tool?
// No, the mcp tool `apply_migration` takes a query. Drizzle generates SQL.
// I will start by defining the config, but we'll likely need the DATABASE_URL.
