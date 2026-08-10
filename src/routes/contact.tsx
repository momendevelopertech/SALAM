import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SALAM — SALAM | سلام" },
      { name: "description", content: "Reach the SALAM team on WhatsApp or email." },
      { property: "og:title", content: "Contact SALAM — SALAM" },
      { property: "og:description", content: "Reach the SALAM team on WhatsApp or email." },
    ],
  }),
  component: () => <PageStub titleKey="contact.title" />,
});
