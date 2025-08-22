import {
  Alert,
  Button,
  Card,
  List,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconBookmark, IconCheck, IconInfoCircle } from "@tabler/icons-react";

interface InitializationViewProps {
  onInitialize: () => Promise<void>;
}

export function InitializationView({ onInitialize }: InitializationViewProps) {
  return (
    <Stack gap="md">
      <Card withBorder>
        <Stack gap="md">
          <Title order={3} ta="center">
            {chrome.i18n.getMessage("initialization")}
          </Title>

          <Text size="sm" c="dimmed" ta="center">
            {chrome.i18n.getMessage("initializationDescription")}
          </Text>

          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            <Text size="sm">This will:</Text>
            <List
              mt="xs"
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="blue" size={20} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>
                Backup your current bookmarks and folders to "Backup Favorites"
                folder (if any exist)
              </List.Item>
              <List.Item>Set up the extension for use with MyLinks</List.Item>
              <List.Item>
                Configure the bookmark bar for MyLinks integration
              </List.Item>
            </List>
          </Alert>

          <Button
            onClick={onInitialize}
            leftSection={<IconBookmark size={16} />}
            size="md"
            fullWidth
          >
            {chrome.i18n.getMessage("initialize")}
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
