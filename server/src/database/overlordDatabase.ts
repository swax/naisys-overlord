import sqlite3 from "sqlite3";

sqlite3.verbose();

const overlordDbPth = process.env.OVERLORD_DB_PATH || "./overlord.db";

const createSessionTable = `
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    start_date TEXT NOT NULL,
    expire_date TEXT NOT NULL
  )
`;

/** In a multiple user setup, settings json would be system wide, but read status would be per user */
const createSettingsTable = `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    settings_json TEXT NOT NULL,
    modify_date TEXT NOT NULL,
    read_status_json TEXT DEFAULT '{}'
  )
`;

await runOnOverlordDb(createSessionTable);
await runOnOverlordDb(createSettingsTable);

await runOnOverlordDb("PRAGMA journal_mode = WAL");

async function executeOnOverlordDb<T>(
  sql: string,
  params: any[] = [],
  method: "all" | "run",
): Promise<T> {
  const db = new sqlite3.Database(overlordDbPth);

  // Configure database
  if (method === "run") {
    db.run("PRAGMA foreign_keys = ON");
  }

  return new Promise((resolve, reject) => {
    const callback = (err: Error | null, result: any) => {
      db.close();

      if (err) {
        reject(err);
      } else {
        resolve(result as T);
      }
    };

    if (method === "all") {
      db.all(sql, params, callback);
    } else {
      db.run(sql, params, callback);
    }
  });
}

export async function selectFromOverlordDb<T>(
  sql: string,
  params: any[] = [],
): Promise<T> {
  return executeOnOverlordDb<T>(sql, params, "all");
}

export async function runOnOverlordDb(
  sql: string,
  params: any[] = [],
): Promise<sqlite3.RunResult> {
  return executeOnOverlordDb<sqlite3.RunResult>(sql, params, "run");
}
