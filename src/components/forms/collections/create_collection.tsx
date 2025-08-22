import { CreateCollectionRequest, Visibility } from "@/types";
import {
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useState } from "react";

interface CreateCollectionProps {
  onCreate: (props: CreateCollectionRequest) => void;
}

export function CreateCollectionForm({ onCreate }: CreateCollectionProps) {
  const [formState, setFormState] = useState<{
    name: string;
    description: string;
    visibility: Visibility;
  }>({
    name: "",
    description: "",
    visibility: Visibility.PRIVATE,
  });

  return (
    <Stack gap="md">
      <TextInput
        label={chrome.i18n.getMessage("collectionName")}
        placeholder={chrome.i18n.getMessage("collectionNamePlaceholder")}
        value={formState.name}
        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
        required
      />
      <Textarea
        label={chrome.i18n.getMessage("collectionDescription")}
        placeholder={chrome.i18n.getMessage("collectionDescriptionPlaceholder")}
        value={formState.description}
        onChange={(e) =>
          setFormState({ ...formState, description: e.target.value })
        }
        rows={3}
      />
      <Stack gap="xs">
        <Text>{chrome.i18n.getMessage("collectionVisibility")}</Text>
        <SegmentedControl
          value={formState.visibility}
          onChange={(value) =>
            setFormState({
              ...formState,
              visibility: value as Visibility,
            })
          }
          data={[
            {
              label: chrome.i18n.getMessage("private"),
              value: Visibility.PRIVATE,
            },
            {
              label: chrome.i18n.getMessage("public"),
              value: Visibility.PUBLIC,
            },
          ]}
        />
      </Stack>
      <Group justify="flex-end">
        <Button variant="light" onClick={() => modals.closeAll()}>
          {chrome.i18n.getMessage("cancel")}
        </Button>
        <Button
          onClick={() => {
            if (formState.name.trim()) {
              onCreate({
                name: formState.name.trim(),
                description: formState.description.trim(),
                visibility: formState.visibility,
              });
              modals.closeAll();
            }
          }}
          disabled={!formState.name.trim()}
        >
          {chrome.i18n.getMessage("createCollection")}
        </Button>
      </Group>
    </Stack>
  );
}
