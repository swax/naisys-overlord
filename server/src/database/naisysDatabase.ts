import path from "path";
import { env } from "process";
import sqlite3 from "sqlite3";
import { DatabaseConfig, runOnDb, selectFromDb } from "./databaseService";

function getNaisysConfig(): DatabaseConfig {
  if (!env.NAISYS_FOLDER_PATH) {
    throw new Error("NAISYS_FOLDER_PATH environment variable is not set.");
  }

  const dbPath = path.join(env.NAISYS_FOLDER_PATH, "database", "naisys.sqlite");

  return {
    dbPath,
    validatePath: true, // Naisys requires the DB to already exist
  };
}

export async function selectFromNaisysDb<T>(
  sql: string,
  params: any[] = [],
): Promise<T> {
  const config = getNaisysConfig();
  return selectFromDb<T>(config, sql, params);
}

export async function runOnNaisysDb(
  sql: string,
  params: any[] = [],
): Promise<sqlite3.RunResult> {
  const config = getNaisysConfig();
  return runOnDb(config, sql, params);
}
