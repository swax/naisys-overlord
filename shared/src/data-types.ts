import { Agent } from "./agents-types";
import { LogEntry } from "./log-types";

export interface NaisysDataResponse {
  success: boolean;
  message: string;
  data?: {
    agents: Agent[];
    logs: LogEntry[];
    timestamp: string;
    readStatus: Record<string, number>;
  };
}

export interface NaisysDataRequest {
  after?: string;
  limit?: string;
}

export interface ReadStatusUpdateRequest {
  agentName: string;
  lastReadLogId: number;
}

export interface ReadStatusUpdateResponse {
  success: boolean;
  message: string;
}
