import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  Stack,
  Card,
  Badge,
  Group,
  ScrollArea,
  Loader,
  Alert,
} from "@mantine/core";
import { useParams } from "react-router-dom";
import { useNaisysDataContext } from "../contexts/NaisysDataContext";
import { LogEntry } from "../lib/api";

const LogEntryComponent: React.FC<{ log: LogEntry }> = ({ log }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "error":
        return "red";
      case "warning":
        return "yellow";
      case "info":
        return "blue";
      case "debug":
        return "gray";
      default:
        return "cyan";
    }
  };

  return (
    <Card padding="sm" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Badge color="violet" variant="light">
            {log.username}
          </Badge>
          <Badge color={getTypeColor(log.type)} variant="outline">
            {log.type}
          </Badge>
          <Badge color="gray" variant="subtle">
            {log.source}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {formatDate(log.date)}
        </Text>
      </Group>
      <Text
        size="sm"
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {log.message}
      </Text>
    </Card>
  );
};

export const Log: React.FC = () => {
  const { agent: agentParam } = useParams<{ agent: string }>();
  const { agents, getLogsForAgent, isLoading: logsLoading, error: logsError } = useNaisysDataContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Get filtered logs for the current agent
  const logs = getLogsForAgent(agentParam);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs, autoScroll]);

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
          <Stack gap="xs">
            {logs.map((log) => (
              <LogEntryComponent key={log.id} log={log} />
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
        <Stack gap="xs">
          {logs.map((log) => (
            <LogEntryComponent key={log.id} log={log} />
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
