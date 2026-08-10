import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping bag — SALAM | سلام" },
      { name: "description", content: "Review the pieces in your SALAM shopping bag." },
      { property: "og:title", content: "Shopping bag — SALAM" },
      { property: "og:description", content: "Review the pieces in your SALAM shopping bag." },
    ],
  }),
  component: () => <PageStub titleKey="cart.title" />,
});
