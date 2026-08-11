import type { Prisma } from "@prisma/client";

export const productInclude = {
  product_variants: {
    select: {
      id: true,
      color_ar: true,
      color_en: true,
      color_hex: true,
      size: true,
      sku: true,
      price: true,
      image_url: true,
      stock_available: true,
    },
  },
} satisfies Prisma.productsInclude;

export async function fetchTaxonomies() {
  const { prisma } = await import("@/lib/db");
  const [categories, collections, occasions, shippingRates] = await Promise.all([
    prisma.categories.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } }),
    prisma.collections.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } }),
    prisma.occasions.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } }),
    prisma.shipping_rates.findMany({
      where: { is_active: true },
      orderBy: { governorate_en: "asc" },
    }),
  ]);
  return { categories, collections, occasions, shippingRates };
}

export async function fetchProducts() {
  const { prisma } = await import("@/lib/db");
  return prisma.products.findMany({
    where: { is_active: true },
    include: productInclude,
    orderBy: { created_at: "desc" },
  });
}
