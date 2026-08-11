import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Truck, RotateCcw, HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { whatsappLink } from "@/lib/format";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping and returns — SALAM | سلام" },
      {
        name: "description",
        content: "Shipping fees, delivery times and exchange policy across Egypt.",
      },
      { property: "og:title", content: "Shipping and returns — SALAM" },
      {
        property: "og:description",
        content: "Shipping fees, delivery times and exchange policy across Egypt.",
      },
    ],
  }),
  component: Shipping,
});

function Shipping() {
  const { t } = useI18n();

  return (
    <div className="container-salam py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t("ship.title")}</h1>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-border bg-surface p-6">
          <Truck className="h-6 w-6 text-primary" />
          <h2 className="mt-4 font-display text-xl">{t("ship.deliveryTitle")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("ship.deliveryBody")}
          </p>
        </div>
        <div className="rounded-sm border border-border bg-surface p-6">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="mt-4 font-display text-xl">{t("ship.feeTitle")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("ship.feeBody")}</p>
        </div>
        <div className="rounded-sm border border-border bg-surface p-6">
          <RotateCcw className="h-6 w-6 text-primary" />
          <h2 className="mt-4 font-display text-xl">{t("ship.exchangeTitle")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("ship.exchangeBody")}
          </p>
        </div>
        <div className="rounded-sm border border-border bg-surface p-6">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h2 className="mt-4 font-display text-xl">{t("ship.shippingCostTitle")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("ship.shippingCostBody")}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-sm bg-primary-soft p-6">
        <h2 className="font-display text-xl">{t("ship.contactTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("ship.contactBody")}
        </p>
        <a
          href={whatsappLink(t("ship.contactTitle"))}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-2.5 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <MessageCircle className="h-4 w-4" />
          {t("contact.whatsapp")}
        </a>
      </div>

      <div className="mt-8">
        <Link to="/shop" className="text-sm text-primary hover:underline">
          {t("cart.continue")}
        </Link>
      </div>
    </div>
  );
}
