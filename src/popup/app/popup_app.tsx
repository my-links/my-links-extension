import { Container, Tabs } from "@mantine/core";
import { IconBookmark, IconSettings } from "@tabler/icons-react";
import { useEffect } from "react";
import { ErrorDisplay, LoadingSpinner } from "../../components";
import { usePopupState } from "../../hooks";
import { AddLinkView } from "../views/add_link";
import { CollectionsView } from "../views/collections";
import { InitializationView } from "../views/initialization";
import { SettingsView } from "../views/settings";

export function PopupApp() {
  const {
    settings,
    collections,
    loading,
    error,
    pendingLink,
    initializePopup,
    handleInitialize,
    handleSettingsUpdate,
    handleCollectionsUpdate,
    handleAddLink,
    handleCreateCollection,
    handleUpdateCollection,
    handleDeleteCollection,
    setPendingLink,
  } = usePopupState();

  useEffect(() => {
    initializePopup();
  }, []);

  if (loading) {
    return <LoadingSpinner visible={loading} />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Show initialization view if not initialized
  if (!settings?.isInitialized) {
    return (
      <Container size="sm" py="md">
        <InitializationView onInitialize={handleInitialize} />
      </Container>
    );
  }

  // Show add link view if there's a pending link
  if (pendingLink) {
    return (
      <Container size="sm" py="md">
        <AddLinkView
          link={pendingLink}
          collections={collections}
          onAddLink={handleAddLink}
          onCancel={() => setPendingLink(null)}
        />
      </Container>
    );
  }

  // Main popup view
  return (
    <Container size="sm" py="md">
      <Tabs defaultValue="collections" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab
            value="collections"
            leftSection={<IconBookmark size={16} />}
          >
            {chrome.i18n.getMessage("collections")}
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
            {chrome.i18n.getMessage("settings")}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="collections" pt="xs">
          <CollectionsView
            collections={collections}
            onCollectionsUpdate={handleCollectionsUpdate}
            onCreateCollection={handleCreateCollection}
            onUpdateCollection={handleUpdateCollection}
            onDeleteCollection={handleDeleteCollection}
          />
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="xs">
          <SettingsView
            settings={settings}
            onSettingsUpdate={handleSettingsUpdate}
          />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
