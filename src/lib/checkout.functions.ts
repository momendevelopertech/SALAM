import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export const placeOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        customerName: z.string().min(2),
        phone: z.string().min(8),
        email: z.string().email().optional().or(z.literal("")),
        governorate: z.string().min(2),
        city: z.string().min(2),
        address: z.string().min(4),
        notes: z.string().optional(),
        paymentMethod: z.enum(["cod", "instapay", "vodafone_cash"]),
        paymentReference: z.string().optional(),
        couponCode: z.string().optional(),
        items: z.array(itemSchema).min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { createOrder } = await import("./orders.server");
    const { getSessionUser } = await import("./auth.server");
    const { email, ...rest } = data;
    const user = await getSessionUser();
    return createOrder({
      ...(email ? { ...rest, email } : rest),
      userId: user?.id ?? null,
    });
  });

export const trackOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ orderNumber: z.string().min(3), phone: z.string().min(6) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { prisma } = await import("@/lib/db");
    const order = await prisma.orders.findFirst({
      where: {
        order_number: data.orderNumber.trim().toUpperCase(),
        phone: data.phone.trim(),
      },
      select: {
        order_number: true,
        status: true,
        payment_status: true,
        payment_method: true,
        total: true,
        subtotal: true,
        discount: true,
        shipping_fee: true,
        tracking_number: true,
        governorate: true,
        city: true,
        created_at: true,
        order_items: {
          select: {
            name_ar: true,
            name_en: true,
            color_ar: true,
            color_en: true,
            size: true,
            quantity: true,
            unit_price: true,
            image_url: true,
          },
        },
      },
    });
    return { order: order ?? null };
  });
