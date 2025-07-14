export interface HelloResponse {
  message: string
  timestamp: string
  success: boolean
}

export interface AccessKeyRequest {
  accessKey: string
}

export interface AccessKeyResponse {
  success: boolean
  message: string
  token?: string
}

export interface SessionResponse {
  success: boolean
  username?: string
  startDate?: string
  expireDate?: string
  message?: string
}

export interface LogoutResponse {
  success: boolean
  message: string
}

export interface SettingsRequest {
  naisysDataFolderPaths: string[]
}

export interface SettingsResponse {
  success: boolean
  message: string
  settings?: {
    naisysDataFolderPaths: string[]
  }
}

export interface Agent {
  name: string
  title: string
  online: boolean
  lastActive?: string
  agentPath?: string
}

export interface AgentsResponse {
  success: boolean
  message: string
  agents?: Agent[]
}