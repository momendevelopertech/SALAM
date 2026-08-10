import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size guide — SALAM | سلام" },
      { name: "description", content: "Find your size across SALAM abayas, esdals and dresses." },
      { property: "og:title", content: "Size guide — SALAM" },
      { property: "og:description", content: "Find your size across SALAM abayas, esdals and dresses." },
    ],
  }),
  component: () => <PageStub titleKey="size.title" />,
});
