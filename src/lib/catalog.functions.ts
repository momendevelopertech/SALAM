import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type CacheEntry<T> = { data: T; at: number };

function ttlCache<T>(ttlMs: number) {
  const store = new Map<string, CacheEntry<T>>();
  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() - entry.at > ttlMs) {
        store.delete(key);
        return undefined;
      }
      return entry.data;
    },
    set(key: string, data: T) {
      store.set(key, { data, at: Date.now() });
    },
  };
}

const catalogCache = ttlCache<Awaited<ReturnType<typeof getCatalogHandler>>>(60_000);
const productCache = ttlCache<Awaited<ReturnType<typeof getProductHandler>>>(30_000);

async function getCatalogHandler() {
  const { fetchTaxonomies, fetchProducts } = await import("./catalog.server");
  const [taxonomies, products] = await Promise.all([fetchTaxonomies(), fetchProducts()]);
  return { ...taxonomies, products };
}

async function getProductHandler(slug: string) {
  const { prisma } = await import("@/lib/db");
  const { productInclude } = await import("./catalog.server");

  const product = await prisma.products.findFirst({
    where: { slug, is_active: true },
    include: productInclude,
  });

  if (!product) return { product: null, reviews: [], related: [] };

  const [reviews, related] = await Promise.all([
    prisma.reviews.findMany({
      where: { product_id: product.id, is_approved: true },
      select: { id: true, author_name: true, rating: true, comment: true, created_at: true },
      orderBy: { created_at: "desc" },
    }),
    prisma.products.findMany({
      where: {
        is_active: true,
        category_id: product.category_id,
        slug: { not: product.slug },
      },
      include: productInclude,
      take: 4,
    }),
  ]);

  return { product, reviews, related };
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const cached = catalogCache.get("catalog");
  if (cached) return cached;
  const data = await getCatalogHandler();
  catalogCache.set("catalog", data);
  return data;
});

export const getProduct = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const cached = productCache.get(data.slug);
    if (cached) return cached;
    const result = await getProductHandler(data.slug);
    productCache.set(data.slug, result);
    return result;
  });

export const validateCoupon = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ code: z.string().min(1), subtotal: z.number().nonnegative() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");
    const coupon = await prisma.coupons.findFirst({
      where: { code: data.code.trim().toUpperCase(), is_active: true },
    });

    if (!coupon) return { valid: false as const, reason: "not_found" as const };
    if (coupon.expires_at && coupon.expires_at.getTime() < Date.now())
      return { valid: false as const, reason: "expired" as const };
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit)
      return { valid: false as const, reason: "used_up" as const };
    if (coupon.min_total && data.subtotal < Number(coupon.min_total))
      return {
        valid: false as const,
        reason: "min_total" as const,
        minTotal: Number(coupon.min_total),
      };

    const discount =
      coupon.type === "percentage"
        ? Math.round(data.subtotal * (Number(coupon.value) / 100) * 100) / 100
        : Math.min(Number(coupon.value), data.subtotal);

    return { valid: true as const, code: coupon.code, discount };
  });
