import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// DATABASE_URL is treated as a FILE PATH (a `file:` prefix is stripped). Do NOT
// point this at a Postgres URL — this app is SQLite-only by design. On Railway,
// mount a volume and set DATABASE_URL=file:/data/app.db so data survives deploys.
const DB_PATH = (process.env.DATABASE_URL ?? "file:./app.db").replace(/^file:/, "");

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS automation_cache (
  bot_key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  pushed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS run_history (
  run_date TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);`;

function createDb() {
  try {
    const sqlite = new Database(DB_PATH);
    sqlite.exec(INIT_SQL);
    return drizzle(sqlite, { schema });
  } catch (err) {
    console.error("[db] Failed to init SQLite:", err);
    return null;
  }
}

const globalDb = global as unknown as { db: ReturnType<typeof createDb> };
export const db = globalDb.db ?? createDb();
if (process.env.NODE_ENV !== "production") globalDb.db = db;
export const dbAvailable = !!db;
export type Db = NonNullable<ReturnType<typeof createDb>>;
