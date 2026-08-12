import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  Eye,
  Hourglass,
  Package,
  PackageX,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getAdminOverview } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

const STATUS_ORDER = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_shipping",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

function AdminOverview() {
  const { t, locale } = useI18n();
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => fetchOverview(),
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  const stats: {
    label: string;
    value: string;
    to: "/admin/orders" | "/admin/products";
    icon: LucideIcon;
  }[] = [
    {
      label: t("admin.overview.revenue"),
      value: formatPrice(data.revenue, locale),
      to: "/admin/orders",
      icon: Wallet,
    },
    {
      label: t("admin.overview.orders"),
      value: String(data.orderCount),
      to: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: t("admin.overview.pendingPayments"),
      value: String(data.pendingPayments),
      to: "/admin/orders",
      icon: Hourglass,
    },
    {
      label: t("admin.overview.publishedProducts"),
      value: `${data.activeProducts} / ${data.productCount}`,
      to: "/admin/products",
      icon: Package,
    },
    {
      label: t("admin.overview.lowStock"),
      value: String(data.lowStock),
      to: "/admin/products",
      icon: AlertTriangle,
    },
    {
      label: t("admin.overview.outOfStock"),
      value: String(data.outOfStock),
      to: "/admin/products",
      icon: PackageX,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">{t("admin.nav.overview")}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group block">
            <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-surface-muted">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xs font-normal tracking-wide text-muted-foreground">
                    {s.label}
                  </CardTitle>
                  <s.icon className="size-4 shrink-0 text-muted-foreground/60" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl">{s.value}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary opacity-80 transition-opacity group-hover:opacity-100">
                  <Eye className="size-3.5" />
                  {t("admin.view")}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium">{t("admin.overview.byStatus")}</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((key) => (
            <div key={key} className="rounded-sm border px-3 py-2 text-sm">
              <span className="text-muted-foreground">{t(`status.${key}`)}: </span>
              <span className="font-medium">{data.byStatus[key] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
