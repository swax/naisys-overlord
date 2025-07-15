import { Agent } from "shared";
import { LogEntry } from "shared/src/log-types.js";
import { getAgents } from "./agentService.js";
import { getLogs } from "./logService.js";

export interface NaisysData {
  agents: Agent[];
  logs: LogEntry[];
  timestamp: string;
}

export async function getNaisysData(
  after?: number,
  limit: number = 100,
): Promise<NaisysData> {
  try {
    // Fetch agents and logs in parallel
    const [agents, logs] = await Promise.all([
      getAgents(),
      getLogs(undefined, after, limit), // No agent filter - get all logs
    ]);

    return {
      agents,
      logs,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching NAISYS data:", error);

    // Return empty data on error
    return {
      agents: [],
      logs: [],
      timestamp: new Date().toISOString(),
    };
  }
}
