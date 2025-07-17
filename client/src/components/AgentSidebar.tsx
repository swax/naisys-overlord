import { Badge, Card, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconFileText, IconMail, IconRobot } from "@tabler/icons-react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Agent } from "shared";
import { useNaisysDataContext } from "../contexts/NaisysDataContext";

export const AgentSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agents, isLoading, readStatus } = useNaisysDataContext();

  const isAgentSelected = (agentName: string) => {
    const pathParts = location.pathname.split("/");
    if (agentName === "all") {
      return !pathParts[2];
    }
    return pathParts[2] === agentName;
  };

  const getCurrentSection = () => location.pathname.split("/")[1];

  const handleAgentClick = (agent: Agent) => {
    const currentSection = getCurrentSection();
    if (agent.name === "all") {
      if (
        currentSection &&
        ["log", "mail", "controls"].includes(currentSection)
      ) {
        navigate(`/${currentSection}`);
      } else {
        navigate("/controls");
      }
    } else {
      if (
        currentSection &&
        ["log", "mail", "controls"].includes(currentSection)
      ) {
        navigate(`/${currentSection}/${agent.name}`);
      } else {
        navigate(`/controls/${agent.name}`);
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <Text size="sm" fw={600} mb="md" c="dimmed">
          AGENTS
        </Text>
        <Text size="sm" c="dimmed">
          Loading agents...
        </Text>
      </>
    );
  }

  const organizeAgentsHierarchically = (agents: Agent[]): Agent[] => {
    const leadAgents: Agent[] = [];
    const subAgents: Agent[] = [];
    const orphanedSubAgents: Agent[] = [];

    agents.forEach((agent) => {
      if (agent.leadUsername) {
        subAgents.push(agent);
      } else {
        leadAgents.push(agent);
      }
    });

    leadAgents.sort((a, b) => a.name.localeCompare(b.name));

    const organizedAgents: Agent[] = [];

    subAgents.forEach((subAgent) => {
      const leadExists = leadAgents.some(
        (lead) => lead.name === subAgent.leadUsername,
      );
      if (!leadExists) {
        orphanedSubAgents.push(subAgent);
      }
    });

    orphanedSubAgents.sort((a, b) => a.name.localeCompare(b.name));
    organizedAgents.push(...orphanedSubAgents);

    leadAgents.forEach((leadAgent) => {
      organizedAgents.push(leadAgent);

      const relatedSubAgents = subAgents
        .filter((sub) => sub.leadUsername === leadAgent.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      organizedAgents.push(...relatedSubAgents);
    });

    return organizedAgents;
  };

  const getUnreadLogBadge = (agent: Agent) => {
    const agentReadStatus = readStatus[agent.name];
    if (
      !agentReadStatus ||
      agentReadStatus.latestLogId <= agentReadStatus.lastReadLogId
    ) {
      return null;
    }

    return (
      <Tooltip
        label={`Latest: ${agentReadStatus.latestLogId}\nLast read: ${agentReadStatus.lastReadLogId}`}
      >
        <Badge
          size="xs"
          variant="filled"
          color="purple"
          p={0}
          pl={1}
          pt={3}
          w={20}
          h={20}
        >
          <IconFileText size="0.8rem" />
        </Badge>
      </Tooltip>
    );
  };

  const getUnreadMailBadge = (agent: Agent) => {
    const agentReadStatus = readStatus[agent.name];
    if (
      !agentReadStatus ||
      agentReadStatus.latestMailId <= agentReadStatus.lastReadMailId
    ) {
      return null;
    }

    return (
      <Tooltip
        label={`Latest: ${agentReadStatus.latestMailId}\nLast read: ${agentReadStatus.lastReadMailId}`}
      >
        <Badge
          size="xs"
          variant="filled"
          color="blue"
          p={0}
          pl={0}
          pt={3}
          w={20}
          h={20}
        >
          <IconMail size="0.8rem" />
        </Badge>
      </Tooltip>
    );
  };

  return (
    <>
      <Text size="sm" fw={600} mb="md" c="dimmed">
        AGENTS
      </Text>
      <Stack gap="xs">
        {organizeAgentsHierarchically(agents).map((agent, index) => (
          <Card
            key={index}
            padding="sm"
            radius="md"
            withBorder
            style={{
              cursor: "pointer",
              backgroundColor: isAgentSelected(agent.name)
                ? "var(--mantine-color-blue-9)"
                : undefined,
              opacity: agent.name === "All" ? 1 : agent.online ? 1 : 0.5,
              marginLeft: agent.leadUsername ? "1rem" : undefined,
            }}
            onClick={() => handleAgentClick(agent)}
          >
            <Group justify="space-between" align="center">
              <div>
                <Group gap="xs" align="center">
                  <IconRobot size="1rem" />
                  <Text size="sm" fw={500}>
                    {agent.name}
                  </Text>
                  {getUnreadLogBadge(agent)}
                  {getUnreadMailBadge(agent)}
                </Group>
                <Text size="xs" c="dimmed">
                  {agent.title}
                </Text>
              </div>
              {agent.name !== "All" && (
                <Badge
                  size="xs"
                  variant="light"
                  color={agent.online ? "green" : "gray"}
                >
                  {agent.online ? "online" : "offline"}
                </Badge>
              )}
            </Group>
          </Card>
        ))}
      </Stack>
    </>
  );
};
