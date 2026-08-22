// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { config } from 'dotenv'
config({ path: ['.env.local', '.env'] })
export default defineConfig({
  schema: "./src/db/schema.ts",       // path to your schema.ts
  out: "./src/db/migrations",        // where migrations are stored
  dialect: "postgresql",              // <- this replaces `driver: "pg"`
  dbCredentials: {
     url: process.env.DATABASE_URL!, // connection string
  },
});

