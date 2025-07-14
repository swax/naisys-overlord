export interface Settings {
  naisysDataFolderPath: string;
}

export interface SettingsRequest {
  settings: Settings;
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  settings?: Settings;
}
