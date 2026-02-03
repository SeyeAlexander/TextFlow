import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
// (which Supabase Transaction Pooler uses)
console.log("Initializing Postgres client with URL:", connectionString ? "Exists" : "MISSING");
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
