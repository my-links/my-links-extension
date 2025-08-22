import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { createRoot } from "react-dom/client";
import { NewTabApp } from "./NewTabApp";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);

  root.render(
    <MantineProvider>
      <NewTabApp />
    </MantineProvider>
  );
}
