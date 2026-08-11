import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  getAdminProducts,
  saveProduct,
  setProductActive,
  setVariantStock,
} from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type Variant = {
  id: string;
  color_ar: string;
  color_en: string;
  size: string;
  stock_available: number;
  stock_reserved: number;
  stock_sold: number;
};

type Product = {
  id: string;
  slug: string;
  sku: string | null;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  category_id: string | null;
  collection_id: string | null;
  occasion_id: string | null;
  cost_price: number;
  price: number;
  sale_price: number | null;
  main_image: string | null;
  fabric_ar: string | null;
  fabric_en: string | null;
  fulfillment: "in_stock" | "made_to_order";
  is_new: boolean;
  is_best_seller: boolean;
  is_limited: boolean;
  is_active: boolean;
  units_sold: number;
  product_variants: Variant[];
};

type Taxonomy = { id: string; name_ar: string; name_en: string };

const NONE = "__none__";

function emptyForm() {
  return {
    id: undefined as string | undefined,
    slug: "",
    sku: "",
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    category_id: NONE,
    collection_id: NONE,
    occasion_id: NONE,
    cost_price: "0",
    price: "0",
    sale_price: "",
    main_image: "",
    fabric_ar: "",
    fabric_en: "",
    fulfillment: "in_stock" as "in_stock" | "made_to_order",
    is_new: false,
    is_best_seller: false,
    is_limited: false,
    is_active: true,
  };
}

function AdminProducts() {
  const fetchProducts = useServerFn(getAdminProducts);
  const save = useServerFn(saveProduct);
  const toggleActive = useServerFn(setProductActive);
  const updateStock = useServerFn(setVariantStock);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => fetchProducts(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: ProductPayload) => save({ data: payload }),
    onSuccess: () => {
      toast.success("تم حفظ المنتج");
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeMutation = useMutation({
    mutationFn: (v: { id: string; isActive: boolean }) => toggleActive({ data: v }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const stockMutation = useMutation({
    mutationFn: (v: { variantId: string; stockAvailable: number }) => updateStock({ data: v }),
    onSuccess: () => {
      toast.success("تم تحديث المخزون");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const products = (data?.products ?? []) as unknown as Product[];
  const categories = (data?.categories ?? []) as unknown as Taxonomy[];
  const collections = (data?.collections ?? []) as unknown as Taxonomy[];
  const occasions = (data?.occasions ?? []) as unknown as Taxonomy[];

  const filtered = products.filter((p) =>
    `${p.name_ar} ${p.name_en} ${p.slug} ${p.sku ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  function openNew() {
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      slug: p.slug,
      sku: p.sku ?? "",
      name_ar: p.name_ar,
      name_en: p.name_en,
      description_ar: p.description_ar ?? "",
      description_en: p.description_en ?? "",
      category_id: p.category_id ?? NONE,
      collection_id: p.collection_id ?? NONE,
      occasion_id: p.occasion_id ?? NONE,
      cost_price: String(p.cost_price ?? 0),
      price: String(p.price ?? 0),
      sale_price: p.sale_price === null ? "" : String(p.sale_price),
      main_image: p.main_image ?? "",
      fabric_ar: p.fabric_ar ?? "",
      fabric_en: p.fabric_en ?? "",
      fulfillment: p.fulfillment,
      is_new: p.is_new,
      is_best_seller: p.is_best_seller,
      is_limited: p.is_limited,
      is_active: p.is_active,
    });
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({
      ...(form.id ? { id: form.id } : {}),
      slug: form.slug.trim(),
      sku: form.sku.trim() || null,
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim(),
      description_ar: form.description_ar.trim() || null,
      description_en: form.description_en.trim() || null,
      category_id: form.category_id === NONE ? null : form.category_id,
      collection_id: form.collection_id === NONE ? null : form.collection_id,
      occasion_id: form.occasion_id === NONE ? null : form.occasion_id,
      cost_price: Number(form.cost_price || 0),
      price: Number(form.price || 0),
      sale_price: form.sale_price === "" ? null : Number(form.sale_price),
      main_image: form.main_image.trim() || null,
      fabric_ar: form.fabric_ar.trim() || null,
      fabric_en: form.fabric_en.trim() || null,
      fulfillment: form.fulfillment,
      is_new: form.is_new,
      is_best_seller: form.is_best_seller,
      is_limited: form.is_limited,
      is_active: form.is_active,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">المنتجات</h1>
        <div className="flex gap-2">
          <Input
            placeholder="بحث…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40"
          />
          <Button onClick={openNew}>منتج جديد</Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>المخزون</TableHead>
                <TableHead>التوفير</TableHead>
                <TableHead>منشور</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const stock = p.product_variants.reduce((s, v) => s + v.stock_available, 0);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.main_image ? (
                          <img
                            src={p.main_image}
                            alt={p.name_ar}
                            loading="lazy"
                            className="size-12 rounded-sm object-cover"
                          />
                        ) : null}
                        <div>
                          <p className="font-medium">{p.name_ar}</p>
                          <p className="text-xs text-muted-foreground">{p.name_en}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatPrice(p.sale_price ?? p.price, "ar")}
                    </TableCell>
                    <TableCell>
                      <span className={stock === 0 ? "text-destructive" : ""}>{stock}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {p.fulfillment === "in_stock" ? "متوفر" : "تحت الطلب"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={p.is_active}
                        onCheckedChange={(v) => activeMutation.mutate({ id: p.id, isActive: v })}
                      />
                    </TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                        تعديل
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-2xl">المخزون حسب المقاس واللون</h2>
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-sm border p-4">
              <p className="mb-3 font-medium">{p.name_ar}</p>
              <div className="flex flex-wrap gap-3">
                {p.product_variants.map((v) => (
                  <div key={v.id} className="w-44 rounded-sm border p-3">
                    <p className="text-sm">
                      {v.color_ar} — {v.size}
                    </p>
                    <div className="mt-1 flex gap-1">
                      <Badge variant="secondary" className="text-[10px]">
                        محجوز {v.stock_reserved}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        مبيع {v.stock_sold}
                      </Badge>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      defaultValue={v.stock_available}
                      className="mt-2 h-8"
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val !== v.stock_available && !Number.isNaN(val))
                          stockMutation.mutate({ variantId: v.id, stockAvailable: val });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "تعديل منتج" : "منتج جديد"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم (عربي)">
              <Input
                required
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
              />
            </Field>
            <Field label="الاسم (إنجليزي)">
              <Input
                required
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              />
            </Field>
            <Field label="الرابط (slug)">
              <Input
                required
                dir="ltr"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </Field>
            <Field label="كود المنتج (SKU)">
              <Input
                dir="ltr"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </Field>
            <Field label="سعر التكلفة">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.cost_price}
                onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
              />
            </Field>
            <Field label="سعر البيع">
              <Input
                type="number"
                min={0}
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="سعر العرض (اختياري)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
              />
            </Field>
            <Field label="رابط الصورة الرئيسية">
              <Input
                dir="ltr"
                value={form.main_image}
                onChange={(e) => setForm({ ...form, main_image: e.target.value })}
              />
            </Field>
            <Field label="التصنيف">
              <Picker
                value={form.category_id}
                options={categories}
                onChange={(v) => setForm({ ...form, category_id: v })}
              />
            </Field>
            <Field label="المجموعة">
              <Picker
                value={form.collection_id}
                options={collections}
                onChange={(v) => setForm({ ...form, collection_id: v })}
              />
            </Field>
            <Field label="المناسبة">
              <Picker
                value={form.occasion_id}
                options={occasions}
                onChange={(v) => setForm({ ...form, occasion_id: v })}
              />
            </Field>
            <Field label="نوع التوفير">
              <Select
                value={form.fulfillment}
                onValueChange={(v) =>
                  setForm({ ...form, fulfillment: v as "in_stock" | "made_to_order" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">متوفر بالمخزون</SelectItem>
                  <SelectItem value="made_to_order">تحت الطلب</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="القماش (عربي)">
              <Input
                value={form.fabric_ar}
                onChange={(e) => setForm({ ...form, fabric_ar: e.target.value })}
              />
            </Field>
            <Field label="القماش (إنجليزي)">
              <Input
                value={form.fabric_en}
                onChange={(e) => setForm({ ...form, fabric_en: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="الوصف (عربي)">
                <Textarea
                  rows={3}
                  value={form.description_ar}
                  onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="الوصف (إنجليزي)">
                <Textarea
                  rows={3}
                  value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-6 sm:col-span-2">
              <Toggle
                label="جديد"
                checked={form.is_new}
                onChange={(v) => setForm({ ...form, is_new: v })}
              />
              <Toggle
                label="الأكثر مبيعًا"
                checked={form.is_best_seller}
                onChange={(v) => setForm({ ...form, is_best_seller: v })}
              />
              <Toggle
                label="إصدار محدود"
                checked={form.is_limited}
                onChange={(v) => setForm({ ...form, is_limited: v })}
              />
              <Toggle
                label="منشور"
                checked={form.is_active}
                onChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}

function Picker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Taxonomy[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="اختياري" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>بدون</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name_ar}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
