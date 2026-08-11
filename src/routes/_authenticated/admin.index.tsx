import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  preparing: "قيد التجهيز",
  ready_for_shipping: "جاهز للشحن",
  shipped: "تم الشحن",
  out_for_delivery: "قيد التوصيل",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

function AdminOverview() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => fetchOverview(),
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>;
  }

  const stats = [
    { label: "إجمالي المبيعات", value: formatPrice(data.revenue, "ar") },
    { label: "عدد الطلبات", value: String(data.orderCount) },
    { label: "مدفوعات بانتظار المراجعة", value: String(data.pendingPayments) },
    { label: "المنتجات المنشورة", value: `${data.activeProducts} / ${data.productCount}` },
    { label: "مقاسات قاربت على النفاد", value: String(data.lowStock) },
    { label: "مقاسات نفدت", value: String(data.outOfStock) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">نظرة عامة</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-normal tracking-wide text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium">الطلبات حسب الحالة</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="rounded-sm border px-3 py-2 text-sm">
              <span className="text-muted-foreground">{label}: </span>
              <span className="font-medium">{data.byStatus[key] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
