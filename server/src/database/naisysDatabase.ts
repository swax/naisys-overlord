import sqlite3 from "sqlite3";
import { getSettings } from "../services/settingsService";
import path from "path";
import * as fs from "fs";

sqlite3.verbose();

export async function runNaisysDbCommand<T>(
  sql: string,
  params: any[] = [],
): Promise<T> {
  const settings = await getSettings();

  const naisysFolderPath = settings ? settings.naisysDataFolderPaths[0] : "";
  if (!naisysFolderPath) {
    throw new Error("Naisys data folder path is not set in settings.");
  }

  const naisysDbPath = path.join(naisysFolderPath, "database", "naisys.sqlite");

  const dbExists = fs.existsSync(naisysDbPath);
  if (!dbExists) {
    throw new Error(
      `Naisys database file does not exist at path: ${naisysDbPath}`,
    );
  }

  const db = new sqlite3.Database(naisysDbPath);

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
