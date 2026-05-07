import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/painel")({
  component: () => {
    if (typeof window !== "undefined") {
      window.location.replace("/painel/index.html");
    }
    return null;
  },
});
