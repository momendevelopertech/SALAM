import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { useI18n } from "@/lib/i18n";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

type Search = { category?: string; sort?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const out: Search = {};
    if (typeof search["category"] === "string") out.category = search["category"];
    if (typeof search["sort"] === "string") out.sort = search["sort"];
    return out;
  },
  head: () => ({
    meta: [
      { title: "المتجر — SALAM | سلام" },
      {
        name: "description",
        content: "تسوقي عبايات وإسدالات وفساتين محتشمة من سلام مع توصيل لكل محافظات مصر.",
      },
      { property: "og:title", content: "Shop — SALAM" },
      { property: "og:description", content: "Shop abayas, esdals and modest dresses from SALAM." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catalogQuery);
  },
  component: Shop,
});

type Product = ProductCardData & {
  price: number;
  category_id: string | null;
  created_at: string;
  units_sold: number;
};

function Shop() {
  const { t, pick, locale } = useI18n();
  const { category, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(catalogQuery);
  const categories = data.categories as {
    id: string;
    slug: string;
    name_ar: string;
    name_en: string;
  }[];
  const active = categories.find((c) => c.slug === category);
  const products = (data.products as unknown as Product[]).filter((p) =>
    active ? p.category_id === active.id : true,
  );

  const sorted = [...products].sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return (a.sale_price ?? a.price) - (b.sale_price ?? b.price);
      case "price_desc":
        return (b.sale_price ?? b.price) - (a.sale_price ?? a.price);
      case "best":
        return b.units_sold - a.units_sold;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const setSort = (value: string) =>
    navigate({ search: (prev) => ({ ...prev, ...(value ? { sort: value } : {}) }) });

  return (
    <div className="container-salam py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t("shop.title")}</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          to="/shop"
          search={sort ? { sort } : {}}
          className={`rounded-sm border px-4 py-1.5 text-sm ${!active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
        >
          {t("shop.all")}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/shop"
            search={{ category: c.slug, ...(sort ? { sort } : {}) }}
            className={`rounded-sm border px-4 py-1.5 text-sm ${active?.slug === c.slug ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
          >
            {pick(c.name_ar, c.name_en)}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {sorted.length} {t("shop.results")}
        </p>
        <select
          value={sort ?? ""}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">{t("shop.sortNewest")}</option>
          <option value="best">{t("shop.sortBest")}</option>
          <option value="price_asc">{t("shop.sortPriceAsc")}</option>
          <option value="price_desc">{t("shop.sortPriceDesc")}</option>
        </select>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">{t("shop.empty")}</p>
      )}
    </div>
  );
}
