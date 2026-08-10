import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping and returns — SALAM | سلام" },
      { name: "description", content: "Shipping fees, delivery times and exchange policy across Egypt." },
      { property: "og:title", content: "Shipping and returns — SALAM" },
      { property: "og:description", content: "Shipping fees, delivery times and exchange policy across Egypt." },
    ],
  }),
  component: () => <PageStub titleKey="ship.title" />,
});
