import React from 'react'
import { Text } from '@mantine/core'
import { useParams } from 'react-router-dom'

export const Log: React.FC = () => {
  const { agent } = useParams<{ agent: string }>()

  return (
    <Text size="xl">
      {agent ? `Log for ${agent}` : 'Log'}
    </Text>
  )
}