import type { SupabaseClient } from "@supabase/supabase-js";

export type PlaceOrderInput = {
  customerName: string;
  phone: string;
  email?: string | undefined;
  governorate: string;
  city: string;
  address: string;
  notes?: string | undefined;
  paymentMethod: "cod" | "instapay" | "vodafone_cash";
  paymentReference?: string | undefined;
  couponCode?: string | undefined;
  userId?: string | null | undefined;
  items: { variantId: string; quantity: number }[];
};

export function makeOrderNumber() {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SLM-${stamp}-${rand}`;
}

export async function createOrder(db: SupabaseClient, input: PlaceOrderInput) {
  const variantIds = input.items.map((i) => i.variantId);
  const { data: variants, error: vErr } = await db
    .from("product_variants")
    .select(
      "id, product_id, color_ar, color_en, size, sku, price, image_url, stock_available, stock_reserved, products(name_ar, name_en, price, sale_price, cost_price, main_image, is_active, fulfillment)",
    )
    .in("id", variantIds);
  if (vErr) throw new Error(vErr.message);
  if (!variants || variants.length !== variantIds.length)
    throw new Error("Some items are no longer available");

  type Row = {
    id: string;
    product_id: string;
    color_ar: string;
    color_en: string;
    size: string;
    price: number | null;
    image_url: string | null;
    stock_available: number;
    stock_reserved: number;
    products: {
      name_ar: string;
      name_en: string;
      price: number;
      sale_price: number | null;
      cost_price: number | null;
      main_image: string | null;
      is_active: boolean;
      fulfillment: "in_stock" | "made_to_order";
    };
  };

  const rows = variants as unknown as Row[];
  const lines = input.items.map((item) => {
    const v = rows.find((r) => r.id === item.variantId)!;
    if (!v.products.is_active) throw new Error("A product in your bag is unavailable");
    if (v.products.fulfillment === "in_stock" && v.stock_available < item.quantity)
      throw new Error("Not enough stock for one of your items");
    const unit = Number(v.price ?? v.products.sale_price ?? v.products.price);
    return {
      variant: v,
      quantity: item.quantity,
      unitPrice: unit,
      lineTotal: Math.round(unit * item.quantity * 100) / 100,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  const { data: rate } = await db
    .from("shipping_rates")
    .select("fee")
    .or(`governorate_en.eq.${input.governorate},governorate_ar.eq.${input.governorate}`)
    .eq("is_active", true)
    .maybeSingle();
  const shippingFee = Number((rate as { fee: number } | null)?.fee ?? 0);

  let discount = 0;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const { data: coupon } = await db
      .from("coupons")
      .select("id, code, type, value, min_total, expires_at, usage_limit, used_count")
      .eq("code", input.couponCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    const c = coupon as {
      id: string;
      code: string;
      type: "percentage" | "fixed";
      value: number;
      min_total: number | null;
      expires_at: string | null;
      usage_limit: number | null;
      used_count: number;
    } | null;
    const usable =
      c &&
      (!c.expires_at || new Date(c.expires_at) >= new Date()) &&
      (c.usage_limit === null || c.used_count < c.usage_limit) &&
      (!c.min_total || subtotal >= Number(c.min_total));
    if (usable && c) {
      discount =
        c.type === "percentage"
          ? Math.round(subtotal * (Number(c.value) / 100) * 100) / 100
          : Math.min(Number(c.value), subtotal);
      couponCode = c.code;
      await db
        .from("coupons")
        .update({ used_count: c.used_count + 1 })
        .eq("id", c.id);
    }
  }

  const total = Math.max(0, Math.round((subtotal - discount + shippingFee) * 100) / 100);
  const orderNumber = makeOrderNumber();

  const { data: order, error: oErr } = await db
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: input.userId ?? null,
      customer_name: input.customerName,
      phone: input.phone,
      email: input.email ?? null,
      governorate: input.governorate,
      city: input.city,
      address: input.address,
      notes: input.notes ?? null,
      subtotal,
      discount,
      shipping_fee: shippingFee,
      total,
      coupon_code: couponCode,
      status: "pending",
      payment_method: input.paymentMethod,
      payment_status: input.paymentMethod === "cod" ? "pending" : "awaiting_verification",
      payment_reference: input.paymentReference ?? null,
    })
    .select("id, order_number, total, status, payment_status")
    .single();
  if (oErr) throw new Error(oErr.message);

  const orderId = (order as { id: string }).id;

  const { error: iErr } = await db.from("order_items").insert(
    lines.map((l) => ({
      order_id: orderId,
      product_id: l.variant.product_id,
      variant_id: l.variant.id,
      name_ar: l.variant.products.name_ar,
      name_en: l.variant.products.name_en,
      color_ar: l.variant.color_ar,
      color_en: l.variant.color_en,
      size: l.variant.size,
      image_url: l.variant.image_url ?? l.variant.products.main_image,
      unit_price: l.unitPrice,
      cost_price: l.variant.products.cost_price ?? 0,
      quantity: l.quantity,
      line_total: l.lineTotal,
    })),
  );
  if (iErr) throw new Error(iErr.message);

  for (const l of lines) {
    await db
      .from("product_variants")
      .update({
        stock_available: Math.max(0, l.variant.stock_available - l.quantity),
        stock_reserved: l.variant.stock_reserved + l.quantity,
      })
      .eq("id", l.variant.id);
    await db.from("inventory_history").insert({
      variant_id: l.variant.id,
      order_id: orderId,
      change_type: "reserve",
      quantity: l.quantity,
      note: `Order ${orderNumber}`,
    });
  }

  return {
    orderNumber,
    total,
    subtotal,
    discount,
    shippingFee,
  };
}

export async function applyStatusStock(
  db: SupabaseClient,
  orderId: string,
  from: string,
  to: string,
) {
  const terminalDone = to === "delivered";
  const cancelled = to === "cancelled";
  if (!terminalDone && !cancelled) return;
  if (from === "delivered" || from === "cancelled") return;

  const { data: items } = await db
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);
  for (const it of (items ?? []) as { variant_id: string; quantity: number }[]) {
    const { data: v } = await db
      .from("product_variants")
      .select("stock_available, stock_reserved, stock_sold")
      .eq("id", it.variant_id)
      .maybeSingle();
    if (!v) continue;
    const row = v as { stock_available: number; stock_reserved: number; stock_sold: number };
    const reserved = Math.max(0, row.stock_reserved - it.quantity);
    await db
      .from("product_variants")
      .update(
        terminalDone
          ? { stock_reserved: reserved, stock_sold: row.stock_sold + it.quantity }
          : { stock_reserved: reserved, stock_available: row.stock_available + it.quantity },
      )
      .eq("id", it.variant_id);
    await db.from("inventory_history").insert({
      variant_id: it.variant_id,
      order_id: orderId,
      change_type: terminalDone ? "sold" : "release",
      quantity: it.quantity,
    });
  }
}
