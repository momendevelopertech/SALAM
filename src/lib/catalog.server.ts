import type { SupabaseClient } from "@supabase/supabase-js";

export const PRODUCT_SELECT = `
  id, slug, sku, name_ar, name_en, description_ar, description_en,
  category_id, collection_id, occasion_id, price, sale_price, main_image, gallery,
  fabric_ar, fabric_en, fit_ar, fit_en, length_ar, length_en, care_ar, care_en,
  tags, seo_title, meta_description, og_image, fulfillment,
  is_new, is_best_seller, is_limited, units_sold, created_at,
  product_variants ( id, color_ar, color_en, color_hex, size, sku, price, image_url, stock_available )
`;

export async function fetchTaxonomies(db: SupabaseClient) {
  const [categories, collections, occasions, shipping] = await Promise.all([
    db.from("categories").select("*").eq("is_active", true).order("sort_order"),
    db.from("collections").select("*").eq("is_active", true).order("sort_order"),
    db.from("occasions").select("*").eq("is_active", true).order("sort_order"),
    db.from("shipping_rates").select("*").eq("is_active", true).order("governorate_en"),
  ]);
  return {
    categories: categories.data ?? [],
    collections: collections.data ?? [],
    occasions: occasions.data ?? [],
    shippingRates: shipping.data ?? [],
  };
}

export async function fetchProducts(db: SupabaseClient) {
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
