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

await runOverlordDbCommand(createSessionTable);
await runOverlordDbCommand(createSettingsTable);

export async function runOverlordDbCommand<T>(
  sql: string,
  params: any[] = [],
): Promise<T> {
  const db = new sqlite3.Database(overlordDbPth);

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      db.close();

      if (err) {
        reject(err);
      } else {
        resolve(rows as T);
      }
    });
  });
}
