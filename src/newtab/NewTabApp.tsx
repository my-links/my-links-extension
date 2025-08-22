import { Alert, Button, Container, Text } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function NewTabApp() {
  const [mylinksUrl, setMylinksUrl] = useState<string>(
    "https://www.mylinks.app"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_SETTINGS",
      });
      if (response.success && response.settings.mylinksUrl) {
        setMylinksUrl(response.settings.mylinksUrl);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomParam = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const getMyLinksUrl = () => {
    const randomParam = generateRandomParam();
    return `${mylinksUrl}/dashboard?cache=${randomParam}`;
  };

  const handleRefresh = () => {
    const iframe = document.getElementById(
      "mylinks-frame"
    ) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = getMyLinksUrl();
    }
  };

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Text ta="center" size="lg">
          Loading MyLinks...
        </Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          <Text size="sm">{error}</Text>
          <Button
            mt="md"
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefresh}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <iframe
        id="mylinks-frame"
        src={getMyLinksUrl()}
        title="MyLinks Dashboard"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        onLoad={() => setLoading(false)}
        onError={() => setError("Failed to load MyLinks dashboard")}
      />
    </div>
  );
}
