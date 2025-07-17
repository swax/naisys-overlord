import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import React, { useState, useEffect } from "react";
import { Agent } from "../lib/api";

interface NewMessageModalProps {
  opened: boolean;
  onClose: () => void;
  agents: Agent[];
  currentAgentName: string;
  onSend: (recipient: string, subject: string, body: string) => Promise<void>;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  opened,
  onClose,
  agents,
  currentAgentName,
  onSend,
}) => {
  const [sender, setSender] = useState<string>(currentAgentName);
  const [recipient, setRecipient] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update sender when currentAgentName changes
  useEffect(() => {
    setSender(currentAgentName);
  }, [currentAgentName]);

  // Create options for all agents (including current for sender selection)
  const allAgentOptions = agents.map((agent) => ({
    value: agent.name,
    label: agent.title ? `${agent.name} (${agent.title})` : agent.name,
  }));

  // Filter out the current sender from the recipients list
  const availableRecipients = allAgentOptions.filter((agent) => agent.value !== sender);

  const handleSend = async () => {
    if (!recipient || !subject.trim() || !body.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSend(recipient, subject, body);
      setSender(currentAgentName);
      setRecipient("");
      setSubject("");
      setBody("");
      onClose();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSender(currentAgentName);
      setRecipient("");
      setSubject("");
      setBody("");
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="lg">
          New Message
        </Text>
      }
      size="md"
    >
      <Stack gap="md">
        <Select
          label="From"
          placeholder="Select sender"
          data={allAgentOptions}
          value={sender}
          onChange={(value) => setSender(value || currentAgentName)}
          required
          searchable
          disabled={isLoading}
        />

        <Select
          label="To"
          placeholder="Select recipient"
          data={availableRecipients}
          value={recipient}
          onChange={(value) => setRecipient(value || "")}
          required
          searchable
          disabled={isLoading}
        />

        <TextInput
          label="Subject"
          placeholder="Enter subject"
          value={subject}
          onChange={(event) => setSubject(event.currentTarget.value)}
          required
          disabled={isLoading}
        />

        <Textarea
          label="Message"
          placeholder="Enter your message"
          value={body}
          onChange={(event) => setBody(event.currentTarget.value)}
          required
          minRows={4}
          maxRows={8}
          autosize
          disabled={isLoading}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!recipient || !subject.trim() || !body.trim()}
            loading={isLoading}
          >
            Send
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};