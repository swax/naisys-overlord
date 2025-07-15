import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  MantineProvider,
  AppShell,
  Burger,
  Group,
  Text,
  ActionIcon,
  Flex,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import {
  IconMail,
  IconFileText,
  IconSettings,
  IconDeviceGamepad2,
  IconLock,
  IconLockOpen,
} from "@tabler/icons-react";
import { queryClient } from "./lib/queryClient";
import { Home } from "./pages/Home";
import { Log } from "./pages/Log";
import { Mail } from "./pages/Mail";
import { Controls } from "./pages/Controls";
import { SettingsDialog } from "./components/SettingsDialog";
import { AccessDialog } from "./components/AccessDialog";
import { AgentSidebar } from "./components/AgentSidebar";
import { NaisysDataProvider } from "./contexts/NaisysDataContext";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const AppContent: React.FC = () => {
  const [opened, { toggle }] = useDisclosure();
  const [
    accessModalOpened,
    { open: openAccessModal, close: closeAccessModal },
  ] = useDisclosure(false);
  const [
    settingsModalOpened,
    { open: openSettingsModal, close: closeSettingsModal },
  ] = useDisclosure(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    const currentSection = location.pathname.split("/")[1];
    const targetSection = path.replace("/", "");
    return currentSection === targetSection;
  };

  // Check for existing session on component mount
  React.useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkExistingSession();
  }, []);

  const handleLockIconClick = () => {
    openAccessModal();
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      footer={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="lg" fw={500}>
              NAISYS Overlord
            </Text>
          </Group>
          <Group gap="xs">
            <Group
              gap="xs"
              style={{ cursor: "pointer" }}
              onClick={handleLockIconClick}
            >
              <ActionIcon
                variant={isAuthenticated ? "filled" : "subtle"}
                color={isAuthenticated ? "green" : undefined}
                size="lg"
                aria-label={isAuthenticated ? "Authenticated" : "Access Key"}
              >
                {isAuthenticated ? (
                  <IconLockOpen size="1.2rem" />
                ) : (
                  <IconLock size="1.2rem" />
                )}
              </ActionIcon>
            </Group>
            <Group
              gap="xs"
              style={{ cursor: "pointer" }}
              onClick={openSettingsModal}
            >
              <ActionIcon variant="subtle" size="lg" aria-label="Settings">
                <IconSettings size="1.2rem" />
              </ActionIcon>
              <Text size="xs" visibleFrom="sm">
                Settings
              </Text>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AgentSidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<Log />} />
          <Route path="/log/:agent" element={<Log />} />
          <Route path="/mail" element={<Mail />} />
          <Route path="/mail/:agent" element={<Mail />} />
          <Route path="/mail/:agent/:messageId" element={<Mail />} />
          <Route path="/controls" element={<Controls />} />
          <Route path="/controls/:agent" element={<Controls />} />
        </Routes>
      </AppShell.Main>

      <AppShell.Footer>
        <Flex h="100%" px="md" align="center" justify="space-evenly">
          <Group
            gap="xs"
            style={{ cursor: "pointer" }}
            onClick={() => {
              const pathParts = location.pathname.split("/");
              const currentAgent = pathParts[2];
              if (currentAgent) {
                navigate(`/log/${currentAgent}`);
              } else {
                navigate("/log");
              }
            }}
          >
            <ActionIcon
              variant={isActive("/log") ? "filled" : "subtle"}
              size="lg"
              aria-label="Log"
            >
              <IconFileText size="1.2rem" />
            </ActionIcon>
            <Text size="xs" visibleFrom="sm">
              Log
            </Text>
          </Group>
          <Group
            gap="xs"
            style={{ cursor: "pointer" }}
            onClick={() => {
              const pathParts = location.pathname.split("/");
              const currentAgent = pathParts[2];
              if (currentAgent) {
                navigate(`/mail/${currentAgent}`);
              } else {
                navigate("/mail");
              }
            }}
          >
            <ActionIcon
              variant={isActive("/mail") ? "filled" : "subtle"}
              size="lg"
              aria-label="Mail"
            >
              <IconMail size="1.2rem" />
            </ActionIcon>
            <Text size="xs" visibleFrom="sm">
              Mail
            </Text>
          </Group>
          <Group
            gap="xs"
            style={{ cursor: "pointer" }}
            onClick={() => {
              const pathParts = location.pathname.split("/");
              const currentAgent = pathParts[2];
              if (currentAgent) {
                navigate(`/controls/${currentAgent}`);
              } else {
                navigate("/controls");
              }
            }}
          >
            <ActionIcon
              variant={isActive("/controls") ? "filled" : "subtle"}
              size="lg"
              aria-label="Controls"
            >
              <IconDeviceGamepad2 size="1.2rem" />
            </ActionIcon>
            <Text size="xs" visibleFrom="sm">
              Controls
            </Text>
          </Group>
        </Flex>
      </AppShell.Footer>

      <AccessDialog
        opened={accessModalOpened}
        onClose={closeAccessModal}
        isAuthenticated={isAuthenticated}
        onAuthenticationChange={setIsAuthenticated}
      />

      <SettingsDialog
        opened={settingsModalOpened}
        onClose={closeSettingsModal}
      />
    </AppShell>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark">
        <Notifications />
        <NaisysDataProvider>
          <Router basename="/overlord">
            <AppContent />
          </Router>
        </NaisysDataProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default App;
