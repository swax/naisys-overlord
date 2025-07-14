import sqlite3 from 'sqlite3'

sqlite3.verbose()

const dbPath = process.env.OVERLORD_DB_PATH || './overlord.db'
export const db = new sqlite3.Database(dbPath)

const createSessionTable = `
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    start_date TEXT NOT NULL,
    expire_date TEXT NOT NULL
  )
`

const createSettingsTable = `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    settings_json TEXT NOT NULL,
    modify_date TEXT NOT NULL
  )
`

db.run(createSessionTable)
db.run(createSettingsTable)