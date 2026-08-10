import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(10) });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createOrder } = await import("./orders.server");
    const { email, ...rest } = data;
    return createOrder(supabaseAdmin, email ? { ...rest, email } : rest);
  });

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ orderNumber: z.string().min(3), phone: z.string().min(6) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number, status, payment_status, payment_method, total, subtotal, discount, shipping_fee, tracking_number, governorate, city, created_at, order_items(name_ar, name_en, color_ar, color_en, size, quantity, unit_price, image_url)",
      )
      .eq("order_number", data.orderNumber.trim().toUpperCase())
      .eq("phone", data.phone.trim())
      .maybeSingle();
    return { order: order ?? null };
  });
