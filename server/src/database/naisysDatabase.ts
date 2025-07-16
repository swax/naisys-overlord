import * as fs from "fs";
import path from "path";
import { env } from "process";
import sqlite3 from "sqlite3";

sqlite3.verbose();

export async function runNaisysDbCommand<T>(
  sql: string,
  params: any[] = [],
): Promise<T> {
  /*const settings = await getSettings();

  if (!settings) {
    throw new Error("Settings not found. Please ensure they are initialized.");
  }

  if (!settings.naisysDataFolderPath) {
    throw new Error("Naisys data folder path is not set in settings.");
  }*/

  if (!env.NAISYS_FOLDER_PATH) {
    throw new Error("NAISYS_FOLDER_PATH environment variable is not set.");
  }

  const naisysDbPath = path.join(
    env.NAISYS_FOLDER_PATH, //settings.naisysDataFolderPath,
    "database",
    "naisys.sqlite",
  );

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
