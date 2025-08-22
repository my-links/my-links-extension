import { Container, LoadingOverlay } from "@mantine/core";

interface LoadingSpinnerProps {
  visible: boolean;
  containerProps?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    py?: string | number;
  };
}

export function LoadingSpinner({
  visible,
  containerProps = { size: "sm", py: "md" },
}: LoadingSpinnerProps) {
  return (
    <Container {...containerProps}>
      <LoadingOverlay visible={visible} />
    </Container>
  );
}
