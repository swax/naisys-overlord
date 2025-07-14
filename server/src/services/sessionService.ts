import { db } from './database'

export interface Session {
  token: string
  username: string
  startDate: string
  expireDate: string
}

export async function createSession(token: string, username: string, startDate: Date, expireDate: Date): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO sessions (token, username, start_date, expire_date)
      VALUES (?, ?, ?, ?)
    `
    
    db.run(sql, [token, username, startDate.toISOString(), expireDate.toISOString()], function(err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export async function getSession(token: string): Promise<Session | null> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT token, username, start_date as startDate, expire_date as expireDate
      FROM sessions 
      WHERE token = ? AND expire_date > datetime('now')
    `
    
    db.get(sql, [token], (err, row: Session | undefined) => {
      if (err) {
        reject(err)
      } else {
        resolve(row || null)
      }
    })
  })
}

export async function deleteExpiredSessions(): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM sessions WHERE expire_date <= datetime('now')`
    
    db.run(sql, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export async function deleteSession(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM sessions WHERE token = ?`
    
    db.run(sql, [token], (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}