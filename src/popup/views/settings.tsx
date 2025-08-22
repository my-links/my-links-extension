import {
  Alert,
  Button,
  Card,
  Group,
  List,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconExternalLink,
  IconKey,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { useState } from "react";
import type { ExtensionSettings } from "../../types";

// Utility function for notifications
const showNotification = (title: string, message: string) => {
  console.log(`${title}: ${message}`);
  if (chrome.notifications) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "public/logo.png",
      title,
      message,
    });
  }
};

interface SettingsViewProps {
  settings: ExtensionSettings;
  onSettingsUpdate: (settings: Partial<ExtensionSettings>) => Promise<void>;
}

export function SettingsView({
  settings,
  onSettingsUpdate,
}: SettingsViewProps) {
  const [mylinksUrl, setMylinksUrl] = useState(settings.mylinksUrl);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSettingsUpdate({
        mylinksUrl,
        apiKey,
      });
    } catch (error) {
      showNotification(
        chrome.i18n.getMessage("error"),
        error instanceof Error ? error.message : "Failed to save settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const openApiKeyPage = () => {
    chrome.tabs.create({
      url: `${mylinksUrl}/user/settings`,
    });
  };

  const openMyLinks = () => {
    chrome.tabs.create({
      url: mylinksUrl,
    });
  };

  const handleReset = () => {
    modals.openConfirmModal({
      title: "Reset Extension",
      children: (
        <Stack gap="md">
          <Text size="sm">
            This will completely reset the extension to its initial state:
          </Text>
          <List size="sm" c="dimmed">
            <List.Item>Clear all settings and API key</List.Item>
            <List.Item>Remove all cached collections</List.Item>
            <List.Item>Mark extension as uninitialized</List.Item>
            <List.Item>You will need to go through setup again</List.Item>
          </List>
          <Text size="sm" fw={500} c="red">
            This action cannot be undone!
          </Text>
        </Stack>
      ),
      labels: { confirm: "Reset Extension", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          setLoading(true);

          // Send reset message to background script
          const response = await chrome.runtime.sendMessage({
            type: "RESET_EXTENSION",
          });

          if (response.success) {
            showNotification(
              "Extension Reset",
              "Extension has been reset successfully. Please reload the popup."
            );

            // Reset local state
            setMylinksUrl("https://www.mylinks.app");
            setApiKey("");

            // Close popup after a short delay
            setTimeout(() => {
              window.close();
            }, 2000);
          }
        } catch (error) {
          showNotification(
            "Reset Failed",
            error instanceof Error ? error.message : "Failed to reset extension"
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Stack gap="md">
      <Card withBorder>
        <Stack gap="md">
          <Title order={4}>{chrome.i18n.getMessage("settings")}</Title>

          <Alert color="blue">
            <Text size="sm">
              Configure your MyLinks instance and API key to start using the
              extension.
            </Text>
          </Alert>

          <TextInput
            label={chrome.i18n.getMessage("mylinksUrl")}
            placeholder="https://www.mylinks.app"
            value={mylinksUrl}
            onChange={(e) => setMylinksUrl(e.target.value)}
            leftSection={<IconWorld size={16} />}
            rightSection={
              <Button
                variant="subtle"
                size="xs"
                onClick={openMyLinks}
                leftSection={<IconExternalLink size={14} />}
              >
                Open
              </Button>
            }
          />

          <TextInput
            label={chrome.i18n.getMessage("apiKey")}
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            leftSection={<IconKey size={16} />}
            rightSection={
              <Button
                variant="subtle"
                size="xs"
                onClick={openApiKeyPage}
                leftSection={<IconExternalLink size={14} />}
              >
                {chrome.i18n.getMessage("getApiKey")}
              </Button>
            }
          />

          <Group justify="space-between">
            <Button
              variant="outline"
              color="red"
              onClick={handleReset}
              disabled={loading}
              leftSection={<IconTrash size={16} />}
            >
              Reset Extension
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={!mylinksUrl}
            >
              {chrome.i18n.getMessage("save")}
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
