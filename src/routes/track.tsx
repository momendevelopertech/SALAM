import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track your order — SALAM | سلام" },
      { name: "description", content: "Track a SALAM order using your order number and mobile." },
      { property: "og:title", content: "Track your order — SALAM" },
      { property: "og:description", content: "Track a SALAM order using your order number and mobile." },
    ],
  }),
  component: () => <PageStub titleKey="order.trackTitle" />,
});
