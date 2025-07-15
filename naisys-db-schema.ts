export const createUserTable = `CREATE TABLE Users (
    id INTEGER PRIMARY KEY, 
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    agentPath TEXT NOT NULL,
    leadUsername TEXT,
    lastActive TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username),
    UNIQUE(agentPath)
  )`;

export const createThreadsTable = `CREATE TABLE Threads (
    id INTEGER PRIMARY KEY, 
    subject TEXT NOT NULL,
    tokenCount INTEGER NOT NULL DEFAULT 0
  )`;

export const createThreadMembersTable = `CREATE TABLE ThreadMembers (
    id INTEGER PRIMARY KEY, 
    threadId INTEGER NOT NULL, 
    userId INTEGER NOT NULL,
    newMsgId INTEGER NOT NULL DEFAULT -1,
    archived INTEGER NOT NULL DEFAULT 0,
    UNIQUE(threadId,userId),
    FOREIGN KEY(threadId) REFERENCES Threads(id),
    FOREIGN KEY(userId) REFERENCES Users(id)
  )`;

export const createThreadMessagesTable = `CREATE TABLE ThreadMessages (
    id INTEGER PRIMARY KEY, 
    threadId INTEGER NOT NULL, 
    userId INTEGER NOT NULL, 
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY(threadId) REFERENCES Threads(id),
    FOREIGN KEY(userId) REFERENCES Users(id)
  )`;

export const createCostsTable = `CREATE TABLE Costs (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL, 
    username TEXT NOT NULL,
    subagent TEXT,
    source TEXT NOT NULL,
    model TEXT NOT NULL,
    cost REAL DEFAULT 0,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cache_write_tokens INTEGER DEFAULT 0,
    cache_read_tokens INTEGER DEFAULT 0
  )`;

export const createDreamLogTable = `CREATE TABLE DreamLog (
    id INTEGER PRIMARY KEY, 
    username TEXT NOT NULL,
    date TEXT NOT NULL,
    dream TEXT NOT NULL
  )`;

export const createContextLogTable = `CREATE TABLE ContextLog (
    id INTEGER PRIMARY KEY, 
    username TEXT NOT NULL,
    role TEXT NOT NULL,
    source TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL
  )`;
