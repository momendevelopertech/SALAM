import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { validateCoupon } from "@/lib/catalog.functions";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping bag — SALAM | سلام" },
      { name: "description", content: "Review the pieces in your SALAM shopping bag." },
      { property: "og:title", content: "Shopping bag — SALAM" },
      { property: "og:description", content: "Review the pieces in your SALAM shopping bag." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { t, pick, locale } = useI18n();
  const { lines, subtotal, setQuantity, remove, clear, toggleWish } = useCart();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState(false);
  const [checking, setChecking] = useState(false);

  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    if (!code.trim()) return;
    setChecking(true);
    setCouponError(false);
    const res = await validateCoupon({ data: { code, subtotal } });
    if (res.valid) {
      setCoupon({ code: res.code, discount: res.discount });
    } else {
      setCoupon(null);
      setCouponError(true);
    }
    setChecking(false);
  };

  if (lines.length === 0) {
    return (
      <div className="container-salam py-24 text-center">
        <div className="gold-rule mx-auto" />
        <h1 className="mt-6 font-display text-4xl">{t("cart.emptyBag")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("cart.emptyBody")}</p>
        <Link
          to="/shop"
          className="mt-7 inline-flex rounded-sm bg-primary px-7 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("cart.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-salam py-12 md:py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t("cart.title")}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {lines.map((line) => (
            <div key={line.variantId} className="flex gap-5 border-b border-border py-6 first:pt-0">
              <Link
                to="/product/$slug"
                params={{ slug: line.slug }}
                className="shrink-0 overflow-hidden rounded-sm bg-surface-muted"
              >
                {line.image && (
                  <img
                    src={line.image}
                    alt={pick(line.nameAr, line.nameEn)}
                    className="h-36 w-28 object-cover"
                    width={112}
                    height={144}
                  />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <Link
                  to="/product/$slug"
                  params={{ slug: line.slug }}
                  className="text-sm font-medium hover:text-primary"
                >
                  {pick(line.nameAr, line.nameEn)}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">
                  {pick(line.colorAr, line.colorEn)}
                  {line.size ? ` — ${line.size}` : ""}
                </div>
                <div className="mt-1 text-sm text-primary">
                  {formatPrice(line.unitPrice, locale)}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex items-center rounded-sm border border-border">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-primary"
                      aria-label="decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-primary"
                      aria-label="increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(line.unitPrice * line.quantity, locale)}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      toggleWish(line.slug);
                      remove(line.variantId);
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {t("cart.moveToWishlist")}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(line.variantId)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-6 flex justify-between text-xs text-muted-foreground">
            <button type="button" onClick={clear} className="hover:text-destructive">
              {t("common.delete")} ({t("cart.title")})
            </button>
            <Link to="/shop" className="hover:text-primary">
              {t("cart.continue")}
            </Link>
          </div>
        </div>

        <aside className="h-fit rounded-sm border border-border bg-surface p-6">
          <h2 className="font-display text-xl">{t("checkout.summary")}</h2>

          <div className="mt-4 flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCouponError(false);
              }}
              placeholder={t("cart.coupon")}
              className="h-10 flex-1 rounded-sm border border-input bg-surface px-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={checking}
              className="rounded-sm border border-primary px-4 text-sm text-primary transition-colors hover:bg-primary-soft disabled:opacity-50"
            >
              {t("cart.apply")}
            </button>
          </div>
          {coupon && (
            <p className="mt-2 text-xs text-success">
              {t("cart.couponApplied")} — {coupon.code}
            </p>
          )}
          {couponError && (
            <p className="mt-2 text-xs text-destructive">{t("cart.couponInvalid")}</p>
          )}

          <div className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.subtotal")}</span>
              <span>{formatPrice(subtotal, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.discount")}</span>
              <span className={discount > 0 ? "text-success" : ""}>
                {discount > 0 ? `- ${formatPrice(discount, locale)}` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.shipping")}</span>
              <span className="text-xs text-muted-foreground">
                {t("cart.calculatedAtCheckout")}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
              <span>{t("cart.total")}</span>
              <span className="text-primary">{formatPrice(total, locale)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block rounded-sm bg-primary px-6 py-3 text-center text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("cart.checkout")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
