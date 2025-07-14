import React from 'react'
import { Text, Stack, Card, Group, Badge, ScrollArea } from '@mantine/core'
import { useParams, useNavigate } from 'react-router-dom'
import { mailMessages } from '../data/mailData'

export const Mail: React.FC = () => {
  const { agent, messageId } = useParams<{ agent: string; messageId: string }>()
  const navigate = useNavigate()

  // Filter messages based on selected agent
  const getFilteredMessages = () => {
    if (!agent || agent === 'all') {
      return mailMessages
    }
    return mailMessages.filter(msg => 
      msg.from.toLowerCase() === agent.toLowerCase() || 
      msg.to.toLowerCase() === agent.toLowerCase()
    )
  }

  // Show individual message if messageId is present
  if (messageId) {
    const message = mailMessages.find(msg => msg.id === messageId)
    if (!message) {
      return <Text>Message not found</Text>
    }

    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="xl">Mail Message</Text>
          <Text 
            size="sm" 
            c="blue" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(agent ? `/mail/${agent}` : '/mail')}
          >
            ← Back to messages
          </Text>
        </Group>
        <Card padding="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600}>From: {message.from}</Text>
              <Text c="dimmed">{new Date(message.date).toLocaleString()}</Text>
            </Group>
            <Text>To: {message.to}</Text>
            <Text size="lg" fw={500}>{message.subject}</Text>
            <Text>{message.content}</Text>
          </Stack>
        </Card>
      </Stack>
    )
  }

  // Show message list
  const filteredMessages = getFilteredMessages()

  return (
    <Stack gap="md">
      <Text size="xl">
        {agent && agent !== 'all' ? `Mail for ${agent}` : 'All Mail'}
      </Text>
      
      <ScrollArea h={600}>
        <Stack gap="xs">
          {filteredMessages.map((message) => (
            <Card 
              key={message.id}
              padding="md" 
              radius="md" 
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(agent ? `/mail/${agent}/${message.id}` : `/mail/all/${message.id}`)}
            >
              <Group justify="space-between" align="flex-start">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="sm">
                    <Badge size="xs" variant="light">
                      {message.from} → {message.to}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {new Date(message.date).toLocaleDateString()}
                    </Text>
                  </Group>
                  <Text fw={500}>{message.subject}</Text>
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {message.content}
                  </Text>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  )
}