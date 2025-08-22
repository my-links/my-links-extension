import { Alert, Container, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

interface ErrorDisplayProps {
  error: string | null;
  title?: string;
  containerProps?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    py?: string | number;
  };
}

export function ErrorDisplay({
  error,
  title,
  containerProps = { size: "sm", py: "md" },
}: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Container {...containerProps}>
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={title || chrome.i18n.getMessage("error")}
        color="red"
      >
        <Text size="sm">{error}</Text>
      </Alert>
    </Container>
  );
}
