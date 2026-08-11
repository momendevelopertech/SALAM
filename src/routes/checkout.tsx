import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getCatalog } from "@/lib/catalog.functions";
import { placeOrder } from "@/lib/checkout.functions";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

type Governorate = {
  governorate_ar: string;
  governorate_en: string;
  fee: number;
  days_min: number;
  days_max: number;
};

type PaymentMethod = "cod" | "instapay" | "vodafone_cash";

type Confirmation = {
  orderNumber: string;
  total: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  paymentMethod: PaymentMethod;
  paymentReference: string | undefined;
};

export const Route = createFileRoute("/checkout")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catalogQuery);
  },
  head: () => ({
    meta: [
      { title: "Checkout — SALAM | سلام" },
      { name: "description", content: "Complete your SALAM order." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { t, pick, locale } = useI18n();
  const { lines, subtotal, clear } = useCart();
  const { data } = useSuspenseQuery(catalogQuery);
  const governorates = (data.shippingRates as Governorate[]).filter((g) => g.fee !== null);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [paymentReference, setPaymentReference] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const selectedRate = governorates.find((g) => g.governorate_en === governorate);
  const shippingFee = selectedRate?.fee ?? 0;

  if (lines.length === 0 && !confirmation) {
    return (
      <div className="container-salam py-24 text-center">
        <div className="gold-rule mx-auto" />
        <h1 className="mt-6 font-display text-4xl">{t("cart.emptyBag")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("checkout.empty")}</p>
        <Link
          to="/shop"
          className="mt-7 inline-flex rounded-sm bg-primary px-7 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("checkout.toShop")}
        </Link>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="container-salam py-24">
        <div className="mx-auto max-w-xl text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-6 font-display text-4xl">{t("order.confirmedTitle")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("order.thanks")}</p>

          <div className="mt-8 rounded-sm border border-border bg-surface p-6 text-right">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("order.number")}</span>
              <span className="font-medium">{confirmation.orderNumber}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">{t("order.total")}</span>
              <span className="font-medium text-primary">
                {formatPrice(confirmation.total, locale)}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">{t("order.paymentMethod")}</span>
              <span>{t(`order.pay${cap(confirmation.paymentMethod)}`)}</span>
            </div>
            {confirmation.paymentMethod !== "cod" && (
              <div className="mt-4 rounded-sm bg-primary-soft p-4 text-sm">
                <p className="font-medium">{t("checkout.manualNote")}</p>
                <p className="mt-2 text-muted-foreground">
                  {t("checkout.fee")}: {formatPrice(confirmation.total, locale)}
                </p>
                {confirmation.paymentReference && (
                  <p className="mt-1 text-muted-foreground">
                    {t("checkout.reference")}: {confirmation.paymentReference}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/track"
              search={{ orderNumber: confirmation.orderNumber }}
              className="inline-flex rounded-sm bg-primary px-6 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("order.trackTitle")}
            </Link>
            <Link
              to="/shop"
              className="inline-flex rounded-sm border border-border px-6 py-3 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {t("checkout.keepShopping")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await placeOrder({
        data: {
          customerName,
          phone,
          email: email || undefined,
          governorate,
          city,
          address,
          notes: notes || undefined,
          paymentMethod,
          paymentReference: paymentMethod === "cod" ? undefined : paymentReference || undefined,
          couponCode: couponCode || undefined,
          items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        },
      });
      clear();
      setConfirmation({
        orderNumber: res.orderNumber,
        total: res.total,
        subtotal: res.subtotal,
        discount: res.discount,
        shippingFee: res.shippingFee,
        paymentMethod,
        paymentReference: paymentReference || undefined,
      });
    } catch (e) {
      setError(t("checkout.placeError"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "h-11 w-full rounded-sm border border-input bg-surface px-3 text-sm outline-none transition-colors focus:border-primary";
  const labelCls = "mb-1.5 block text-sm font-medium";

  return (
    <div className="container-salam py-12 md:py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t("checkout.title")}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-8"
        >
          <section>
            <h2 className="font-display text-xl">{t("checkout.customerInfo")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t("checkout.name")}</label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t("checkout.phone")}</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t("checkout.email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl">{t("checkout.address")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t("checkout.governorate")}</label>
                <select
                  required
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className={inputCls}
                >
                  <option value="">{t("checkout.selectGovernorate")}</option>
                  {governorates.map((g) => (
                    <option key={g.governorate_en} value={g.governorate_en}>
                      {pick(g.governorate_ar, g.governorate_en)} — {formatPrice(g.fee, locale)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t("checkout.city")}</label>
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t("checkout.street")}</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t("checkout.notes")}</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            {selectedRate && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("checkout.deliveryDays")}: {selectedRate.days_min}–{selectedRate.days_max}{" "}
                {t("checkout.days")}
              </p>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl">{t("checkout.payment")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["cod", t("checkout.cod"), t("checkout.codNote")],
                  ["instapay", t("checkout.instapay"), ""],
                  ["vodafone_cash", t("checkout.vodafone"), ""],
                ] as const
              ).map(([value, label, note]) => (
                <label
                  key={value}
                  className={`cursor-pointer rounded-sm border p-4 transition-colors ${
                    paymentMethod === value
                      ? "border-primary bg-primary-soft"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{label}</span>
                  {note && <span className="mt-1 block text-xs text-muted-foreground">{note}</span>}
                </label>
              ))}
            </div>

            {paymentMethod !== "cod" && (
              <div className="mt-4 rounded-sm bg-primary-soft p-4">
                <p className="text-sm">{t("checkout.transferInstructions")}</p>
                <div className="mt-3 max-w-sm">
                  <label className={labelCls}>{t("checkout.reference")}</label>
                  <input
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className={inputCls}
                    placeholder="TRX-..."
                  />
                </div>
              </div>
            )}
          </section>

          {error && (
            <div className="rounded-sm border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-primary px-6 py-3.5 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 sm:w-auto sm:min-w-64"
          >
            {submitting ? t("common.loading") : t("checkout.placeOrder")}
          </button>
        </form>

        <aside className="h-fit rounded-sm border border-border bg-surface p-6">
          <h2 className="font-display text-xl">{t("checkout.summary")}</h2>
          <div className="mt-4 space-y-4">
            {lines.map((line) => (
              <div key={line.variantId} className="flex items-center gap-4 text-sm">
                {line.image && (
                  <img
                    src={line.image}
                    alt={pick(line.nameAr, line.nameEn)}
                    className="h-16 w-14 rounded-sm object-cover"
                    width={56}
                    height={64}
                  />
                )}
                <div className="flex-1">
                  <div className="leading-snug">{pick(line.nameAr, line.nameEn)}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {pick(line.colorAr, line.colorEn)}
                    {line.size ? ` — ${line.size}` : ""} × {line.quantity}
                  </div>
                </div>
                <div className="text-sm text-primary">
                  {formatPrice(line.unitPrice * line.quantity, locale)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.subtotal")}</span>
              <span>{formatPrice(subtotal, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.shipping")}</span>
              <span>{selectedRate ? formatPrice(shippingFee, locale) : "—"}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("checkout.coupon")}</span>
                <span>{couponCode}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
              <span>{t("cart.total")}</span>
              <span className="text-primary">{formatPrice(subtotal + shippingFee, locale)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {t("checkout.contactNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
