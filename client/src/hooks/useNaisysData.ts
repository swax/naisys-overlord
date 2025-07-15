import { useQuery } from "@tanstack/react-query";
import { useRef, useCallback, useMemo } from "react";
import { getNaisysData, NaisysDataParams } from "../lib/api";
import { Agent, LogEntry } from "shared";

export const useNaisysData = () => {
  const lastLogIdRef = useRef<number>(-1);

  const queryFn = useCallback(async () => {
    const params: NaisysDataParams = {
      after: lastLogIdRef.current,
      limit: 100,
    };

    const response = await getNaisysData(params);
    
    if (response.success && response.data?.logs && response.data.logs.length > 0) {
      const maxId = Math.max(...response.data.logs.map((log: LogEntry) => log.id));
      lastLogIdRef.current = maxId;
    }
    
    return response;
  }, []);

  return useQuery({
    queryKey: ["naisys-data"],
    queryFn,
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook to get agents from NAISYS data
export const useAgentsFromNaisys = () => {
  const naisysQuery = useNaisysData();
  
  const agents = useMemo((): Agent[] => {
    if (!naisysQuery.data?.success || !naisysQuery.data.data?.agents) {
      return [{ name: "All", title: "All Agents", online: true }];
    }
    return naisysQuery.data.data.agents;
  }, [naisysQuery.data]);

  return {
    data: { success: true, agents },
    isLoading: naisysQuery.isLoading,
    error: naisysQuery.error,
  };
};

// Hook to get logs for a specific agent from NAISYS data
export const useLogsFromNaisys = (agent?: string) => {
  const naisysQuery = useNaisysData();
  
  const filteredLogs = useMemo((): LogEntry[] => {
    if (!naisysQuery.data?.success || !naisysQuery.data.data?.logs) {
      return [];
    }
    
    const allLogs = naisysQuery.data.data.logs;
    
    // If no agent specified, return all logs
    if (!agent) {
      return allLogs;
    }
    
    // Filter logs for the specific agent
    return allLogs.filter(
      (log: LogEntry) => log.username.toLowerCase() === agent.toLowerCase()
    );
  }, [naisysQuery.data, agent]);

  return {
    data: { success: true, logs: filteredLogs },
    isLoading: naisysQuery.isLoading,
    error: naisysQuery.error,
  };
};