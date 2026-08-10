import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/style-finder")({
  head: () => ({
    meta: [
      { title: "Style Finder — SALAM | سلام" },
      { name: "description", content: "Answer three short questions and we suggest your pieces." },
      { property: "og:title", content: "Style Finder — SALAM" },
      { property: "og:description", content: "Answer three short questions and we suggest your pieces." },
    ],
  }),
  component: () => <PageStub titleKey="finder.title" />,
});
