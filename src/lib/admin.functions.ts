import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "@/lib/auth.middleware";
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

type TaxonomyTable = "categories" | "collections" | "occasions";

type TaxonomyClient = {
  findMany: (args: { orderBy: { sort_order: "asc" | "desc" } }) => Promise<unknown[]>;
  update: (args: { where: { id: string }; data: TaxonomyPayload }) => Promise<unknown>;
  upsert: (args: {
    where: { slug: string };
    update: TaxonomyPayload;
    create: { slug: string } & TaxonomyPayload;
  }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

type TaxonomyPayload = {
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

function taxonomyDelegate(prisma: Awaited<typeof import("@/lib/db")>["prisma"], table: TaxonomyTable) {
  switch (table) {
    case "categories":
      return prisma.categories as unknown as TaxonomyClient;
    case "collections":
      return prisma.collections as unknown as TaxonomyClient;
    case "occasions":
      return prisma.occasions as unknown as TaxonomyClient;
  }
}

export const getAdminMe = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    return { userId: context.userId, isAdmin: true };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { prisma } = await import("@/lib/db");

    const [orders, productCount, activeProducts, variants, byStatus] = await Promise.all([
      prisma.orders.findMany({
        select: { total: true, status: true, payment_status: true, created_at: true },
      }),
      prisma.products.count(),
      prisma.products.count({ where: { is_active: true } }),
      prisma.product_variants.findMany({ select: { stock_available: true } }),
      prisma.orders.groupBy({ by: ["status"], _count: { status: true } }),
    ]);

    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0);
    const byStatusMap: Record<string, number> = {};
    for (const b of byStatus) byStatusMap[b.status] = b._count.status;

    const variantRows = variants as { stock_available: number }[];

    return {
      revenue,
      orderCount: orders.length,
      pendingPayments: orders.filter((o) => o.payment_status === "awaiting_verification").length,
      productCount,
      activeProducts,
      lowStock: variantRows.filter((v) => v.stock_available > 0 && v.stock_available <= 2).length,
      outOfStock: variantRows.filter((v) => v.stock_available === 0).length,
      byStatus: byStatusMap,
    };
  });

export const getAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { prisma } = await import("@/lib/db");
    const { adminProductInclude } = await import("./admin.server");

    const [products, categories, collections, occasions] = await Promise.all([
      prisma.products.findMany({
        include: adminProductInclude,
        orderBy: { created_at: "desc" },
      }),
      prisma.categories.findMany({
        select: { id: true, name_ar: true, name_en: true },
        orderBy: { sort_order: "asc" },
      }),
      prisma.collections.findMany({
        select: { id: true, name_ar: true, name_en: true },
        orderBy: { sort_order: "asc" },
      }),
      prisma.occasions.findMany({
        select: { id: true, name_ar: true, name_en: true },
        orderBy: { sort_order: "asc" },
      }),
    ]);

    return { products, categories, collections, occasions };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");
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

    if (id) {
      await prisma.products.update({ where: { id }, data: payload });
    } else {
      await prisma.products.upsert({ where: { slug: payload.slug }, update: payload, create: payload });
    }
    return { ok: true };
  });

export const setProductActive = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) => z.object({ id: uuid, isActive: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");
    await prisma.products.update({
      where: { id: data.id },
      data: { is_active: data.isActive },
    });
    return { ok: true };
  });

export const setVariantStock = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z.object({ variantId: uuid, stockAvailable: z.number().int().min(0).max(9999) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");
    await prisma.product_variants.update({
      where: { id: data.variantId },
      data: { stock_available: data.stockAvailable },
    });
    await prisma.inventory_history.create({
      data: {
        variant_id: data.variantId,
        change_type: "adjust",
        quantity: data.stockAvailable,
        note: "Admin stock adjustment",
      },
    });
    return { ok: true };
  });

export const getAdminTaxonomies = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { prisma } = await import("@/lib/db");
    const [categories, collections, occasions] = await Promise.all([
      prisma.categories.findMany({ orderBy: { sort_order: "asc" } }),
      prisma.collections.findMany({ orderBy: { sort_order: "asc" } }),
      prisma.occasions.findMany({ orderBy: { sort_order: "asc" } }),
    ]);
    return { categories, collections, occasions };
  });

export const saveTaxonomy = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) => taxonomySchema.parse(input))
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");
    const { id, table, ...fields } = data;
    const payload = {
      name_ar: fields.name_ar,
      name_en: fields.name_en,
      description_ar: fields.description_ar ?? null,
      description_en: fields.description_en ?? null,
      image_url: fields.image_url ?? null,
      sort_order: fields.sort_order,
      is_active: fields.is_active,
    };

    const delegate = taxonomyDelegate(prisma, table);
    if (id) {
      await delegate.update({ where: { id }, data: payload });
    } else {
      await delegate.upsert({
        where: { slug: fields.slug },
        update: payload,
        create: { slug: fields.slug, ...payload },
      });
    }
    return { ok: true };
  });

export const deleteTaxonomy = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z
      .object({ id: uuid, table: z.enum(["categories", "collections", "occasions"]) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");
    await taxonomyDelegate(prisma, data.table).delete({ where: { id: data.id } });
    return { ok: true };
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { prisma } = await import("@/lib/db");
    const { adminOrderInclude } = await import("./admin.server");
    const orders = await prisma.orders.findMany({
      include: adminOrderInclude,
      orderBy: { created_at: "desc" },
    });
    return { orders };
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
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
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");

    const current = await prisma.orders.findUnique({
      where: { id: data.id },
      select: { status: true },
    });
    if (!current) throw new Error("Order not found");
    const from = current.status;

    await prisma.orders.update({
      where: { id: data.id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.paymentStatus ? { payment_status: data.paymentStatus } : {}),
        ...(data.trackingNumber !== undefined
          ? { tracking_number: data.trackingNumber || null }
          : {}),
        ...(data.adminNotes !== undefined ? { admin_notes: data.adminNotes || null } : {}),
      },
    });

    if (data.status && data.status !== from) {
      const { applyStatusStock } = await import("./orders.server");
      await applyStatusStock(data.id, from, data.status);
    }
    return { ok: true };
  });
