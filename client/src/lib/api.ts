import type {
  HelloResponse,
  AccessKeyRequest,
  AccessKeyResponse,
  SettingsRequest,
  SettingsResponse,
  AgentsResponse,
} from "shared";

const API_BASE = "/api";

export interface SessionResponse {
  success: boolean;
  username?: string;
  startDate?: string;
  expireDate?: string;
  message?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export type {
  HelloResponse,
  AccessKeyRequest,
  AccessKeyResponse,
  SettingsRequest,
  SettingsResponse,
  AgentsResponse,
};

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  async post<T, R>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `API Error: ${response.status}`);
    }
    return result;
  },
};

export const apiEndpoints = {
  hello: "/hello",
  accessKey: "/access-key",
  session: "/session",
  logout: "/logout",
  settings: "/settings",
  agents: "/agents",
};

export const checkSession = async (): Promise<SessionResponse> => {
  try {
    return await api.get<SessionResponse>(apiEndpoints.session);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Session check failed",
    };
  }
};

export const logout = async (): Promise<LogoutResponse> => {
  try {
    return await api.post<{}, LogoutResponse>(apiEndpoints.logout, {});
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Logout failed",
    };
  }
};

export const getSettings = async (): Promise<SettingsResponse> => {
  try {
    return await api.get<SettingsResponse>(apiEndpoints.settings);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load settings",
    };
  }
};

export const saveSettings = async (
  settings: SettingsRequest,
): Promise<SettingsResponse> => {
  try {
    return await api.post<SettingsRequest, SettingsResponse>(
      apiEndpoints.settings,
      settings,
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to save settings",
    };
  }
};

export const getAgents = async (): Promise<AgentsResponse> => {
  try {
    return await api.get<AgentsResponse>(apiEndpoints.agents);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load agents",
    };
  }
};
