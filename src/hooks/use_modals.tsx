import { CreateCollectionForm } from "@/components/forms/collections/create_collection";
import { EditCollectionForm } from "@/components/forms/collections/edit_collection";
import {
  CreateCollectionRequest,
  MyLinksCollection,
  UpdateCollectionRequest,
} from "@/types";
import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";

export function useModals() {
  const openCreateCollectionModal = (
    onCreate: (props: CreateCollectionRequest) => void
  ) => {
    modals.open({
      title: chrome.i18n.getMessage("createCollection"),
      children: <CreateCollectionForm onCreate={onCreate} />,
    });
  };

  const openEditCollectionModal = (
    collection: MyLinksCollection,
    onUpdate: (props: UpdateCollectionRequest) => void
  ) => {
    modals.open({
      title: chrome.i18n.getMessage("editCollection"),
      children: (
        <EditCollectionForm collection={collection} onUpdate={onUpdate} />
      ),
    });
  };

  const openDeleteConfirmationModal = (
    collection: MyLinksCollection,
    onConfirm: () => void
  ) => {
    modals.openConfirmModal({
      title: chrome.i18n.getMessage("deleteCollection"),
      children: (
        <Text size="sm">
          {chrome.i18n.getMessage("deleteConfirmation")} "{collection.name}"?
        </Text>
      ),
      labels: {
        confirm: chrome.i18n.getMessage("confirm"),
        cancel: chrome.i18n.getMessage("cancel"),
      },
      confirmProps: { color: "red" },
      onConfirm,
    });
  };

  return {
    openCreateCollectionModal,
    openEditCollectionModal,
    openDeleteConfirmationModal,
  };
}
