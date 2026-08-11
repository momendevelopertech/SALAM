import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { getCatalog } from "@/lib/catalog.functions";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

type Variant = {
  id: string;
  color_ar: string;
  color_en: string;
  size: string;
  price: number | null;
  image_url: string | null;
  stock_available: number;
};

type Product = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  price: number;
  sale_price: number | null;
  main_image: string | null;
  product_variants: Variant[];
};

export const Route = createFileRoute("/wishlist")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catalogQuery);
  },
  head: () => ({
    meta: [
      { title: "Wishlist — SALAM | سلام" },
      { name: "description", content: "Your saved SALAM pieces." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { t, pick, locale } = useI18n();
  const { wishlist, isWished, toggleWish, add } = useCart();
  const { data } = useSuspenseQuery(catalogQuery);
  const products = (data.products as unknown as Product[]).filter((p) => wishlist.includes(p.slug));

  if (products.length === 0) {
    return (
      <div className="container-salam py-24 text-center">
        <div className="gold-rule mx-auto" />
        <h1 className="mt-6 font-display text-4xl">{t("wishlist.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("wishlist.emptyBody")}</p>
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
      <h1 className="mt-6 font-display text-4xl">{t("wishlist.title")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {products.length} {t("shop.results")}
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <WishCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}

function WishCard({ product }: { product: Product }) {
  const { t, pick, locale } = useI18n();
  const { toggleWish, add } = useCart();
  const [variantId, setVariantId] = useState(() => {
    const inStock = product.product_variants.find((v) => v.stock_available > 0);
    return (inStock ?? product.product_variants[0])?.id ?? "";
  });

  const variant = product.product_variants.find((v) => v.id === variantId);
  const soldOut = product.product_variants.every((v) => v.stock_available <= 0);

  const addToBag = () => {
    if (!variant) return;
    add({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      nameAr: product.name_ar,
      nameEn: product.name_en,
      colorAr: variant.color_ar,
      colorEn: variant.color_en,
      size: variant.size,
      unitPrice: variant.price ?? product.sale_price ?? product.price,
      image: variant.image_url ?? product.main_image,
      maxQuantity: Math.max(1, variant.stock_available),
    });
    toast(t("product.added"));
  };

  return (
    <div className="group">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden rounded-sm bg-surface-muted"
      >
        {product.main_image && (
          <img
            src={product.main_image}
            alt={pick(product.name_ar, product.name_en)}
            loading="lazy"
            className="aspect-[3/4] w-full object-cover transition-opacity group-hover:opacity-90"
            width={900}
            height={1200}
          />
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/55">
            <span className="rounded-sm border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
              {t("badge.soldOut")}
            </span>
          </div>
        )}
      </Link>

      <div className="mt-3">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="text-sm hover:text-primary"
        >
          {pick(product.name_ar, product.name_en)}
        </Link>
        <div className="mt-1 text-sm text-primary">
          {formatPrice(product.sale_price ?? product.price, locale)}
        </div>
      </div>

      {!soldOut && product.product_variants.length > 0 && (
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="mt-3 w-full rounded-sm border border-input bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
        >
          {product.product_variants.map((v) => (
            <option key={v.id} value={v.id}>
              {pick(v.color_ar, v.color_en)} — {v.size}
              {v.stock_available <= 0 ? ` (${t("badge.soldOut")})` : ""}
            </option>
          ))}
        </select>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={addToBag}
          disabled={soldOut || !variant}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-3 py-2 text-xs tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {t("wishlist.addToBag")}
        </button>
        <button
          type="button"
          onClick={() => toggleWish(product.slug)}
          className="flex items-center justify-center rounded-sm border border-border px-3 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label={t("wishlist.remove")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
