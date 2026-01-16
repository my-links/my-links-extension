import { Container } from "@mantine/core";
import { ErrorDisplay, LoadingSpinner } from "../../components";
import { useOptionsState } from "../../hooks";
import { AddLinkView } from "../../popup/views/add_link";
import { InitializationView } from "../../popup/views/initialization";
import { SettingsView } from "../../popup/views/settings";

export function OptionsApp() {
  const {
    settings,
    collections,
    pendingLink,
    loading,
    error,
    handleInitialize,
    handleSettingsUpdate,
    handleAddLink,
    setPendingLink,
  } = useOptionsState();

  if (loading) {
    return <LoadingSpinner visible={loading} />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!settings?.isInitialized) {
    return (
      <Container size="md" py="xl">
        <InitializationView onInitialize={handleInitialize} />
      </Container>
    );
  }

  if (pendingLink) {
    return (
      <Container size="md" py="xl">
        <AddLinkView
          link={pendingLink}
          collections={collections}
          onAddLink={handleAddLink}
          onCancel={() => setPendingLink(null)}
        />
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <SettingsView
        settings={settings}
        onSettingsUpdate={handleSettingsUpdate}
      />
    </Container>
  );
}
