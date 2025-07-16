import { LogEntry, ReadStatus } from "shared";
import { runOverlordDbCommand } from "../database/overlordDatabase";
import { SettingsRecord } from "./settingsService";

export async function getReadStatus(): Promise<Record<string, ReadStatus>> {
  const settingsRecords = await runOverlordDbCommand<SettingsRecord[] | null>(`
    SELECT read_status_json
    FROM settings 
    WHERE id = 1
  `);

  if (!settingsRecords?.length) {
    return {};
  }

  return JSON.parse(settingsRecords[0].read_status_json || "{}");
}

async function saveReadStatus(
  readStatusByAgent: Record<string, ReadStatus>,
): Promise<void> {
  return await runOverlordDbCommand<void>(
    `
    UPDATE settings 
    SET read_status_json = ?, modify_date = ?
    WHERE id = 1
  `,
    [JSON.stringify(readStatusByAgent), new Date().toISOString()],
  );
}

export async function updateLatestReadLogId(
  agentName: string,
  lastReadLogId: number,
): Promise<void> {
  let readStatusByAgent = await getReadStatus();

  // Update the read status for this user and agent
  if (!readStatusByAgent[agentName]) {
    readStatusByAgent[agentName] = {
      lastReadLogId: -1,
      latestLogId: -1,
    };
  }

  const readStatus = readStatusByAgent[agentName];
  if (readStatus.lastReadLogId < lastReadLogId) {
    readStatus.lastReadLogId = lastReadLogId;
  }

  // Save back to database
  return await saveReadStatus(readStatusByAgent);
}

export async function updateLatestLogIds(logs: LogEntry[]): Promise<void> {
  let readStatusByAgent = await getReadStatus();

  // Update latest log ids for each agent
  logs.forEach((log) => {
    if (!readStatusByAgent[log.username]) {
      readStatusByAgent[log.username] = {
        lastReadLogId: -1,
        latestLogId: log.id,
      };
    }

    const readStatus = readStatusByAgent[log.username];
    if (readStatus.latestLogId < log.id) {
      readStatus.latestLogId = log.id;
    }
  });

  // Save back to database
  return await saveReadStatus(readStatusByAgent);
}
