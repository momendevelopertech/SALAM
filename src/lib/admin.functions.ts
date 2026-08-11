import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const uuid = z.string().uuid();

const productSchema = z.object({
  id: uuid.optional(),
  slug: z.string().min(2),
  sku: z.string().optional().nullable(),
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  category_id: uuid.nullable().optional(),
  collection_id: uuid.nullable().optional(),
  occasion_id: uuid.nullable().optional(),
  cost_price: z.number().nonnegative(),
  price: z.number().nonnegative(),
  sale_price: z.number().nonnegative().nullable().optional(),
  main_image: z.string().optional().nullable(),
  fabric_ar: z.string().optional().nullable(),
  fabric_en: z.string().optional().nullable(),
  fulfillment: z.enum(["in_stock", "made_to_order"]),
  is_new: z.boolean(),
  is_best_seller: z.boolean(),
  is_limited: z.boolean(),
  is_active: z.boolean(),
});

const taxonomySchema = z.object({
  id: uuid.optional(),
  table: z.enum(["categories", "collections", "occasions"]),
  slug: z.string().min(2),
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  sort_order: z.number().int(),
  is_active: z.boolean(),
});

export const getAdminMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { userId: context.userId, isAdmin: Boolean(data) };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const db = context.supabase;

    const [orders, products, variants] = await Promise.all([
      db.from("orders").select("total, status, payment_status, created_at"),
      db.from("products").select("id, is_active"),
      db.from("product_variants").select("stock_available, stock_reserved, stock_sold"),
    ]);

    const orderRows = (orders.data ?? []) as {
      total: number;
      status: string;
      payment_status: string;
      created_at: string;
    }[];
    const revenue = orderRows
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + Number(o.total), 0);
    const byStatus: Record<string, number> = {};
    for (const o of orderRows) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

    const variantRows = (variants.data ?? []) as { stock_available: number }[];

    return {
      revenue,
      orderCount: orderRows.length,
      pendingPayments: orderRows.filter((o) => o.payment_status === "awaiting_verification").length,
      productCount: (products.data ?? []).length,
      activeProducts: ((products.data ?? []) as { is_active: boolean }[]).filter((p) => p.is_active)
        .length,
      lowStock: variantRows.filter((v) => v.stock_available > 0 && v.stock_available <= 2).length,
      outOfStock: variantRows.filter((v) => v.stock_available === 0).length,
      byStatus,
    };
  });

export const getAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, ADMIN_PRODUCT_SELECT } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const [products, categories, collections, occasions] = await Promise.all([
      context.supabase
        .from("products")
        .select(ADMIN_PRODUCT_SELECT)
        .order("created_at", { ascending: false }),
      context.supabase.from("categories").select("id, name_ar, name_en").order("sort_order"),
      context.supabase.from("collections").select("id, name_ar, name_en").order("sort_order"),
      context.supabase.from("occasions").select("id, name_ar, name_en").order("sort_order"),
    ]);
    if (products.error) throw new Error(products.error.message);
    return {
      products: products.data ?? [],
      categories: categories.data ?? [],
      collections: collections.data ?? [],
      occasions: occasions.data ?? [],
    };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...fields } = data;
    const payload = {
      slug: fields.slug,
      sku: fields.sku ?? null,
      name_ar: fields.name_ar,
      name_en: fields.name_en,
      description_ar: fields.description_ar ?? null,
      description_en: fields.description_en ?? null,
      category_id: fields.category_id ?? null,
      collection_id: fields.collection_id ?? null,
      occasion_id: fields.occasion_id ?? null,
      cost_price: fields.cost_price,
      price: fields.price,
      sale_price: fields.sale_price ?? null,
      main_image: fields.main_image ?? null,
      fabric_ar: fields.fabric_ar ?? null,
      fabric_en: fields.fabric_en ?? null,
      fulfillment: fields.fulfillment,
      is_new: fields.is_new,
      is_best_seller: fields.is_best_seller,
      is_limited: fields.is_limited,
      is_active: fields.is_active,
    };
    const query = id
      ? context.supabase.from("products").update(payload).eq("id", id)
      : context.supabase.from("products").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setProductActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: uuid, isActive: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("products")
      .update({ is_active: data.isActive })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setVariantStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ variantId: uuid, stockAvailable: z.number().int().min(0).max(9999) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("product_variants")
      .update({ stock_available: data.stockAvailable })
      .eq("id", data.variantId);
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("inventory_history").insert({
      variant_id: data.variantId,
      change_type: "adjust",
      quantity: data.stockAvailable,
      note: "Admin stock adjustment",
    });
    return { ok: true };
  });

export const getAdminTaxonomies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const [categories, collections, occasions] = await Promise.all([
      context.supabase.from("categories").select("*").order("sort_order"),
      context.supabase.from("collections").select("*").order("sort_order"),
      context.supabase.from("occasions").select("*").order("sort_order"),
    ]);
    return {
      categories: categories.data ?? [],
      collections: collections.data ?? [],
      occasions: occasions.data ?? [],
    };
  });

export const saveTaxonomy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => taxonomySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, table, ...fields } = data;
    const payload = {
      ...fields,
      description_ar: fields.description_ar ?? null,
      description_en: fields.description_en ?? null,
      image_url: fields.image_url ?? null,
    };
    const query = id
      ? context.supabase.from(table).update(payload).eq("id", id)
      : context.supabase.from(table).insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTaxonomy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: uuid, table: z.enum(["categories", "collections", "occasions"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, ADMIN_ORDER_SELECT } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("orders")
      .select(ADMIN_ORDER_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { orders: data ?? [] };
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: uuid,
        status: z
          .enum([
            "pending",
            "confirmed",
            "preparing",
            "ready_for_shipping",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
          ])
          .optional(),
        paymentStatus: z
          .enum(["pending", "awaiting_verification", "paid", "failed", "refunded"])
          .optional(),
        trackingNumber: z.string().max(120).optional(),
        adminNotes: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: current, error: cErr } = await context.supabase
      .from("orders")
      .select("status")
      .eq("id", data.id)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!current) throw new Error("Order not found");
    const from = (current as { status: string }).status;

    const patch = {
      ...(data.status ? { status: data.status } : {}),
      ...(data.paymentStatus ? { payment_status: data.paymentStatus } : {}),
      ...(data.trackingNumber !== undefined
        ? { tracking_number: data.trackingNumber || null }
        : {}),
      ...(data.adminNotes !== undefined ? { admin_notes: data.adminNotes || null } : {}),
    };

    const { error } = await context.supabase.from("orders").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.status && data.status !== from) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { applyStatusStock } = await import("./orders.server");
      await applyStatusStock(supabaseAdmin, data.id, from, data.status);
    }
    return { ok: true };
  });
