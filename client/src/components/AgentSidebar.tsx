import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Text, Stack, Card, Badge, Group } from "@mantine/core";
import { IconRobot, IconFileText } from "@tabler/icons-react";
import { Agent } from "shared";
import { useNaisysDataContext } from "../contexts/NaisysDataContext";

export const AgentSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agents, isLoading, unreadLogStatus } = useNaisysDataContext();

  const isAgentSelected = (agentName: string) => {
    const pathParts = location.pathname.split("/");
    if (agentName.toLowerCase() === "all") {
      return !pathParts[2];
    }
    return pathParts[2]?.toLowerCase() === agentName.toLowerCase();
  };

  const getCurrentSection = () => location.pathname.split("/")[1];

  const handleAgentClick = (agent: Agent) => {
    const currentSection = getCurrentSection();
    if (agent.name.toLowerCase() === "all") {
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
        navigate(`/${currentSection}/${agent.name.toLowerCase()}`);
      } else {
        navigate(`/controls/${agent.name.toLowerCase()}`);
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

    agents.forEach(agent => {
      if (agent.leadUsername) {
        subAgents.push(agent);
      } else {
        leadAgents.push(agent);
      }
    });

    leadAgents.sort((a, b) => a.name.localeCompare(b.name));

    const organizedAgents: Agent[] = [];

    subAgents.forEach(subAgent => {
      const leadExists = leadAgents.some(lead => lead.name === subAgent.leadUsername);
      if (!leadExists) {
        orphanedSubAgents.push(subAgent);
      }
    });

    orphanedSubAgents.sort((a, b) => a.name.localeCompare(b.name));
    organizedAgents.push(...orphanedSubAgents);

    leadAgents.forEach(leadAgent => {
      organizedAgents.push(leadAgent);
      
      const relatedSubAgents = subAgents
        .filter(sub => sub.leadUsername === leadAgent.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      organizedAgents.push(...relatedSubAgents);
    });

    return organizedAgents;
  };

  return (
    <>
      <Text size="sm" fw={600} mb="md" c="dimmed">
        AGENTS
      </Text>
      <Stack gap="xs">
        {organizeAgentsHierarchically(agents)
          .map((agent, index) => (
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
                    {unreadLogStatus[agent.name.toLowerCase()] && (
                      <Badge
                        size="xs"
                        variant="filled"
                        color="blue"
                        p={0}
                        pl={1}
                        pt={3}
                        w={20}
                        h={20}
                      >
                        <IconFileText size="0.8rem" />
                      </Badge>
                    )}
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
