import { Container, LoadingOverlay } from "@mantine/core";

interface LoadingSpinnerProps {
  visible: boolean;
  size?: "sm" | "md" | "lg";
  containerProps?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    py?: string | number;
  };
}

export function LoadingSpinner({
  visible,
  size = "md",
  containerProps = { size: "sm", py: "md" },
}: LoadingSpinnerProps) {
  return (
    <Container {...containerProps}>
      <LoadingOverlay visible={visible} size={size} />
    </Container>
  );
}
