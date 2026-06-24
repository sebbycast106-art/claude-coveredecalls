import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// Single upserted row holding the latest payload the Python engine pushed.
export const automationCache = sqliteTable("automation_cache", {
  botKey: text("bot_key").primaryKey(),
  data: text("data").notNull(),
  pushedAt: text("pushed_at").notNull().default(sql`(datetime('now'))`),
});

// Append-only ledger of each daily push, so the app can build a real
// performance/premium history that survives the bot's ephemeral runner.
// One row per (run_date) — re-pushes for the same date overwrite.
export const runHistory = sqliteTable("run_history", {
  runDate: text("run_date").primaryKey(),
  data: text("data").notNull(),
  recordedAt: text("recorded_at").notNull().default(sql`(datetime('now'))`),
});
