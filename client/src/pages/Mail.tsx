import React, { useState } from "react";
import { Text, Stack, Card, Group, Button, Alert, Loader, ActionIcon, Flex } from "@mantine/core";
import { IconSend, IconMailbox, IconPlus } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { useNaisysDataContext } from "../contexts/NaisysDataContext";
import { ThreadMessage } from "../lib/api";

const MailMessageComponent: React.FC<{ message: ThreadMessage; currentAgent?: string }> = ({ message, currentAgent }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFromCurrentAgent = currentAgent && message.username.toLowerCase() === currentAgent.toLowerCase();
  const membersExcludingSender = message.members.filter(member => 
    member.username.toLowerCase() !== message.username.toLowerCase()
  );
  
  const displayName = isFromCurrentAgent 
    ? membersExcludingSender.map(m => m.username).join(", ") || "Unknown"
    : message.username;
  
  const hasMoreContent = message.message.includes('\n') || message.message.length > 100;
  const displayText = isExpanded ? message.message : message.message;
  
  return (
    <Card 
      padding="md" 
      radius="md" 
      withBorder 
      style={{ 
        marginBottom: "8px",
        cursor: hasMoreContent ? "pointer" : "default"
      }}
      onClick={() => hasMoreContent && setIsExpanded(!isExpanded)}
    >
      <Stack gap="sm">
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="sm" style={{ minWidth: 0 }}>
            <ActionIcon 
              variant="light" 
              color={isFromCurrentAgent ? "blue" : "green"}
              size="sm"
              title={isFromCurrentAgent ? "Sent" : "Received"}
            >
              {isFromCurrentAgent ? <IconSend size={16} /> : <IconMailbox size={16} />}
            </ActionIcon>
            <Text size="sm" fw={500} style={{ minWidth: "80px", flexShrink: 0 }}>
              {displayName}
            </Text>
            <Text size="sm" fw={600} style={{ flex: 1, minWidth: 0 }}>
              {message.subject}
            </Text>
          </Flex>
          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
            {new Date(message.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })} {new Date(message.date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </Text>
        </Flex>
        <Text 
          style={{ 
            whiteSpace: isExpanded ? "pre-wrap" : "nowrap",
            wordBreak: "break-word",
            overflow: isExpanded ? "visible" : "hidden",
            textOverflow: isExpanded ? "clip" : "ellipsis"
          }}
          c={isExpanded ? undefined : "dimmed"}
        >
          {displayText}
          {hasMoreContent && !isExpanded && (
            <Text component="span" c="dimmed" size="sm"> (click to expand)</Text>
          )}
        </Text>
      </Stack>
    </Card>
  );
};

export const Mail: React.FC = () => {
  const { agent: agentParam } = useParams<{ agent: string }>();
  const {
    agents,
    getMailForAgent,
    isLoading: mailLoading,
    error: mailError,
  } = useNaisysDataContext();
  
  const [showSent, setShowSent] = useState(false);
  const [showReceived, setShowReceived] = useState(false);

  // Get filtered mail for the current agent
  const allMail = getMailForAgent(agentParam);

  // Filter mail based on sent/received status and sort by newest first
  const getFilteredMail = (): ThreadMessage[] => {
    // If neither button is selected, show all messages
    if (!showSent && !showReceived) {
      return allMail.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    return allMail
      .filter((mail) => {
        const currentAgent = agentParam?.toLowerCase();
        const messageFromCurrentAgent = mail.username.toLowerCase() === currentAgent;
        
        if (showSent && showReceived) return true;
        if (showSent && messageFromCurrentAgent) return true;
        if (showReceived && !messageFromCurrentAgent) return true;
        
        return false;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredMail = getFilteredMail();

  // Calculate sent and received counts
  const sentCount = allMail.filter(mail => {
    const currentAgent = agentParam?.toLowerCase();
    return mail.username.toLowerCase() === currentAgent;
  }).length;
  
  const receivedCount = allMail.filter(mail => {
    const currentAgent = agentParam?.toLowerCase();
    return mail.username.toLowerCase() !== currentAgent;
  }).length;

  if (mailLoading) {
    return <Loader size="lg" />;
  }

  if (!agentParam) {
    return (
      <Stack gap="md" style={{ height: "100%" }}>
        <Group justify="space-between">
          <Text size="xl" fw={600}>
            Mail Overview
          </Text>
        </Group>

        {mailError && (
          <Alert color="red" title="Error loading mail">
            {mailError instanceof Error
              ? mailError.message
              : "Failed to load mail"}
          </Alert>
        )}
        
        {mailLoading ? (
          <Group justify="center">
            <Loader size="md" />
            <Text>Loading mail...</Text>
          </Group>
        ) : (
          <Stack gap="lg" align="center">
            <Card padding="xl" radius="md" withBorder>
              <Stack gap="sm" align="center">
                <Text size="xl" fw={700} c="blue">
                  {allMail.length}
                </Text>
                <Text size="lg" c="dimmed">Total Messages</Text>
              </Stack>
            </Card>
            <Text c="dimmed" ta="center">
              Select an agent from the sidebar to view their mail
            </Text>
          </Stack>
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
      <Group justify="space-between">
        <Button
          variant="outline"
          size="xs"
          leftSection={<IconPlus size={16} />}
        >
          New Message
        </Button>
        <Group gap="md">
          <Button
            variant={showReceived ? "filled" : "outline"}
            size="xs"
            onClick={() => setShowReceived(!showReceived)}
            leftSection={<IconMailbox size={14} />}
          >
            Received ({receivedCount})
          </Button>
          <Button
            variant={showSent ? "filled" : "outline"}
            size="xs"
            onClick={() => setShowSent(!showSent)}
            leftSection={<IconSend size={14} />}
          >
            Sent ({sentCount})
          </Button>
        </Group>
      </Group>

      {mailError && (
        <Alert color="red" title="Error loading mail">
          {mailError instanceof Error
            ? mailError.message
            : "Failed to load mail"}
        </Alert>
      )}

      {mailLoading && allMail.length === 0 && (
        <Group justify="center">
          <Loader size="md" />
          <Text>Loading mail...</Text>
        </Group>
      )}

      <Stack gap="xs">
        {filteredMail.map((message) => (
          <MailMessageComponent key={message.id} message={message} currentAgent={agentParam} />
        ))}
        {filteredMail.length === 0 && !mailLoading && (
          <Text c="dimmed" ta="center">
            No mail messages available for {agent.name}
          </Text>
        )}
      </Stack>
    </Stack>
  );
};
