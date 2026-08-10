import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { fetchTaxonomies, fetchProducts } = await import("./catalog.server");
  const db = getPublicClient();
  const [taxonomies, products] = await Promise.all([fetchTaxonomies(db), fetchProducts(db)]);
  return { ...taxonomies, products };
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const { PRODUCT_SELECT } = await import("./catalog.server");
    const db = getPublicClient();

    const { data: product } = await db
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();

    if (!product) return { product: null, reviews: [], related: [] };

    const [reviews, related] = await Promise.all([
      db
        .from("reviews")
        .select("id, author_name, rating, comment, created_at")
        .eq("product_id", (product as { id: string }).id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false }),
      db
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_active", true)
        .eq("category_id", (product as { category_id: string }).category_id)
        .neq("slug", data.slug)
        .limit(4),
    ]);

    return { product, reviews: reviews.data ?? [], related: related.data ?? [] };
  });

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().min(1), subtotal: z.number().nonnegative() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const db = getPublicClient();
    const { data: coupon } = await db
      .from("coupons")
      .select("code, type, value, min_total, expires_at, usage_limit, used_count")
      .eq("code", data.code.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!coupon) return { valid: false as const, reason: "not_found" as const };
    const c = coupon as {
      code: string;
      type: "percentage" | "fixed";
      value: number;
      min_total: number | null;
      expires_at: string | null;
      usage_limit: number | null;
      used_count: number;
    };
    if (c.expires_at && new Date(c.expires_at) < new Date())
      return { valid: false as const, reason: "expired" as const };
    if (c.usage_limit !== null && c.used_count >= c.usage_limit)
      return { valid: false as const, reason: "used_up" as const };
    if (c.min_total && data.subtotal < Number(c.min_total))
      return { valid: false as const, reason: "min_total" as const, minTotal: Number(c.min_total) };

    const discount =
      c.type === "percentage"
        ? Math.round(data.subtotal * (Number(c.value) / 100) * 100) / 100
        : Math.min(Number(c.value), data.subtotal);

    return { valid: true as const, code: c.code, discount };
  });
