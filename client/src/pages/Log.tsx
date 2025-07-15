import React, { useEffect, useRef, useState } from "react";
import { Text, Stack, Group, ScrollArea, Loader, Alert } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useNaisysDataContext } from "../contexts/NaisysDataContext";
import { LogEntry } from "../lib/api";

const getLogColor = (log: LogEntry) => {
  if (log.type === "comment") return "green";
  if (log.type === "error") return "red";
  if (log.source === "llm" || log.source == "endPrompt") return "magenta";
  return undefined;
};

const formatLogTitle = (log: LogEntry) => {
  const date = new Date(log.date).toLocaleString();
  return `Date: ${date}\nType: ${log.type}\nSource: ${log.source}\nInput Mode: ${log.inputMode}\nRole: ${log.role}`;
};

const LogEntryComponent: React.FC<{ log: LogEntry }> = ({ log }) => {
  return (
    <Text
      size="sm"
      c={getLogColor(log)}
      title={formatLogTitle(log)}
      style={{
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        margin: 0,
        padding: 0,
      }}
    >
      {log.message}
    </Text>
  );
};

const groupPromptEntries = (logs: LogEntry[]): (LogEntry | LogEntry[])[] => {
  const grouped: (LogEntry | LogEntry[])[] = [];
  let i = 0;

  while (i < logs.length) {
    const current = logs[i];

    if (current.source === "startPrompt") {
      const group = [current];
      let j = i + 1;

      // Find the corresponding endPrompt (should be next immediate entry)
      if (j < logs.length && logs[j].source === "endPrompt") {
        group.push(logs[j]);
        j++;
      }

      grouped.push(group);
      i = j;
    } else {
      grouped.push(current);
      i++;
    }
  }

  return grouped;
};

const GroupedLogComponent: React.FC<{ item: LogEntry | LogEntry[] }> = ({
  item,
}) => {
  if (Array.isArray(item)) {
    return (
      <div style={{ display: "inline", margin: 0, padding: 0 }}>
        {item.map((log) => (
          <Text
            key={log.id}
            size="sm"
            c={getLogColor(log)}
            component="span"
            title={formatLogTitle(log)}
            style={{
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
              padding: 0,
            }}
          >
            {log.message}
          </Text>
        ))}
      </div>
    );
  }

  return <LogEntryComponent log={item} />;
};

export const Log: React.FC = () => {
  const { agent: agentParam } = useParams<{ agent: string }>();
  const {
    agents,
    getLogsForAgent,
    isLoading: logsLoading,
    error: logsError,
  } = useNaisysDataContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Get filtered logs for the current agent
  const logs = getLogsForAgent(agentParam);
  const groupedLogs = groupPromptEntries(logs);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [groupedLogs, autoScroll]);

  // Handle scroll detection to pause auto-scroll when user scrolls up
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setAutoScroll(isAtBottom);
    }
  };

  if (logsLoading) {
    return <Loader size="lg" />;
  }

  if (!agentParam) {
    return (
      <Stack gap="md" style={{ height: "100%" }}>
        <Text size="xl" fw={600}>
          All Agent Logs
        </Text>
        {logsError && (
          <Alert color="red" title="Error loading logs">
            {logsError instanceof Error
              ? logsError.message
              : "Failed to load logs"}
          </Alert>
        )}
        {logsLoading && logs.length === 0 && (
          <Group justify="center">
            <Loader size="md" />
            <Text>Loading logs...</Text>
          </Group>
        )}
        <ScrollArea
          h="calc(100vh - 100px)"
          viewportRef={scrollRef}
          onScrollPositionChange={handleScroll}
        >
          <Stack gap={0}>
            {groupedLogs.map((item) => (
              <GroupedLogComponent
                key={
                  Array.isArray(item)
                    ? item.map((log) => log.id).join("-")
                    : item.id
                }
                item={item}
              />
            ))}
            {logs.length === 0 && !logsLoading && (
              <Text c="dimmed" ta="center">
                No logs available
              </Text>
            )}
          </Stack>
        </ScrollArea>
        {!autoScroll && (
          <Text size="sm" c="blue" ta="center">
            Auto-scroll paused. Scroll to bottom to resume.
          </Text>
        )}
      </Stack>
    );
  }

  const agent = agents.find(
    (a) => a.name.toLowerCase() === agentParam.toLowerCase(),
  );

  if (!agent) {
    return (
      <Alert color="yellow" title="Agent not found">
        Agent "{agentParam}" not found
      </Alert>
    );
  }

  return (
    <Stack gap="md" style={{ height: "100%" }}>
      {logsError && (
        <Alert color="red" title="Error loading logs">
          {logsError instanceof Error
            ? logsError.message
            : "Failed to load logs"}
        </Alert>
      )}

      {logsLoading && logs.length === 0 && (
        <Group justify="center">
          <Loader size="md" />
          <Text>Loading logs...</Text>
        </Group>
      )}

      <ScrollArea
        h="calc(100vh - 100px)" // Adjust height to fit header/footer if needed
        viewportRef={scrollRef}
        onScrollPositionChange={handleScroll}
      >
        <Stack gap={0}>
          {groupedLogs.map((item) => (
            <GroupedLogComponent
              key={
                Array.isArray(item)
                  ? item.map((log) => log.id).join("-")
                  : item.id
              }
              item={item}
            />
          ))}
          {logs.length === 0 && !logsLoading && (
            <Text c="dimmed" ta="center">
              No logs available for {agent.name}
            </Text>
          )}
        </Stack>
      </ScrollArea>

      {!autoScroll && (
        <Text size="sm" c="blue" ta="center">
          Auto-scroll paused. Scroll to bottom to resume.
        </Text>
      )}
    </Stack>
  );
};
