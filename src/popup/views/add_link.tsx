import {
  Alert,
  Button,
  Card,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconArrowLeft, IconLink } from "@tabler/icons-react";
import { useState } from "react";
import type { AddLinkRequest, MyLinksCollection } from "../../types";

interface AddLinkViewProps {
  link: { url: string; name: string };
  collections: MyLinksCollection[];
  onAddLink: (collectionId: string, link: AddLinkRequest) => Promise<void>;
  onCancel: () => void;
}

export function AddLinkView({
  link,
  collections,
  onAddLink,
  onCancel,
}: AddLinkViewProps) {
  const [formState, setFormState] = useState<AddLinkRequest>({
    url: link.url,
    name: link.name,
    description: "",
    collectionId: "",
    favorite: false,
  });

  const [loading, setLoading] = useState(false);

  const handleAddLink = async () => {
    if (!formState.collectionId) return;

    try {
      setLoading(true);
      await onAddLink(formState.collectionId, {
        name: formState.name.trim(),
        url: formState.url,
        description: formState.description?.trim(),
        favorite: formState.favorite,
        collectionId: formState.collectionId,
      });
    } catch (error) {
      console.error("Failed to add link:", error);
    } finally {
      setLoading(false);
    }
  };

  const collectionOptions = collections.map((collection) => ({
    value: String(collection.id),
    label: collection.name,
  }));

  return (
    <Stack gap="md">
      <Card withBorder>
        <Stack gap="md">
          <Group>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconArrowLeft size={14} />}
              onClick={onCancel}
            >
              Back
            </Button>
          </Group>

          <Title order={4}>{chrome.i18n.getMessage("addToCollection")}</Title>

          <Alert color="blue">
            <Text size="sm">Add this page to one of your collections:</Text>
          </Alert>

          <TextInput
            label="URL"
            value={link.url}
            readOnly
            leftSection={<IconLink size={16} />}
          />

          <TextInput
            label="Name"
            placeholder="Enter link name"
            value={formState.name}
            onChange={(e) =>
              setFormState({ ...formState, name: e.target.value })
            }
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter link description (optional)"
            value={formState.description}
            onChange={(e) =>
              setFormState({ ...formState, description: e.target.value })
            }
            rows={3}
          />

          <Checkbox
            label="Favorite"
            checked={formState.favorite}
            onChange={(e) =>
              setFormState({ ...formState, favorite: e.target.checked })
            }
          />

          <Select
            label="Collection"
            placeholder="Select a collection"
            data={collectionOptions}
            value={formState.collectionId}
            onChange={(value) =>
              setFormState({ ...formState, collectionId: value || "" })
            }
            required
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={onCancel}>
              {chrome.i18n.getMessage("cancel")}
            </Button>
            <Button
              onClick={handleAddLink}
              loading={loading}
              disabled={!formState.collectionId || !formState.name.trim()}
            >
              {chrome.i18n.getMessage("addToCollection")}
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
