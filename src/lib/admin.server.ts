import type { SupabaseClient } from "@supabase/supabase-js";

/** Throws unless the caller holds the admin role (checked through their own RLS session). */
export async function assertAdmin(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export const ADMIN_PRODUCT_SELECT = `
  id, slug, sku, name_ar, name_en, description_ar, description_en,
  category_id, collection_id, occasion_id, cost_price, price, sale_price,
  main_image, fabric_ar, fabric_en, fulfillment,
  is_new, is_best_seller, is_limited, is_active, units_sold, created_at,
  product_variants ( id, color_ar, color_en, color_hex, size, sku, price, stock_available, stock_reserved, stock_sold )
`;

export const ADMIN_ORDER_SELECT = `
  id, order_number, customer_name, phone, email, governorate, city, address, notes,
  subtotal, discount, shipping_fee, total, coupon_code, status,
  payment_method, payment_status, payment_reference, tracking_number, admin_notes,
  created_at, updated_at,
  order_items ( id, name_ar, name_en, color_ar, color_en, size, quantity, unit_price, line_total, image_url )
`;
