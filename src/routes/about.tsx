import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SALAM — SALAM | سلام" },
      { name: "description", content: "The story behind SALAM premium modest fashion." },
      { property: "og:title", content: "About SALAM — SALAM" },
      { property: "og:description", content: "The story behind SALAM premium modest fashion." },
    ],
  }),
  component: () => <PageStub titleKey="about.title" />,
});
