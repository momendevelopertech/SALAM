import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Minus,
  MoveVertical,
  Plus,
  Ruler,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  WashingMachine,
} from "lucide-react";
import { getCatalog, getProduct } from "@/lib/catalog.functions";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { formatPrice, discountPercent, whatsappLink } from "@/lib/format";
import { ProductCard, type ProductCardData } from "@/components/product-card";

type Variant = {
  id: string;
  color_ar: string;
  color_en: string;
  color_hex: string;
  size: string;
  sku: string | null;
  price: number | null;
  image_url: string | null;
  stock_available: number;
};

type ProductDetail = {
  id: string;
  slug: string;
  sku: string | null;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  sale_price: number | null;
  main_image: string | null;
  gallery: unknown;
  video_url: string | null;
  fabric_ar: string | null;
  fabric_en: string | null;
  fit_ar: string | null;
  fit_en: string | null;
  length_ar: string | null;
  length_en: string | null;
  care_ar: string | null;
  care_en: string | null;
  is_new: boolean;
  is_best_seller: boolean;
  is_limited: boolean;
  product_variants: Variant[];
};

type Review = {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
});

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProduct({ data: { slug } }),
    staleTime: 0,
  });

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params, context }) => {
    const key = ["product", params.slug];
    if (context.queryClient.getQueryData(key)) return;

    const catalog = context.queryClient.getQueryData(catalogQuery.queryKey);
    if (catalog) {
      const products = (
        catalog as unknown as { products: Array<{ slug: string; category_id: string | null }> }
      ).products;
      const found = products.find((p) => p.slug === params.slug);
      if (found) {
        const related = products
          .filter((p) => p.category_id === found.category_id && p.slug !== found.slug)
          .slice(0, 4);
        context.queryClient.setQueryData(key, {
          product: found,
          reviews: [],
          related,
        } as unknown as Awaited<ReturnType<typeof getProduct>>);
        return;
      }
    }

    return context.queryClient.ensureQueryData(productQuery(params.slug));
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { t, pick, locale, dir } = useI18n();
  const { add, isWished, toggleWish } = useCart();
  const { data } = useSuspenseQuery(productQuery(slug));

  const product = data.product as ProductDetail | null;
  const reviews = (data.reviews as Review[]) ?? [];
  const related = (data.related as unknown as ProductCardData[]) ?? [];

  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="container-salam py-24 text-center">
        <div className="gold-rule mx-auto" />
        <h1 className="mt-6 font-display text-4xl">{t("product.notFound")}</h1>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-sm bg-primary px-6 py-2.5 text-sm text-primary-foreground"
        >
          {t("product.backToShop")}
        </Link>
      </div>
    );
  }

  const variants = product.product_variants;
  const colors = variants.filter(
    (v, i, arr) => arr.findIndex((x) => x.color_en === v.color_en) === i,
  );
  const activeColor = colors[colorIndex];
  const sizesForColor = variants.filter((v) => v.color_en === (activeColor?.color_en ?? ""));
  const activeVariant = sizesForColor.find((v) => v.size === size) ?? null;
  const stock = activeVariant?.stock_available ?? 0;
  const soldOut = stock <= 0;

  const gallery: string[] = Array.isArray(product.gallery)
    ? (product.gallery as unknown as string[]).filter((u) => typeof u === "string")
    : [];
  const images = [
    activeVariant?.image_url ?? product.main_image,
    ...gallery.filter((u) => u !== (activeVariant?.image_url ?? product.main_image)),
  ].filter((u): u is string => Boolean(u));
  const mainImage = images[Math.min(imageIndex, Math.max(0, images.length - 1))] ?? null;

  const unitPrice = activeVariant?.price ?? product.sale_price ?? product.price;
  const listPrice = product.sale_price ?? product.price;

  const addToBag = () => {
    if (!activeVariant) {
      toast(t("product.chooseFirst"));
      return;
    }
    add(
      {
        variantId: activeVariant.id,
        productId: product.id,
        slug: product.slug,
        nameAr: product.name_ar,
        nameEn: product.name_en,
        colorAr: activeVariant.color_ar,
        colorEn: activeVariant.color_en,
        size: activeVariant.size,
        unitPrice: activeVariant.price ?? product.sale_price ?? product.price,
        image: activeVariant.image_url ?? product.main_image,
        maxQuantity: Math.max(1, activeVariant.stock_available),
      },
      quantity,
    );
    toast(t("product.added"));
  };

  const name = pick(product.name_ar, product.name_en);
  const discount = discountPercent(product.price, product.sale_price);

  return (
    <div className="container-salam py-12 md:py-16">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          {t("nav.home")}
        </Link>
        {dir === "rtl" ? (
          <ChevronLeft className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <Link to="/shop" className="hover:text-primary">
          {t("nav.shop")}
        </Link>
        {dir === "rtl" ? (
          <ChevronLeft className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          {images.length > 1 && (
            <div className="flex gap-3 md:flex-col">
              {images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setImageIndex(images.indexOf(img))}
                  className={`overflow-hidden rounded-sm border transition-colors ${
                    images[imageIndex] === img
                      ? "border-primary"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <img
                    src={img}
                    alt={name}
                    className="h-20 w-16 object-cover"
                    width={64}
                    height={80}
                  />
                </button>
              ))}
            </div>
          )}
          <div className="relative flex-1 overflow-hidden rounded-sm bg-surface-muted">
            {mainImage && (
              <img
                src={mainImage}
                alt={name}
                className="aspect-[3/4] w-full object-cover"
                width={900}
                height={1200}
              />
            )}
            {discount > 0 && (
              <span className="absolute end-3 top-3 rounded-sm bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                {discount}% {t("badge.sale")}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="eyebrow">{t("brand.name")}</div>
          <h1 className="mt-2 font-display text-4xl leading-tight">{name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl text-primary">{formatPrice(unitPrice, locale)}</span>
            {listPrice > unitPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(listPrice, locale)}
              </span>
            )}
          </div>

          <div className="mt-8">
            <div className="text-sm font-medium">{t("product.selectColor")}</div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {colors.map((c, i) => (
                <button
                  key={c.color_en}
                  type="button"
                  onClick={() => {
                    setColorIndex(i);
                    setSize(null);
                    setImageIndex(0);
                  }}
                  className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                    i === colorIndex
                      ? "border-primary bg-primary-soft text-foreground"
                      : "border-border text-muted-foreground hover:border-primary"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-border"
                    style={{ backgroundColor: c.color_hex }}
                  />
                  {pick(c.color_ar, c.color_en)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{t("product.selectSize")}</div>
              <Link to="/size-guide" className="text-xs text-primary hover:underline">
                {t("product.sizeGuide")}
              </Link>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {sizesForColor.map((v) => {
                const out = v.stock_available <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={out}
                    onClick={() => setSize(v.size)}
                    className={`min-w-11 rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                      v.size === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : out
                          ? "cursor-not-allowed border-border text-muted-foreground/40 line-through"
                          : "border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          {activeVariant && (
            <div className="mt-3 text-xs text-muted-foreground">
              {soldOut
                ? t("badge.soldOut")
                : stock <= 5
                  ? t("product.lowStock")
                  : t("product.inStock")}
              {activeVariant.sku ? ` — ${t("product.sku")}: ${activeVariant.sku}` : ""}
            </div>
          )}

          <div className="mt-6">
            <div className="text-sm font-medium">{t("product.quantity")}</div>
            <div className="mt-2.5 inline-flex items-center rounded-sm border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-primary"
                aria-label="decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-primary"
                aria-label="increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={addToBag}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("product.addToBag")}
            </button>
            <button
              type="button"
              onClick={() => toggleWish(product.slug)}
              className={`flex items-center justify-center gap-2 rounded-sm border px-5 py-3 text-sm transition-colors ${
                isWished(product.slug)
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <Heart className={`h-4 w-4 ${isWished(product.slug) ? "fill-current" : ""}`} />
              {isWished(product.slug) ? t("wishlist.remove") : t("nav.wishlist")}
            </button>
          </div>

          <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-primary" />
              {t("product.shippingInfo")}
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t("product.returnInfo")}
            </div>
            <a
              href={whatsappLink(`${t("product.askWhatsapp")} — ${name}`)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-primary hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              {t("product.askWhatsapp")}
            </a>
          </div>
        </div>
      </div>

      {(product.description_ar ||
        product.description_en ||
        product.fabric_ar ||
        product.care_ar) && (
        <div className="mx-auto mt-16 max-w-3xl border-t border-border pt-10">
          <h2 className="font-display text-2xl">{t("product.details")}</h2>
          {product.description_ar && (
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {pick(product.description_ar, product.description_en)}
            </p>
          )}
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {product.fabric_ar && (
              <div className="rounded-sm border border-border bg-surface p-4">
                <div className="flex items-center gap-2 font-medium">
                  <Scissors className="h-4 w-4 text-primary" />
                  {t("product.fabric")}
                </div>
                <div className="mt-1.5 text-muted-foreground">
                  {pick(product.fabric_ar, product.fabric_en)}
                </div>
              </div>
            )}
            {product.fit_ar && (
              <div className="rounded-sm border border-border bg-surface p-4">
                <div className="flex items-center gap-2 font-medium">
                  <Ruler className="h-4 w-4 text-primary" />
                  {t("product.fit")}
                </div>
                <div className="mt-1.5 text-muted-foreground">
                  {pick(product.fit_ar, product.fit_en)}
                </div>
              </div>
            )}
            {product.length_ar && (
              <div className="rounded-sm border border-border bg-surface p-4">
                <div className="flex items-center gap-2 font-medium">
                  <MoveVertical className="h-4 w-4 text-primary" />
                  {t("product.length")}
                </div>
                <div className="mt-1.5 text-muted-foreground">
                  {pick(product.length_ar, product.length_en)}
                </div>
              </div>
            )}
            {product.care_ar && (
              <div className="rounded-sm border border-border bg-surface p-4">
                <div className="flex items-center gap-2 font-medium">
                  <WashingMachine className="h-4 w-4 text-primary" />
                  {t("product.care")}
                </div>
                <div className="mt-1.5 text-muted-foreground">
                  {pick(product.care_ar, product.care_en)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-2xl">
          {t("product.reviews")} ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("product.noReviews")}</p>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-sm border border-border p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.author_name}</span>
                  <span className="flex gap-0.5" aria-label={`${r.rating}/5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating ? "fill-warning text-warning" : "text-border"
                        }`}
                      />
                    ))}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-2xl">{t("product.related")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
