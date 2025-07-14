import { db } from './database'

export interface Settings {
  id: number
  settings_json: string
  modify_date: string
}

export async function saveSettings(settingsJson: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT OR REPLACE INTO settings (id, settings_json, modify_date)
      VALUES (1, ?, ?)
    `
    
    db.run(sql, [settingsJson, new Date().toISOString()], function(err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export async function getSettings(): Promise<Settings | null> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, settings_json, modify_date
      FROM settings 
      WHERE id = 1
    `
    
    db.get(sql, [], (err, row: Settings | undefined) => {
      if (err) {
        reject(err)
      } else {
        resolve(row || null)
      }
    })
  })
}