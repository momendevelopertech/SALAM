import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Package, Search, X } from "lucide-react";
import { trackOrder } from "@/lib/checkout.functions";
import { useI18n } from "@/lib/i18n";
import { formatPrice, formatDate } from "@/lib/format";

type Search = { orderNumber?: string };

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["orderNumber"] === "string" ? { orderNumber: search["orderNumber"] } : {},
  head: () => ({
    meta: [
      { title: "Track your order — SALAM | سلام" },
      { name: "description", content: "Track a SALAM order using your order number and mobile." },
      { property: "og:title", content: "Track your order — SALAM" },
      {
        property: "og:description",
        content: "Track a SALAM order using your order number and mobile.",
      },
    ],
  }),
  component: Track,
});

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_shipping",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

type Order = {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tracking_number: string | null;
  governorate: string;
  city: string;
  created_at: Date;
  order_items: {
    name_ar: string;
    name_en: string;
    color_ar: string | null;
    color_en: string | null;
    size: string | null;
    quantity: number;
    unit_price: number;
    image_url: string | null;
  }[];
};

function Track() {
  const { t, pick, locale } = useI18n();
  const { orderNumber } = Route.useSearch();
  const [number, setNumber] = useState(orderNumber ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const inputCls =
    "h-11 w-full rounded-sm border border-input bg-surface px-3 text-sm outline-none transition-colors focus:border-primary";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    try {
      const res = await trackOrder({ data: { orderNumber: number, phone } });
      setOrder((res.order as Order) ?? null);
      setNotFound(!res.order);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = STATUSES.indexOf(order?.status as (typeof STATUSES)[number]);
  const cancelled = order?.status === "cancelled";

  return (
    <div className="container-salam py-12 md:py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 flex items-center gap-3 font-display text-4xl">
        <Package className="h-8 w-8 text-primary" />
        {t("order.trackTitle")}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t("order.trackBody")}</p>

      <form onSubmit={submit} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          required
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder={t("order.orderNumber")}
          className={inputCls}
        />
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("order.phone")}
          className={inputCls}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {loading ? t("common.loading") : t("order.trackCta")}
        </button>
      </form>

      {notFound && (
        <div className="mt-8 max-w-xl rounded-sm border border-border bg-surface p-6 text-sm text-muted-foreground">
          {t("order.notFound")}
        </div>
      )}

      {order && (
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl">{t("order.details")}</h2>
            <div className="mt-5 space-y-2.5 rounded-sm border border-border bg-surface p-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("order.number")}</span>
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("order.status")}</span>
                <span>{t(`status.${order.status}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("order.paymentStatus")}</span>
                <span>{t(`pay.${order.payment_status}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("order.paymentMethod")}</span>
                <span>{t(`order.pay${cap(order.payment_method)}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("order.confirmedAt")}</span>
                <span>{formatDate(order.created_at, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("order.address")}</span>
                <span className="text-start">
                  {order.city} — {order.governorate}
                </span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("order.shipping")}</span>
                  <span>{order.tracking_number}</span>
                </div>
              )}
            </div>

            <h3 className="mt-8 font-display text-xl">{t("order.items")}</h3>
            <div className="mt-4 space-y-4">
              {order.order_items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={pick(item.name_ar, item.name_en)}
                      className="h-20 w-16 rounded-sm object-cover"
                      width={64}
                      height={80}
                    />
                  )}
                  <div className="flex-1">
                    <div className="leading-snug">{pick(item.name_ar, item.name_en)}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {pick(item.color_ar, item.color_en)}
                      {item.size ? ` — ${item.size}` : ""} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-sm text-primary">
                    {formatPrice(item.unit_price * item.quantity, locale)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl">{t("order.timeline")}</h2>
            {cancelled ? (
              <div className="mt-5 flex items-center gap-3 rounded-sm border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
                <X className="h-5 w-5" />
                {t("status.cancelled")}
              </div>
            ) : (
              <ol className="mt-6 space-y-0">
                {STATUSES.map((s, i) => {
                  const done = currentIndex >= i;
                  return (
                    <li key={s} className="relative flex gap-4 pb-8 last:pb-0">
                      {i < STATUSES.length - 1 && (
                        <span
                          className={`absolute start-[11px] top-6 h-full w-px ${
                            currentIndex > i ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-surface text-muted-foreground"
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span
                        className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {t(`status.${s}`)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      )}

      {order && (
        <div className="mt-12 border-t border-border pt-6">
          <Link to="/shop" className="text-sm text-primary hover:underline">
            {t("order.trackAnother")}
          </Link>
        </div>
      )}
    </div>
  );
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
