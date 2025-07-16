import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { LogEntry, ThreadMessage } from "shared";
import { getNaisysData, NaisysDataParams } from "../lib/api";

export const useNaisysData = () => {
  const lastLogIdRef = useRef<number>(-1);
  const lastMailIdRef = useRef<number>(-1);

  const queryFn = useCallback(async () => {
    const params: NaisysDataParams = {
      logsAfter: lastLogIdRef.current,
      logsLimit: 10000,
      mailAfter: lastMailIdRef.current,
      mailLimit: 1000,
    };

    const response = await getNaisysData(params);

    if (response.success && response.data) {
      // Update last log ID
      if (response.data.logs && response.data.logs.length > 0) {
        const maxLogId = Math.max(
          ...response.data.logs.map((log: LogEntry) => log.id),
        );
        lastLogIdRef.current = maxLogId;
      }

      // Update last mail ID
      if (response.data.mail && response.data.mail.length > 0) {
        const maxMailId = Math.max(
          ...response.data.mail.map((mail: ThreadMessage) => mail.id),
        );
        lastMailIdRef.current = maxMailId;
      }
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
