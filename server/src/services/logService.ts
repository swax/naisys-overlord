import { LogEntry } from "shared/src/log-types.js";
import { runNaisysDbCommand } from "../database/naisysDatabase.js";

interface NaisysLogEntry {
  id: number;
  username: string;
  source: string;
  type: string;
  message: string;
  date: string;
}

export async function getLogs(
  agent?: string,
  after?: number,
  limit: number = 100
): Promise<LogEntry[]> {
  try {
    let sql = `
      SELECT id, username, source, type, message, date
      FROM ContextLog
    `;
    const params: any[] = [];

    const conditions: string[] = [];

    if (after !== undefined) {
      conditions.push("id > ?");
      params.push(after);
    }

    if (agent && agent.toLowerCase() !== "all") {
      conditions.push("LOWER(username) = ?");
      params.push(agent.toLowerCase());
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY id ASC LIMIT ?";
    params.push(limit);

    const logs = await runNaisysDbCommand<NaisysLogEntry[]>(sql, params);

    return logs.map(log => ({
      id: log.id,
      username: log.username,
      source: log.source,
      type: log.type,
      message: log.message,
      date: log.date
    }));
  } catch (error) {
    console.error("Error fetching logs from Naisys database:", error);
    return [];
  }
}