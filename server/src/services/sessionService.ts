import { runOverlordDbCommand } from "../database/overlordDatabase";

export interface Session {
  token: string;
  username: string;
  startDate: string;
  expireDate: string;
}

export async function createSession(
  token: string,
  username: string,
  startDate: Date,
  expireDate: Date,
): Promise<void> {
  await runOverlordDbCommand<void>(
    `
    INSERT INTO sessions (token, username, start_date, expire_date)
    VALUES (?, ?, ?, ?)
  `,
    [token, username, startDate.toISOString(), expireDate.toISOString()],
  );
}

export async function getSession(token: string): Promise<Session | null> {
  return await runOverlordDbCommand<Session | null>(
    `
    SELECT token, username, start_date as startDate, expire_date as expireDate
    FROM sessions
    WHERE token = ? AND expire_date > datetime('now')
  `,
    [token],
  );
}

export async function deleteExpiredSessions(): Promise<void> {
  return await runOverlordDbCommand<void>(
    `
    DELETE FROM sessions WHERE expire_date <= datetime('now')
  `,
  );
}

export async function deleteSession(token: string): Promise<void> {
  return await runOverlordDbCommand<void>(
    `
    DELETE FROM sessions WHERE token = ?
  `,
    [token],
  );
}
