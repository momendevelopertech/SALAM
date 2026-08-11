import type { Prisma } from "@prisma/client";

export const adminProductInclude = {
  product_variants: {
    select: {
      id: true,
      color_ar: true,
      color_en: true,
      color_hex: true,
      size: true,
      sku: true,
      price: true,
      stock_available: true,
      stock_reserved: true,
      stock_sold: true,
    },
  },
} satisfies Prisma.productsInclude;

export const adminOrderInclude = {
  order_items: {
    select: {
      id: true,
      name_ar: true,
      name_en: true,
      color_ar: true,
      color_en: true,
      size: true,
      quantity: true,
      unit_price: true,
      line_total: true,
      image_url: true,
    },
  },
} satisfies Prisma.ordersInclude;
