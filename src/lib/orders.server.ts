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

type VariantRow = {
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

export async function createOrder(input: PlaceOrderInput) {
  const { prisma } = await import("@/lib/db");

  const variantIds = input.items.map((i) => i.variantId);
  const variants = (await prisma.product_variants.findMany({
    where: { id: { in: variantIds } },
    include: { products: true },
  })) as unknown as VariantRow[];
  if (variants.length !== variantIds.length)
    throw new Error("بعض المنتجات في السلة لم تعد متاحة");

  const lines = input.items.map((item) => {
    const v = variants.find((r) => r.id === item.variantId)!;
    if (!v.products.is_active) throw new Error("أحد المنتجات في حقيبتك غير متاح");
    if (v.products.fulfillment === "in_stock" && v.stock_available < item.quantity)
      throw new Error("الكمية المطلوبة غير متاحة للمخزون الحالي");
    const unit = Number(v.price ?? v.products.sale_price ?? v.products.price);
    return {
      variant: v,
      quantity: item.quantity,
      unitPrice: unit,
      lineTotal: Math.round(unit * item.quantity * 100) / 100,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  const rate = await prisma.shipping_rates.findFirst({
    where: {
      is_active: true,
      OR: [{ governorate_en: input.governorate }, { governorate_ar: input.governorate }],
    },
    select: { fee: true },
  });
  const shippingFee = Number(rate?.fee ?? 0);

  let discount = 0;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const coupon = await prisma.coupons.findFirst({
      where: { code: input.couponCode.trim().toUpperCase(), is_active: true },
    });
    const usable =
      coupon &&
      (!coupon.expires_at || coupon.expires_at.getTime() >= Date.now()) &&
      (coupon.usage_limit === null || coupon.used_count < coupon.usage_limit) &&
      (!coupon.min_total || subtotal >= Number(coupon.min_total));
    if (usable && coupon) {
      discount =
        coupon.type === "percentage"
          ? Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100
          : Math.min(Number(coupon.value), subtotal);
      couponCode = coupon.code;
      await prisma.coupons.update({
        where: { id: coupon.id },
        data: { used_count: { increment: 1 } },
      });
    }
  }

  const total = Math.max(0, Math.round((subtotal - discount + shippingFee) * 100) / 100);
  const orderNumber = makeOrderNumber();

  const order = await prisma.orders.create({
    data: {
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
    },
    select: { id: true, order_number: true, total: true, status: true, payment_status: true },
  });

  await prisma.order_items.createMany({
    data: lines.map((l) => ({
      order_id: order.id,
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
  });

  for (const l of lines) {
    const stock = await prisma.product_variants.findUnique({
      where: { id: l.variant.id },
      select: { stock_available: true, stock_reserved: true },
    });
    if (stock) {
      await prisma.product_variants.update({
        where: { id: l.variant.id },
        data: {
          stock_available: Math.max(0, stock.stock_available - l.quantity),
          stock_reserved: stock.stock_reserved + l.quantity,
        },
      });
    }
    await prisma.inventory_history.create({
      data: {
        variant_id: l.variant.id,
        order_id: order.id,
        change_type: "reserve",
        quantity: l.quantity,
        note: `Order ${orderNumber}`,
      },
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

export async function applyStatusStock(orderId: string, from: string, to: string) {
  const { prisma } = await import("@/lib/db");
  const terminalDone = to === "delivered";
  const cancelled = to === "cancelled";
  if (!terminalDone && !cancelled) return;
  if (from === "delivered" || from === "cancelled") return;

  const items = await prisma.order_items.findMany({
    where: { order_id: orderId },
    select: { variant_id: true, quantity: true },
  });

  for (const it of items) {
    if (!it.variant_id) continue;
    const v = await prisma.product_variants.findUnique({
      where: { id: it.variant_id },
      select: { stock_available: true, stock_reserved: true, stock_sold: true },
    });
    if (!v) continue;
    const reserved = Math.max(0, v.stock_reserved - it.quantity);
    await prisma.product_variants.update({
      where: { id: it.variant_id },
      data: terminalDone
        ? { stock_reserved: reserved, stock_sold: v.stock_sold + it.quantity }
        : { stock_reserved: reserved, stock_available: v.stock_available + it.quantity },
    });
    await prisma.inventory_history.create({
      data: {
        variant_id: it.variant_id,
        order_id: orderId,
        change_type: terminalDone ? "sold" : "release",
        quantity: it.quantity,
      },
    });
  }
}
