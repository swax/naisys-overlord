import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, AppShell, Burger, Group, Text, Stack, Card, Badge, ActionIcon, Flex } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Notifications } from '@mantine/notifications'
import { IconRobot, IconMail, IconFileText, IconSettings, IconDeviceGamepad2, IconLock, IconLockOpen } from '@tabler/icons-react'
import { queryClient } from './lib/queryClient'
import { Home } from './pages/Home'
import { Log } from './pages/Log'
import { Mail } from './pages/Mail'
import { Controls } from './pages/Controls'
import { SettingsDialog } from './components/SettingsDialog'
import { AccessDialog } from './components/AccessDialog'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'


const AppContent: React.FC = () => {
  const [opened, { toggle }] = useDisclosure()
  const [accessModalOpened, { open: openAccessModal, close: closeAccessModal }] = useDisclosure(false)
  const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const agents = [
    { name: 'All', title: 'All Agents', status: 'system' },
    { name: 'Zane', title: 'Pipeline Manager', status: 'active' },
    { name: 'Chunk', title: 'Video Processor', status: 'active' },
    { name: 'Darrell', title: 'DBA', status: 'idle' },
    { name: 'Maya', title: 'Frontend Developer', status: 'active' },
    { name: 'Alex', title: 'DevOps Engineer', status: 'busy' },
  ]

  const isActive = (path: string) => {
    const currentSection = location.pathname.split('/')[1]
    const targetSection = path.replace('/', '')
    return currentSection === targetSection
  }
  const isAgentSelected = (agentName: string) => {
    const pathParts = location.pathname.split('/')
    if (agentName.toLowerCase() === 'all') {
      // "All" is selected if there's no agent in the URL (just the section)
      return !pathParts[2]
    }
    return pathParts[2]?.toLowerCase() === agentName.toLowerCase()
  }
  const getCurrentSection = () => location.pathname.split('/')[1]

  // Check for existing session on component mount
  React.useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const response = await fetch('/api/session')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error('Session check failed:', error)
      }
    }

    checkExistingSession()
  }, [])

  const handleLockIconClick = () => {
    openAccessModal()
  }


  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
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
              style={{ cursor: 'pointer' }}
              onClick={handleLockIconClick}
            >
              <ActionIcon 
                variant={isAuthenticated ? "filled" : "subtle"}
                color={isAuthenticated ? "green" : undefined}
                size="lg" 
                aria-label={isAuthenticated ? "Authenticated" : "Access Key"}
              >
                {isAuthenticated ? <IconLockOpen size="1.2rem" /> : <IconLock size="1.2rem" />}
              </ActionIcon>
            </Group>
            <Group 
              gap="xs" 
              style={{ cursor: 'pointer' }}
              onClick={openSettingsModal}
            >
              <ActionIcon 
                variant="subtle"
                size="lg" 
                aria-label="Settings"
              >
                <IconSettings size="1.2rem" />
              </ActionIcon>
              <Text size="xs" visibleFrom="sm">Settings</Text>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Text size="sm" fw={600} mb="md" c="dimmed">
          AGENTS
        </Text>
        <Stack gap="xs">
          {agents.map((agent, index) => (
            <Card 
              key={index} 
              padding="sm" 
              radius="md" 
              withBorder
              style={{ 
                cursor: 'pointer',
                backgroundColor: isAgentSelected(agent.name) ? 'var(--mantine-color-blue-9)' : undefined
              }}
              onClick={() => {
                const currentSection = getCurrentSection()
                if (agent.name.toLowerCase() === 'all') {
                  // For "All", navigate to just the section (no agent)
                  if (currentSection && ['log', 'mail', 'controls'].includes(currentSection)) {
                    navigate(`/${currentSection}`)
                  } else {
                    navigate('/controls')
                  }
                } else {
                  // For specific agents
                  if (currentSection && ['log', 'mail', 'controls'].includes(currentSection)) {
                    navigate(`/${currentSection}/${agent.name.toLowerCase()}`)
                  } else {
                    navigate(`/controls/${agent.name.toLowerCase()}`)
                  }
                }
              }}
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
                <Badge
                  size="xs"
                  variant="light"
                  color={
                    agent.status === 'active' ? 'green' :
                    agent.status === 'busy' ? 'orange' :
                    agent.status === 'system' ? 'blue' : 'gray'
                  }
                >
                  {agent.status}
                </Badge>
              </Group>
            </Card>
          ))}
        </Stack>
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
            style={{ cursor: 'pointer' }}
            onClick={() => {
              const pathParts = location.pathname.split('/')
              const currentAgent = pathParts[2]
              if (currentAgent) {
                navigate(`/log/${currentAgent}`)
              } else {
                navigate('/log')
              }
            }}
          >
            <ActionIcon 
              variant={isActive('/log') ? 'filled' : 'subtle'} 
              size="lg" 
              aria-label="Log"
            >
              <IconFileText size="1.2rem" />
            </ActionIcon>
            <Text size="xs" visibleFrom="sm">Log</Text>
          </Group>
          <Group 
            gap="xs" 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              const pathParts = location.pathname.split('/')
              const currentAgent = pathParts[2]
              if (currentAgent) {
                navigate(`/mail/${currentAgent}`)
              } else {
                navigate('/mail')
              }
            }}
          >
            <ActionIcon 
              variant={isActive('/mail') ? 'filled' : 'subtle'} 
              size="lg" 
              aria-label="Mail"
            >
              <IconMail size="1.2rem" />
            </ActionIcon>
            <Text size="xs" visibleFrom="sm">Mail</Text>
          </Group>
          <Group 
            gap="xs" 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              const pathParts = location.pathname.split('/')
              const currentAgent = pathParts[2]
              if (currentAgent) {
                navigate(`/controls/${currentAgent}`)
              } else {
                navigate('/controls')
              }
            }}
          >
            <ActionIcon 
              variant={isActive('/controls') ? 'filled' : 'subtle'} 
              size="lg" 
              aria-label="Controls"
            >
              <IconDeviceGamepad2 size="1.2rem" />
            </ActionIcon>
            <Text size="xs" visibleFrom="sm">Controls</Text>
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
  )
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark">
        <Notifications />
        <Router basename="/overlord">
          <AppContent />
        </Router>
      </MantineProvider>
    </QueryClientProvider>
  )
}

export default App