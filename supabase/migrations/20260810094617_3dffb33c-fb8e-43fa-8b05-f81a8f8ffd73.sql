REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

DROP POLICY "public read categories" ON public.categories;
CREATE POLICY "anon read active categories" ON public.categories FOR SELECT TO anon USING (is_active);
CREATE POLICY "auth read categories" ON public.categories FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "public read collections" ON public.collections;
CREATE POLICY "anon read active collections" ON public.collections FOR SELECT TO anon USING (is_active);
CREATE POLICY "auth read collections" ON public.collections FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "public read occasions" ON public.occasions;
CREATE POLICY "anon read active occasions" ON public.occasions FOR SELECT TO anon USING (is_active);
CREATE POLICY "auth read occasions" ON public.occasions FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "public read products" ON public.products;
CREATE POLICY "anon read active products" ON public.products FOR SELECT TO anon USING (is_active);
CREATE POLICY "auth read products" ON public.products FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "public read approved reviews" ON public.reviews;
CREATE POLICY "anon read approved reviews" ON public.reviews FOR SELECT TO anon USING (is_approved);
CREATE POLICY "auth read reviews" ON public.reviews FOR SELECT TO authenticated USING (is_approved OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));