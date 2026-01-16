import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { createRoot } from "react-dom/client";
import { OptionsApp } from "./app/options_app";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);

  root.render(
    <MantineProvider>
      <ModalsProvider>
        <OptionsApp />
      </ModalsProvider>
    </MantineProvider>
  );
}
