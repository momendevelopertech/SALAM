import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — SALAM | سلام" },
      { name: "description", content: "Pieces you saved at SALAM." },
      { property: "og:title", content: "Wishlist — SALAM" },
      { property: "og:description", content: "Pieces you saved at SALAM." },
    ],
  }),
  component: () => <PageStub titleKey="wishlist.title" />,
});
