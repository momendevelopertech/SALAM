import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatPrice, discountPercent } from "@/lib/format";

export type ProductCardData = {
  slug: string;
  name_ar: string;
  name_en: string;
  price: number;
  sale_price: number | null;
  main_image: string | null;
  is_new?: boolean;
  is_best_seller?: boolean;
  is_limited?: boolean;
  product_variants?: {
    color_ar: string;
    color_en: string;
    color_hex: string;
    stock_available: number;
  }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { t, pick, locale } = useI18n();
  const { isWished, toggleWish } = useCart();
  const wished = isWished(product.slug);
  const soldOut = product.product_variants?.every((v) => v.stock_available === 0) ?? false;
  const discount = discountPercent(product.price, product.sale_price);
  const colors = product.product_variants ?? [];

  return (
    <div className="group relative">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        preload="intent"
        preloadDelay={50}
        className="block"
      >
        <div className="relative overflow-hidden rounded-sm bg-surface-muted">
          {product.main_image && (
            <img
              src={product.main_image}
              alt={pick(product.name_ar, product.name_en)}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover transition-opacity duration-500 group-hover:opacity-90"
              width={900}
              height={1200}
            />
          )}
          {(discount > 0 || product.is_new || product.is_limited) && (
            <div className="absolute right-3 top-3 flex flex-col gap-1.5">
              {discount > 0 && (
                <span className="rounded-sm bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                  {discount}% {t("badge.sale")}
                </span>
              )}
              {product.is_new && (
                <span className="rounded-sm bg-surface px-2 py-0.5 text-[11px] font-medium text-foreground">
                  {t("badge.new")}
                </span>
              )}
              {product.is_limited && (
                <span className="rounded-sm bg-foreground px-2 py-0.5 text-[11px] font-medium text-background">
                  {t("badge.limited")}
                </span>
              )}
            </div>
          )}
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/55">
              <span className="rounded-sm border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
                {t("badge.soldOut")}
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 text-sm">{pick(product.name_ar, product.name_en)}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm text-primary">
            {formatPrice(product.sale_price ?? product.price, locale)}
          </span>
          {product.sale_price && product.sale_price < product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.price, locale)}
            </span>
          )}
        </div>
      </Link>

      {colors.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          {colors.slice(0, 5).map((c, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: c.color_hex }}
              title={pick(c.color_ar, c.color_en)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => toggleWish(product.slug)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
          wished
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-surface/80 text-foreground/60 hover:text-primary"
        }`}
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
