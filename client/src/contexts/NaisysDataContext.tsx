import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ReadStatus } from "shared";
import { useNaisysData } from "../hooks/useNaisysData";
import { Agent, LogEntry, ThreadMessage } from "../lib/api";

interface NaisysDataContextType {
  allLogs: LogEntry[];
  allMail: ThreadMessage[];
  agents: Agent[];
  isLoading: boolean;
  error: Error | null;
  readStatus: Record<string, ReadStatus>;
  getLogsForAgent: (agent?: string) => LogEntry[];
  getMailForAgent: (agent?: string) => ThreadMessage[];
  updateReadStatus: (
    agentName: string,
    lastReadLogId?: number,
    lastReadMailId?: number,
  ) => Promise<void>;
}

const NaisysDataContext = createContext<NaisysDataContextType | undefined>(
  undefined,
);

export const NaisysDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [allMail, setAllMail] = useState<ThreadMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [readStatus, setReadStatus] = useState<Record<string, ReadStatus>>({});
  const { data: naisysResponse, isLoading, error } = useNaisysData();

  // Update data from NAISYS polling responses
  useEffect(() => {
    if (naisysResponse?.success && naisysResponse.data) {
      // Update agents
      setAgents(naisysResponse.data.agents);

      // Update read status
      setReadStatus(naisysResponse.data.readStatus);

      // Update logs
      setAllLogs((prevLogs) => {
        const newLogs = naisysResponse.data!.logs;
        if (newLogs.length === 0) return prevLogs;

        // If this is the first fetch or we're starting fresh, replace all logs
        if (prevLogs.length === 0) {
          return newLogs;
        }

        // Otherwise, append new logs that aren't already in the list
        const maxExistingId = Math.max(...prevLogs.map((log) => log.id), -1);
        const trulyNewLogs = newLogs.filter(
          (log: LogEntry) => log.id > maxExistingId,
        );

        return [...prevLogs, ...trulyNewLogs];
      });

      // Update mail
      setAllMail((prevMail) => {
        const newMail = naisysResponse.data!.mail;
        if (newMail.length === 0) return prevMail;

        // If this is the first fetch or we're starting fresh, replace all mail
        if (prevMail.length === 0) {
          return newMail;
        }

        // Otherwise, append new mail that aren't already in the list
        const maxExistingId = Math.max(...prevMail.map((mail) => mail.id), -1);
        const trulyNewMail = newMail.filter(
          (mail: ThreadMessage) => mail.id > maxExistingId,
        );

        return [...prevMail, ...trulyNewMail];
      });
    }
  }, [naisysResponse]);

  const getLogsForAgent = useMemo(() => {
    return (agent?: string): LogEntry[] => {
      if (!agent) {
        return allLogs;
      }
      return allLogs.filter((log) => log.username === agent);
    };
  }, [allLogs]);

  const getMailForAgent = useMemo(() => {
    return (agent?: string): ThreadMessage[] => {
      if (!agent) {
        return allMail;
      }
      return allMail.filter(
        (mail) =>
          mail.username === agent ||
          mail.members.some((member) => member.username === agent!),
      );
    };
  }, [allMail]);

  const updateReadStatus = async (
    agentName: string,
    lastReadLogId?: number,
    lastReadMailId?: number,
  ): Promise<void> => {
    try {
      const body: any = { agentName };
      if (lastReadLogId !== undefined) body.lastReadLogId = lastReadLogId;
      if (lastReadMailId !== undefined) body.lastReadMailId = lastReadMailId;

      const response = await fetch("/api/read-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const updateStatus = readStatus[agentName] || {
          lastReadLogId: -1,
          latestLogId: -1,
          lastReadMailId: -1,
          latestMailId: -1,
        };

        if (lastReadLogId !== undefined) {
          updateStatus.lastReadLogId = Math.max(
            updateStatus.lastReadLogId,
            lastReadLogId,
          );
        }

        if (lastReadMailId !== undefined) {
          updateStatus.lastReadMailId = Math.max(
            updateStatus.lastReadMailId,
            lastReadMailId,
          );
        }

        setReadStatus((prevStatus) => ({
          ...prevStatus,
          [agentName]: updateStatus,
        }));
      }
    } catch (error) {
      console.error("Failed to update read status:", error);
    }
  };

  const value: NaisysDataContextType = {
    allLogs,
    allMail,
    agents,
    isLoading,
    error,
    readStatus,
    getLogsForAgent,
    getMailForAgent,
    updateReadStatus,
  };

  return (
    <NaisysDataContext.Provider value={value}>
      {children}
    </NaisysDataContext.Provider>
  );
};

export const useNaisysDataContext = (): NaisysDataContextType => {
  const context = useContext(NaisysDataContext);
  if (context === undefined) {
    throw new Error(
      "useNaisysDataContext must be used within a NaisysDataProvider",
    );
  }
  return context;
};
