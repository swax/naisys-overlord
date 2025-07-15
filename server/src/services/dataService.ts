import { Agent } from "shared";
import { LogEntry } from "shared/src/log-types.js";
import { getAgents } from "./agentService.js";
import { getLogs } from "./logService.js";
import { getAllReadStatus } from "./settingsService.js";

export interface NaisysData {
  agents: Agent[];
  logs: LogEntry[];
  timestamp: string;
  readStatus: Record<string, number>;
}

export async function getNaisysData(
  after?: number,
  limit: number = 10000,
): Promise<NaisysData> {
  try {
    // Fetch agents, logs, and read status in parallel
    const [agents, logs, allReadStatus] = await Promise.all([
      getAgents(),
      getLogs(after, limit), // No agent filter - get all logs
      getAllReadStatus(),
    ]);

    // For now, use the first user's read status or implement a global read status
    // This assumes there's typically one admin user, but can be enhanced later
    const readStatus = Object.values(allReadStatus)[0] || {};

    return {
      agents,
      logs,
      timestamp: new Date().toISOString(),
      readStatus,
    };
  } catch (error) {
    console.error("Error fetching NAISYS data:", error);

    // Return empty data on error
    return {
      agents: [],
      logs: [],
      timestamp: new Date().toISOString(),
      readStatus: {},
    };
  }
}
