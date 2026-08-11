import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { deleteTaxonomy, getAdminTaxonomies, saveTaxonomy } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/catalog")({
  component: AdminCatalog;
});

type TaxTable = "categories" | "collections" | "occasions";

type Row = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type Payload = {
  id?: string;
  table: TaxTable;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

const TABS: { key: TaxTable; label: string }[] = [
  { key: "categories", label: "التصنيفات" },
  { key: "collections", label: "المجموعات" },
  { key: "occasions", label: "المناسبات" },
];

function emptyForm(table: TaxTable) {
  return {
    id: undefined as string | undefined,
    table,
    slug: "",
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    image_url: "",
    sort_order: "0",
    is_active: true,
  };
}

function AdminCatalog() {
  const fetchAll = useServerFn(getAdminTaxonomies);
  const save = useServerFn(saveTaxonomy);
  const remove = useServerFn(deleteTaxonomy);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm("categories"));

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "taxonomies"],
    queryFn: () => fetchAll(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: Payload) => save({ data: payload }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (v: { id: string; table: TaxTable }) => remove({ data: v }),
    onSuccess: () => {
      toast.success("تم الحذف");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew(table: TaxTable) {
    setForm(emptyForm(table));
    setOpen(true);
  }

  function openEdit(table: TaxTable, row: Row) {
    setForm({
      id: row.id,
      table,
      slug: row.slug,
      name_ar: row.name_ar,
      name_en: row.name_en,
      description_ar: row.description_ar ?? "",
      description_en: row.description_en ?? "",
      image_url: row.image_url ?? "",
      sort_order: String(row.sort_order),
      is_active: row.is_active,
    });
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({
      ...(form.id ? { id: form.id } : {}),
      table: form.table,
      slug: form.slug.trim(),
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim(),
      description_ar: form.description_ar.trim() || null,
      description_en: form.description_en.trim() || null,
      image_url: form.image_url.trim() || null,
      sort_order: Number(form.sort_order || 0),
      is_active: form.is_active,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">التصنيفات والمجموعات</h1>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
      ) : (
        <Tabs defaultValue="categories">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((t) => {
            const rows = (data[t.key] ?? []) as unknown as Row[];
            return (
              <TabsContent key={t.key} value={t.key} className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => openNew(t.key)}>إضافة</Button>
                </div>
                <div className="overflow-x-auto rounded-sm border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>الرابط</TableHead>
                        <TableHead>الترتيب</TableHead>
                        <TableHead>مُفعّل</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <p className="font-medium">{row.name_ar}</p>
                            <p className="text-xs text-muted-foreground">{row.name_en}</p>
                          </TableCell>
                          <TableCell dir="ltr" className="text-xs">
                            {row.slug}
                          </TableCell>
                          <TableCell>{row.sort_order}</TableCell>
                          <TableCell>{row.is_active ? "نعم" : "لا"}</TableCell>
                          <TableCell className="text-end">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(t.key, row)}>
                              تعديل
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => removeMutation.mutate({ id: row.id, table: t.key })}
                            >
                              حذف
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "تعديل" : "إضافة"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>الاسم (عربي)</Label>
              <Input
                required
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الاسم (إنجليزي)</Label>
              <Input
                required
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الرابط (slug)</Label>
              <Input
                required
                dir="ltr"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>رابط الصورة</Label>
              <Input
                dir="ltr"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الترتيب</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              مُفعّل
            </label>
            <DialogFooter>
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
