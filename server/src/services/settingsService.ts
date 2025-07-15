import { Settings } from "shared";
import { runOverlordDbCommand } from "../database/overlordDatabase";

export interface SettingsRecord {
  id: number;
  settings_json: string;
  modify_date: string;
  read_status_json: string;
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (!settings || typeof settings.naisysDataFolderPath !== "string") {
    throw new Error("Invalid settings format");
  }

  return await runOverlordDbCommand<void>(
    `
    INSERT OR REPLACE INTO settings (id, settings_json, modify_date)
    VALUES (1, ?, ?)
  `,
    [JSON.stringify(settings), new Date().toISOString()],
  );
}

export async function getSettings(): Promise<Settings | null> {
  const settingsRecords = await runOverlordDbCommand<SettingsRecord[] | null>(`
    SELECT id, settings_json, modify_date, read_status_json
    FROM settings 
    WHERE id = 1
  `);

  if (!settingsRecords?.length) {
    throw new Error("No settings found in the database.");
  }

  return JSON.parse(settingsRecords[0].settings_json) as Settings;
}

export async function getReadStatus(username: string): Promise<Record<string, number> | null> {
  const settingsRecords = await runOverlordDbCommand<SettingsRecord[] | null>(`
    SELECT read_status_json
    FROM settings 
    WHERE id = 1
  `);

  if (!settingsRecords?.length) {
    return {};
  }

  const readStatusByUser = JSON.parse(settingsRecords[0].read_status_json || '{}');
  return readStatusByUser[username] || {};
}

export async function getAllReadStatus(): Promise<Record<string, Record<string, number>>> {
  const settingsRecords = await runOverlordDbCommand<SettingsRecord[] | null>(`
    SELECT read_status_json
    FROM settings 
    WHERE id = 1
  `);

  if (!settingsRecords?.length) {
    return {};
  }

  return JSON.parse(settingsRecords[0].read_status_json || '{}');
}

export async function updateReadStatus(username: string, agentName: string, lastReadLogId: number): Promise<void> {
  // First get current read status
  const settingsRecords = await runOverlordDbCommand<SettingsRecord[] | null>(`
    SELECT read_status_json
    FROM settings 
    WHERE id = 1
  `);

  let readStatusByUser: Record<string, Record<string, number>> = {};
  if (settingsRecords?.length) {
    readStatusByUser = JSON.parse(settingsRecords[0].read_status_json || '{}');
  }

  // Update the read status for this user and agent
  if (!readStatusByUser[username]) {
    readStatusByUser[username] = {};
  }
  readStatusByUser[username][agentName] = lastReadLogId;

  // Save back to database
  return await runOverlordDbCommand<void>(
    `
    UPDATE settings 
    SET read_status_json = ?, modify_date = ?
    WHERE id = 1
  `,
    [JSON.stringify(readStatusByUser), new Date().toISOString()],
  );
}
