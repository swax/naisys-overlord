import { Agent } from "./agents-types";
import { LogEntry } from "./log-types";

export interface NaisysDataResponse {
  success: boolean;
  message: string;
  data?: {
    agents: Agent[];
    logs: LogEntry[];
    timestamp: string;
  };
}

export interface NaisysDataRequest {
  after?: string;
  limit?: string;
}
