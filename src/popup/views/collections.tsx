import { useModals } from "@/hooks/use_modals";
import {
  CreateCollectionRequest,
  MyLinksCollection,
  UpdateCollectionRequest,
} from "@/types";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

interface CollectionsViewProps {
  collections: MyLinksCollection[];
  onCollectionsUpdate: () => Promise<void>;
  onCreateCollection: (props: CreateCollectionRequest) => Promise<void>;
  onUpdateCollection: (props: UpdateCollectionRequest) => Promise<void>;
  onDeleteCollection: (id: string, name: string) => Promise<void>;
}

export function CollectionsView({
  collections,
  onCollectionsUpdate,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
}: CollectionsViewProps) {
  const [loading, setLoading] = useState(false);
  const modals = useModals();

  const handleCreateCollection = async (props: CreateCollectionRequest) => {
    try {
      setLoading(true);
      await onCreateCollection(props);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCollection = async (props: UpdateCollectionRequest) => {
    try {
      setLoading(true);
      await onUpdateCollection(props);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (collection: MyLinksCollection) => {
    modals.openDeleteConfirmationModal(collection, async () => {
      try {
        setLoading(true);
        await onDeleteCollection(collection.id, collection.name);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await onCollectionsUpdate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={500} size="lg">
          {chrome.i18n.getMessage("collections")}
        </Text>
        <Group>
          <ActionIcon variant="light" onClick={handleRefresh} loading={loading}>
            <IconRefresh size={16} />
          </ActionIcon>
          <Button
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={() =>
              modals.openCreateCollectionModal(handleCreateCollection)
            }
          >
            {chrome.i18n.getMessage("createCollection")}
          </Button>
        </Group>
      </Group>

      <ScrollArea h={400}>
        <Stack gap="sm">
          {collections.length === 0 ? (
            <Card withBorder>
              <Text ta="center" c="dimmed" size="sm">
                No collections found. Create your first collection to get
                started.
              </Text>
            </Card>
          ) : (
            collections.map((collection) => (
              <Card key={String(collection.id)} withBorder>
                <Group justify="space-between">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Text fw={500} size="sm">
                        {collection.name}
                      </Text>
                      <Badge size="xs" variant="light">
                        {collection.links.length} links
                      </Badge>
                    </Group>
                    {collection.description && (
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {collection.description}
                      </Text>
                    )}
                  </Stack>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon variant="light" size="sm">
                        <IconDotsVertical size={14} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() =>
                          modals.openEditCollectionModal(
                            collection,
                            handleUpdateCollection
                          )
                        }
                      >
                        {chrome.i18n.getMessage("editCollection")}
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconExternalLink size={14} />}
                        onClick={() => {
                          chrome.tabs.create({
                            url: `https://www.mylinks.app/collections/${String(
                              collection.id
                            )}`,
                          });
                        }}
                      >
                        View on MyLinks
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => handleDeleteCollection(collection)}
                      >
                        {chrome.i18n.getMessage("deleteCollection")}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Card>
            ))
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
