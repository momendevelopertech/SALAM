import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LayoutDashboard, Package, Tags, ShoppingBag, LogOut } from "lucide-react";
import { getAdminMe } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
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
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "المنتجات", icon: Package, exact: false },
  { to: "/admin/catalog", label: "التصنيفات", icon: Tags, exact: false },
  { to: "/admin/orders", label: "الطلبات", icon: ShoppingBag, exact: false },
] as const;

function AdminLayout() {
  const me = useServerFn(getAdminMe);
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
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <div className="container-salam py-24 text-sm text-muted-foreground">جارٍ التحميل…</div>;
  }

  if (error || !data?.isAdmin) {
    return (
      <div className="container-salam py-24">
        <h1 className="font-display text-3xl">غير مصرّح</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          هذا القسم مخصّص لفريق الإدارة فقط. إذا كان يجب أن يكون لديكِ صلاحية، تواصلي مع مسؤول
          المتجر.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline">
            <Link to="/">العودة للمتجر</Link>
          </Button>
          <Button variant="ghost" onClick={signOut}>
            تسجيل الخروج
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-salam py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <p className="mb-4 font-display text-2xl">لوحة الإدارة</p>
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
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button variant="ghost" className="mt-6 gap-2" onClick={signOut}>
            <LogOut className="size-4" /> تسجيل الخروج
          </Button>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
