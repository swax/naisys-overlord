import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { LogEntry, Agent } from "../lib/api";
import { useNaisysData } from "../hooks/useNaisysData";

interface NaisysDataContextType {
  allLogs: LogEntry[];
  agents: Agent[];
  isLoading: boolean;
  error: Error | null;
  readStatus: Record<string, number>;
  unreadLogStatus: Record<string, boolean>;
  getLogsForAgent: (agent?: string) => LogEntry[];
  updateReadStatus: (agentName: string, lastReadLogId: number) => Promise<void>;
}

const NaisysDataContext = createContext<NaisysDataContextType | undefined>(
  undefined,
);

export const NaisysDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [readStatus, setReadStatus] = useState<Record<string, number>>({});
  const [unreadLogStatus, setUnreadLogStatus] = useState<
    Record<string, boolean>
  >({});
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

      // iternate readStatus
      const newUnreadLogStatus: Record<string, boolean> = {};

      for (const agent of naisysResponse.data.agents) {
        const agentName = agent.name.toLowerCase();
        const lastReadLogId = naisysResponse.data.readStatus[agentName] || 0;
        const latestLogId = Math.max(
          ...naisysResponse.data.logs
            .filter((log) => log.username.toLowerCase() === agentName)
            .map((log) => log.id),
          0,
        );
        newUnreadLogStatus[agentName] = latestLogId > lastReadLogId;
      }
      setUnreadLogStatus(newUnreadLogStatus);
    }
  }, [naisysResponse]);

  const getLogsForAgent = useMemo(() => {
    return (agent?: string): LogEntry[] => {
      if (!agent) {
        return allLogs;
      }
      return allLogs.filter(
        (log) => log.username.toLowerCase() === agent.toLowerCase(),
      );
    };
  }, [allLogs]);

  const updateReadStatus = async (
    agentName: string,
    lastReadLogId: number,
  ): Promise<void> => {
    try {
      const response = await fetch("/api/read-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentName,
          lastReadLogId,
        }),
      });

      if (response.ok) {
        // Update local state immediately
        setReadStatus((prev) => ({
          ...prev,
          [agentName]: lastReadLogId,
        }));

        setUnreadLogStatus((prev) => ({
          ...prev,
          [agentName]: false,
        }));
      }
    } catch (error) {
      console.error("Failed to update read status:", error);
    }
  };

  const value: NaisysDataContextType = {
    allLogs,
    agents,
    isLoading,
    error,
    readStatus,
    getLogsForAgent,
    updateReadStatus,
    unreadLogStatus,
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
