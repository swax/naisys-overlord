export interface Agent {
  name: string;
  title: string;
  online: boolean;
  lastActive?: string;
  agentPath?: string;
}

export interface AgentsResponse {
  success: boolean;
  message: string;
  agents?: Agent[];
}
