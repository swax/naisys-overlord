export interface Settings {
  naisysDataFolderPaths: string[]
}

export interface SettingsRequest {
  naisysDataFolderPaths: string[]
}

export interface SettingsResponse {
  success: boolean
  message: string
  settings?: Settings
}