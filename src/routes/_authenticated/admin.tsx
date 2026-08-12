import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LayoutDashboard, Package, Tags, ShoppingBag, Clapperboard, LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getAdminMe } from "@/lib/admin.functions";
import { logout } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — SALAM | سلام" },
      { name: "description", content: "إدارة المنتجات والتصنيفات والطلبات وحالة التجهيز في سلام." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "SALAM Admin" },
      { property: "og:description", content: "Manage products, categories and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", icon: Package, exact: false },
  { to: "/admin/catalog", icon: Tags, exact: false },
  { to: "/admin/reels", icon: Clapperboard, exact: false },
  { to: "/admin/orders", icon: ShoppingBag, exact: false },
] as const;

const NAV_LABELS = {
  "/admin": "admin.nav.overview",
  "/admin/products": "admin.nav.products",
  "/admin/catalog": "admin.nav.catalog",
  "/admin/reels": "admin.nav.reels",
  "/admin/orders": "admin.nav.orders",
} as const satisfies Record<NavTarget, string>;

type NavTarget = (typeof nav)[number]["to"];

function AdminLayout() {
  const { t } = useI18n();
  const me = useServerFn(getAdminMe);
  const signOutFn = useServerFn(logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => me(),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutFn();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return (
      <div className="container-salam py-24 text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (error || !data?.isAdmin) {
    return (
      <div className="container-salam py-24">
        <h1 className="font-display text-3xl">{t("admin.unauthorized.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("admin.unauthorized.body")}</p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline">
            <Link to="/">{t("admin.unauthorized.back")}</Link>
          </Button>
          <Button variant="ghost" onClick={signOut}>
            {t("nav.signOut")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-salam py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <p className="mb-4 font-display text-2xl">{t("admin.layout.title")}</p>
          <nav className="flex flex-wrap gap-1 lg:flex-col">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {t(NAV_LABELS[item.to])}
                </Link>
              );
            })}
          </nav>
          <Button variant="ghost" className="mt-6 gap-2" onClick={signOut}>
            <LogOut className="size-4" /> {t("nav.signOut")}
          </Button>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
