import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Text, Stack, Card, Badge, Group } from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";
import { Agent } from "shared";
import { useNaisysDataContext } from "../contexts/NaisysDataContext";

export const AgentSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agents, isLoading } = useNaisysDataContext();

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

  return (
    <>
      <Text size="sm" fw={600} mb="md" c="dimmed">
        AGENTS
      </Text>
      <Stack gap="xs">
        {agents
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
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
