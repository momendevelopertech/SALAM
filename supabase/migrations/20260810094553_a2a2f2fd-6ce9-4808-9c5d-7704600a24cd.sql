-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','customer');
CREATE TYPE public.fulfillment_type AS ENUM ('in_stock','made_to_order');
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','preparing','ready_for_shipping','shipped','out_for_delivery','delivered','cancelled');
CREATE TYPE public.payment_method AS ENUM ('cod','instapay','vodafone_cash');
CREATE TYPE public.payment_status AS ENUM ('pending','awaiting_verification','paid','failed','refunded');
CREATE TYPE public.coupon_type AS ENUM ('percentage','fixed');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  locale TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.collections (LIKE public.categories INCLUDING ALL);
CREATE TABLE public.occasions (LIKE public.categories INCLUDING ALL);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  sku TEXT,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  occasion_id UUID REFERENCES public.occasions(id) ON DELETE SET NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  main_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url TEXT,
  fabric_ar TEXT, fabric_en TEXT,
  fit_ar TEXT, fit_en TEXT,
  length_ar TEXT, length_en TEXT,
  care_ar TEXT, care_en TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  seo_title TEXT, meta_description TEXT, og_image TEXT,
  fulfillment public.fulfillment_type NOT NULL DEFAULT 'in_stock',
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_limited BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  units_sold INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_ar TEXT NOT NULL,
  color_en TEXT NOT NULL,
  color_hex TEXT NOT NULL DEFAULT '#000000',
  size TEXT NOT NULL,
  sku TEXT,
  price NUMERIC(10,2),
  image_url TEXT,
  stock_available INT NOT NULL DEFAULT 0,
  stock_reserved INT NOT NULL DEFAULT 0,
  stock_sold INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, color_en, size)
);

CREATE TABLE public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governorate_ar TEXT NOT NULL,
  governorate_en TEXT NOT NULL,
  fee NUMERIC(10,2) NOT NULL,
  days_min INT NOT NULL DEFAULT 2,
  days_max INT NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type public.coupon_type NOT NULL DEFAULT 'percentage',
  value NUMERIC(10,2) NOT NULL,
  min_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  usage_limit INT,
  used_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,
  status public.order_status NOT NULL DEFAULT 'pending',
  payment_method public.payment_method NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  payment_proof_url TEXT,
  tracking_number TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
  color_ar TEXT, color_en TEXT, size TEXT,
  image_url TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL,
  line_total NUMERIC(10,2) NOT NULL
);

CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL,
  quantity INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories, public.collections, public.occasions, public.products, public.product_variants, public.shipping_rates, public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories, public.collections, public.occasions, public.products, public.product_variants, public.shipping_rates, public.coupons, public.orders, public.order_items, public.wishlist_items, public.reviews, public.inventory_history TO authenticated;
GRANT ALL ON public.categories, public.collections, public.occasions, public.products, public.product_variants, public.shipping_rates, public.coupons, public.orders, public.order_items, public.wishlist_items, public.reviews, public.inventory_history TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read collections" ON public.collections FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write collections" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read occasions" ON public.occasions FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write occasions" ON public.occasions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read variants" ON public.product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write variants" ON public.product_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read shipping" ON public.shipping_rates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write shipping" ON public.shipping_rates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own order items read" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "admin manage order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own wishlist" ON public.wishlist_items FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "public read approved reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (is_approved OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "write own review" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin manage reviews" ON public.reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin read inventory history" ON public.inventory_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER t_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_variants_updated BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.categories (slug,name_ar,name_en,description_ar,description_en,sort_order) VALUES
('abayas','عبايات','Abayas','عبايات مصممة بخطوط هادئة وأقمشة فاخرة','Abayas cut in calm lines and premium fabrics',1),
('esdals','إسدالات','Esdals','إسدالات مريحة بتفاصيل بسيطة','Comfortable esdals with quiet detailing',2),
('modest-dresses','فساتين محتشمة','Modest Dresses','فساتين محتشمة لكل يوم ولكل مناسبة','Modest dresses for every day and occasion',3);

INSERT INTO public.collections (slug,name_ar,name_en,description_ar,description_en,sort_order) VALUES
('new-arrivals','وصل حديثًا','New Arrivals','أحدث ما وصل إلى سلام','The latest arrivals at SALAM',1),
('signature','التوقيع','Signature','قطع سلام الأساسية','The SALAM signature pieces',2),
('everyday-elegance','أناقة اليوم','Everyday Elegance','أناقة عملية لكل يوم','Practical elegance for every day',3),
('limited-edition','إصدار محدود','Limited Edition','كميات محدودة','Limited quantities',4);

INSERT INTO public.occasions (slug,name_ar,name_en,sort_order) VALUES
('everyday','كل يوم','Everyday',1),
('work-outings','العمل والخروج','Work & Outings',2),
('special','المناسبات الخاصة','Special Occasions',3),
('prayer','الصلاة','Prayer',4);

INSERT INTO public.shipping_rates (governorate_ar,governorate_en,fee,days_min,days_max) VALUES
('القاهرة','Cairo',60,1,3),('الجيزة','Giza',60,1,3),('الإسكندرية','Alexandria',75,2,4),
('الدقهلية','Dakahlia',80,2,5),('الشرقية','Sharqia',80,2,5),('القليوبية','Qalyubia',70,2,4),
('البحيرة','Beheira',85,3,5),('الغربية','Gharbia',80,2,5),('المنوفية','Monufia',80,2,5),
('أسيوط','Assiut',95,3,6),('سوهاج','Sohag',95,3,6),('الأقصر','Luxor',100,4,7),
('أسوان','Aswan',100,4,7),('بورسعيد','Port Said',85,3,5),('السويس','Suez',85,3,5),
('الفيوم','Fayoum',90,3,6),('بني سويف','Beni Suef',90,3,6),('المنيا','Minya',90,3,6),
('كفر الشيخ','Kafr El Sheikh',85,3,5),('دمياط','Damietta',85,3,5),('الإسماعيلية','Ismailia',85,3,5),
('قنا','Qena',100,4,7),('مطروح','Matrouh',110,4,8),('البحر الأحمر','Red Sea',110,4,8),
('شمال سيناء','North Sinai',120,5,9),('جنوب سيناء','South Sinai',120,5,9),('الوادي الجديد','New Valley',120,5,9);

INSERT INTO public.coupons (code,type,value,min_total,is_active) VALUES ('SALAM10','percentage',10,1000,true);

INSERT INTO public.products (slug,sku,name_ar,name_en,description_ar,description_en,category_id,collection_id,occasion_id,cost_price,price,sale_price,fabric_ar,fabric_en,fit_ar,fit_en,length_ar,length_en,care_ar,care_en,tags,is_new,is_best_seller,is_limited,units_sold,seo_title,meta_description)
SELECT v.slug, v.sku, v.name_ar, v.name_en, v.desc_ar, v.desc_en,
  (SELECT id FROM public.categories WHERE slug = v.cat),
  (SELECT id FROM public.collections WHERE slug = v.col),
  (SELECT id FROM public.occasions WHERE slug = v.occ),
  v.cost, v.price, v.sale, v.fab_ar, v.fab_en, v.fit_ar, v.fit_en, v.len_ar, v.len_en,
  'غسيل يدوي بماء بارد، تجنبي المجفف', 'Hand wash cold, do not tumble dry',
  v.tags, v.is_new, v.is_best, v.is_ltd, v.sold, v.name_ar || ' | سلام', v.desc_ar
FROM (VALUES
 ('abaya-hadea','SLM-AB-001','عباية هادئة','Hadea Abaya','عباية بقصة مستقيمة وأكمام واسعة من قماش الكريب الفاخر.','A straight-cut abaya with wide sleeves in premium crepe.','abayas','signature','everyday',700,1500,1250,'كريب فاخر','Premium crepe','فضفاض','Relaxed','طويل','Full length',ARRAY['عباية','كريب','أساسي'],true,true,false,42),
 ('abaya-sakina','SLM-AB-002','عباية سكينة','Sakina Abaya','عباية بتفاصيل كسرات ناعمة على الأكمام.','An abaya with soft pleated sleeve detailing.','abayas','signature','work-outings',780,1750,NULL,'كريب كوري','Korean crepe','منتظم','Regular','طويل','Full length',ARRAY['عباية','كسرات'],false,true,false,35),
 ('abaya-noor','SLM-AB-003','عباية نور','Noor Abaya','عباية بتطريز يدوي هادئ على الصدر.','An abaya with quiet hand embroidery at the chest.','abayas','limited-edition','special',1100,2400,2150,'كريب مطرز','Embroidered crepe','منتظم','Regular','طويل','Full length',ARRAY['عباية','مطرز','مناسبات'],true,false,true,12),
 ('abaya-rahma','SLM-AB-004','عباية رحمة','Rahma Abaya','عباية يومية خفيفة بجيوب جانبية.','A light everyday abaya with side pockets.','abayas','everyday-elegance','everyday',620,1350,NULL,'كريب خفيف','Light crepe','فضفاض','Relaxed','طويل','Full length',ARRAY['عباية','يومي'],false,false,false,58),
 ('abaya-lina','SLM-AB-005','عباية لينا','Lina Abaya','عباية بحزام قابل للربط يبرز القوام بحياء.','An abaya with a tie belt for a modest defined shape.','abayas','new-arrivals','work-outings',820,1850,NULL,'كريب سيرين','Serene crepe','منتظم','Regular','طويل','Full length',ARRAY['عباية','حزام'],true,false,false,9),
 ('esdal-safa','SLM-ES-001','إسدال صفا','Safa Esdal','إسدال بقطعتين مريح للصلاة والخروج.','A two-piece esdal, comfortable for prayer and outings.','esdals','signature','prayer',420,900,790,'كريب ناعم','Soft crepe','فضفاض','Relaxed','طويل','Full length',ARRAY['إسدال','صلاة'],false,true,false,71),
 ('esdal-tuqa','SLM-ES-002','إسدال تُقى','Tuqa Esdal','إسدال بخامة لا تحتاج كي.','An esdal in a wrinkle-resistant fabric.','esdals','everyday-elegance','prayer',390,850,NULL,'ميكروفايبر','Microfiber','فضفاض','Relaxed','طويل','Full length',ARRAY['إسدال','سفر'],false,false,false,44),
 ('esdal-huda','SLM-ES-003','إسدال هدى','Huda Esdal','إسدال بأطراف مزينة بشريط ساتان.','An esdal finished with satin trim.','esdals','new-arrivals','prayer',470,990,NULL,'كريب ساتان','Satin crepe','منتظم','Regular','طويل','Full length',ARRAY['إسدال','ساتان'],true,false,false,6),
 ('dress-yasmin','SLM-DR-001','فستان ياسمين','Yasmin Dress','فستان محتشم بقصة A وأكمام طويلة.','A modest A-line dress with long sleeves.','modest-dresses','signature','work-outings',650,1450,1290,'فيسكوز','Viscose','منتظم','Regular','ماكسي','Maxi',ARRAY['فستان','يومي'],false,true,false,39),
 ('dress-salma','SLM-DR-002','فستان سلمى','Salma Dress','فستان سواريه محتشم بتفاصيل لامعة خفيفة.','A modest evening dress with subtle shimmer.','modest-dresses','limited-edition','special',1250,2650,NULL,'شيفون مبطن','Lined chiffon','منتظم','Regular','ماكسي','Maxi',ARRAY['فستان','سواريه'],true,false,true,7),
 ('dress-mariam','SLM-DR-003','فستان مريم','Mariam Dress','فستان قطن مريح للاستخدام اليومي.','A comfortable cotton dress for daily wear.','modest-dresses','everyday-elegance','everyday',480,1050,950,'قطن','Cotton','فضفاض','Relaxed','ماكسي','Maxi',ARRAY['فستان','قطن'],false,false,false,52),
 ('dress-jana','SLM-DR-004','فستان جنى','Jana Dress','فستان بخطوط عمودية يمنح إحساس الطول.','A dress with vertical lines for an elongated line.','modest-dresses','new-arrivals','work-outings',700,1550,NULL,'كريب مخطط','Striped crepe','منتظم','Regular','ماكسي','Maxi',ARRAY['فستان','مخطط'],true,false,false,4)
) AS v(slug,sku,name_ar,name_en,desc_ar,desc_en,cat,col,occ,cost,price,sale,fab_ar,fab_en,fit_ar,fit_en,len_ar,len_en,tags,is_new,is_best,is_ltd,sold);

INSERT INTO public.product_variants (product_id,color_ar,color_en,color_hex,size,sku,stock_available,stock_sold)
SELECT p.id, c.ar, c.en, c.hex, s.size, p.sku || '-' || c.code || '-' || s.size,
  CASE WHEN (abs(hashtext(p.slug || c.en || s.size)) % 10) = 0 THEN 0 ELSE 2 + (abs(hashtext(p.slug || c.en || s.size)) % 9) END,
  abs(hashtext(p.slug || c.en || s.size)) % 4
FROM public.products p
CROSS JOIN (VALUES ('أسود','Black','#111111','BLK'),('موكا','Mocha','#8a6a4f','MCH'),('رملي','Sand','#cbb79a','SND')) AS c(ar,en,hex,code)
CROSS JOIN (VALUES ('S'),('M'),('L'),('XL'),('XXL')) AS s(size);

INSERT INTO public.reviews (product_id,author_name,rating,comment,is_approved)
SELECT p.id, r.name, r.rating, r.comment, true
FROM public.products p
CROSS JOIN (VALUES
 ('نورهان م.',5,'الخامة فخمة جدًا والقصة محترمة، هستقبل تاني بإذن الله.'),
 ('سارة ع.',5,'المقاس مطابق والتغليف أنيق.'),
 ('أم يوسف',4,'قماش مريح جدًا، التوصيل كان سريع.')
) AS r(name,rating,comment)
WHERE p.is_best_seller OR p.is_new;