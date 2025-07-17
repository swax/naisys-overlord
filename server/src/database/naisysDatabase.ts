import * as fs from "fs";
import path from "path";
import { env } from "process";
import sqlite3 from "sqlite3";

sqlite3.verbose();

async function executeOnNaisysDb<T>(
  sql: string,
  params: any[] = [],
  method: "all" | "run",
): Promise<T> {
  if (!env.NAISYS_FOLDER_PATH) {
    throw new Error("NAISYS_FOLDER_PATH environment variable is not set.");
  }

  const naisysDbPath = path.join(
    env.NAISYS_FOLDER_PATH,
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

export async function selectFromNaisysDb<T>(
  sql: string,
  params: any[] = [],
): Promise<T> {
  return executeOnNaisysDb<T>(sql, params, "all");
}

export async function runOnNaisysDb(
  sql: string,
  params: any[] = [],
): Promise<sqlite3.RunResult> {
  return executeOnNaisysDb<sqlite3.RunResult>(sql, params, "run");
}
