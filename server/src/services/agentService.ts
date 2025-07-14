import sqlite3 from 'sqlite3'
import { promises as fs } from 'fs'
import path from 'path'
import { Agent } from 'shared'
import { getSettings } from './settingsService.js'

sqlite3.verbose()

interface NaisysUser {
  id: number
  username: string
  title: string
  agentPath: string
  leadUsername: string | null
  lastActive: string
}

export async function getAgents(): Promise<Agent[]> {
  const agents: Agent[] = [
    { name: 'All', title: 'All Agents', online: true }
  ];

  try {
    const settingsData = await getSettings()
    if (!settingsData) {
      return agents
    }

    const settings = JSON.parse(settingsData.settings_json)
    const naisysDataFolderPaths = settings.naisysDataFolderPaths || []

    for (const folderPath of naisysDataFolderPaths) {
      const dbPath = path.join(folderPath, 'database', 'naisys.sqlite')
      
      try {
        await fs.access(dbPath)
        const users = await readNaisysDatabase(dbPath)
        
        for (const user of users) {
          const online = isAgentOnline(user.lastActive)
          agents.push({
            name: user.username,
            title: user.title,
            online,
            lastActive: user.lastActive,
            agentPath: user.agentPath
          })
        }
      } catch (error) {
        console.warn(`Could not access naisys database at ${dbPath}:`, error)
      }
    }
  } catch (error) {
    console.error('Error reading agent data:', error)
  }

  return agents
}

async function readNaisysDatabase(dbPath: string): Promise<NaisysUser[]> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY)
    
    db.all(
      'SELECT id, username, title, agentPath, leadUsername, lastActive FROM Users',
      [],
      (err, rows: NaisysUser[]) => {
        db.close()
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      }
    )
  })
}

function isAgentOnline(lastActive: string): boolean {
  const now = new Date()
  const lastActiveDate = new Date(lastActive)
  const diffInSeconds = (now.getTime() - lastActiveDate.getTime()) / 1000
  console.log('Time since last active:', diffInSeconds, 'seconds');
  console.log(`Now: ${now.toISOString()}, Last Active: ${lastActiveDate.toISOString()}`);
  return 0 < diffInSeconds && diffInSeconds < 5
}