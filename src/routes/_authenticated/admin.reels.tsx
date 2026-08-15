import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { deleteReel, getAdminReels, saveReel, setReelActive } from "@/lib/admin.functions";
import { ReelEmbed } from "@/components/reel-embed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export const Route = createFileRoute("/_authenticated/admin/reels")({
  component: AdminReels,
});

type ReelRow = {
  id: string;
  url: string;
  title_ar: string | null;
  title_en: string | null;
  sort_order: number;
  is_active: boolean;
};

type Form = {
  id?: string;
  url: string;
  title_ar: string;
  title_en: string;
  sort_order: string;
  is_active: boolean;
};

function emptyForm(): Form {
  return {
    url: "",
    title_ar: "",
    title_en: "",
    sort_order: "0",
    is_active: true,
  };
}

function AdminReels() {
  const { t } = useI18n();
  const fetchAll = useServerFn(getAdminReels);
  const save = useServerFn(saveReel);
  const remove = useServerFn(deleteReel);
  const toggle = useServerFn(setReelActive);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(() => emptyForm());

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reels"],
    queryFn: () => fetchAll(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "reels"] });
    void queryClient.invalidateQueries({ queryKey: ["reels"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: Form) =>
      save({
        data: {
          ...(payload.id ? { id: payload.id } : {}),
          url: payload.url.trim(),
          title_ar: payload.title_ar.trim() || null,
          title_en: payload.title_en.trim() || null,
          sort_order: Number(payload.sort_order || 0),
          is_active: payload.is_active,
        },
      }),
    onSuccess: () => {
      toast.success(t("common.saved"));
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success(t("admin.catalog.deleted"));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (r: ReelRow) => toggle({ data: { id: r.id, isActive: !r.is_active } }),
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(row: ReelRow) {
    setForm({
      id: row.id,
      url: row.url,
      title_ar: row.title_ar ?? "",
      title_en: row.title_en ?? "",
      sort_order: String(row.sort_order),
      is_active: row.is_active,
    });
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(form);
  }

  const rows = (data?.reels ?? []) as ReelRow[];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">{t("admin.nav.reels")}</h1>

      <div className="flex justify-end">
        <Button onClick={openNew}>{t("admin.reels.add")}</Button>
      </div>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("admin.reels.empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.reels.preview")}</TableHead>
                <TableHead>{t("admin.reels.title")}</TableHead>
                <TableHead className="text-left">{t("admin.reels.url")}</TableHead>
                <TableHead>{t("admin.catalog.sortOrder")}</TableHead>
                <TableHead>{t("admin.reels.visible")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="w-16">
                      <ReelEmbed
                        url={row.url}
                        {...((row.title_ar ?? row.title_en)
                          ? { title: row.title_ar ?? row.title_en! }
                          : {})}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{row.title_ar || "—"}</p>
                    <p className="text-xs text-muted-foreground">{row.title_en || "—"}</p>
                  </TableCell>
                  <TableCell dir="ltr" className="max-w-[220px] truncate text-xs">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {row.url}
                    </a>
                  </TableCell>
                  <TableCell>{row.sort_order}</TableCell>
                  <TableCell>
                    <Switch
                      checked={row.is_active}
                      onCheckedChange={() => toggleMutation.mutate(row)}
                      disabled={toggleMutation.isPending}
                    />
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeMutation.mutate(row.id)}
                    >
                      {t("common.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? t("admin.reels.editTitle") : t("admin.reels.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("admin.reels.urlLabel")}</Label>
              <Input
                required
                dir="ltr"
                placeholder="https://www.facebook.com/reel/…"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("admin.reels.titleAr")}</Label>
                <Input
                  value={form.title_ar}
                  onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.reels.titleEn")}</Label>
                <Input
                  value={form.title_en}
                  onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.form.sortOrder")}</Label>
              <Input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              {t("admin.reels.visibleLabel")}
            </label>
            <DialogFooter>
              <Button type="submit" disabled={saveMutation.isPending}>
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
