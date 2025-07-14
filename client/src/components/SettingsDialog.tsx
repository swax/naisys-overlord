import React from 'react'
import { Modal, Stack, Alert, Text, Textarea, Group, Button } from '@mantine/core'
import { getSettings, saveSettings } from '../lib/api'

interface SettingsDialogProps {
  opened: boolean
  onClose: () => void
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ opened, onClose }) => {
  const [paths, setPaths] = React.useState('')
  const [settingsLoading, setSettingsLoading] = React.useState(false)
  const [settingsErrorMessage, setSettingsErrorMessage] = React.useState('')
  const [settingsSuccessMessage, setSettingsSuccessMessage] = React.useState('')

  const loadSettings = async () => {
    setSettingsLoading(true)
    setSettingsErrorMessage('')
    try {
      const response = await getSettings()
      if (response.success && response.settings) {
        setPaths(response.settings.naisysDataFolderPaths.join('\n'))
      } else {
        setSettingsErrorMessage(response.message || 'Failed to load settings')
      }
    } catch (error) {
      setSettingsErrorMessage('Error loading settings')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSettingsLoading(true)
    setSettingsErrorMessage('')
    setSettingsSuccessMessage('')
    
    try {
      const pathArray = paths.split('\n').map(path => path.trim()).filter(path => path.length > 0)
      const response = await saveSettings({ naisysDataFolderPaths: pathArray })
      
      if (response.success) {
        setSettingsSuccessMessage('Settings saved successfully!')
        setTimeout(() => {
          setSettingsSuccessMessage('')
          onClose()
        }, 1500)
      } else {
        setSettingsErrorMessage(response.message || 'Failed to save settings')
      }
    } catch (error) {
      setSettingsErrorMessage('Error saving settings')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setSettingsErrorMessage('')
    setSettingsSuccessMessage('')
  }

  React.useEffect(() => {
    if (opened) {
      loadSettings()
    }
  }, [opened])

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="NAISYS Overlord Settings"
      size="lg"
      centered
    >
      <Stack gap="md">
        {settingsErrorMessage && (
          <Alert color="red" variant="light">
            {settingsErrorMessage}
          </Alert>
        )}
        
        {settingsSuccessMessage && (
          <Alert color="green" variant="light">
            {settingsSuccessMessage}
          </Alert>
        )}

        <div>
          <Text size="sm" fw={500} mb="xs">
            NAISYS Data Folder Paths
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            Enter one folder path per line. These paths will be monitored by the NAISYS system.
          </Text>
          <Textarea
            value={paths}
            onChange={(event) => setPaths(event.currentTarget.value)}
            placeholder={`/path/to/folder1\n/path/to/folder2\n/path/to/folder3`}
            minRows={3}
            maxRows={8}
            autosize
            disabled={settingsLoading}
          />
        </div>

        <Group justify="flex-end" gap="xs">
          <Button
            variant="light"
            onClick={handleClose}
            disabled={settingsLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSettings}
            loading={settingsLoading}
          >
            Save Settings
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}