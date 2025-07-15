import { LogInputMode, LogRole, LogSource, LogType } from "shared";
import { LogEntry } from "shared/src/log-types.js";
import { runNaisysDbCommand } from "../database/naisysDatabase.js";

interface NaisysLogEntry {
  id: number;
  username: string;
  role: LogRole;
  source: LogSource;
  type: LogType;
  message: string;
  date: string;
  inputMode: LogInputMode;
}

export async function getLogs(
  after?: number,
  limit: number = 1000,
): Promise<LogEntry[]> {
  try {
    let sql = `
      SELECT id, username, role, source, type, message, date, inputMode
      FROM ContextLog
    `;
    const params: any[] = [];

    const conditions: string[] = [];

    if (after !== undefined && after > 0) {
      conditions.push("id > ?");
      params.push(after);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY id DESC LIMIT ?";
    params.push(limit);

    const logs = await runNaisysDbCommand<NaisysLogEntry[]>(sql, params);

    // Resort ascending
    logs.sort((a, b) => a.id - b.id);

    return logs.map((log) => ({
      id: log.id,
      username: log.username,
      role: log.role,
      source: log.source,
      type: log.type,
      message: log.message,
      date: log.date,
      inputMode: log.inputMode,
    }));
  } catch (error) {
    console.error("Error fetching logs from Naisys database:", error);
    return [];
  }
}
