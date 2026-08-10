import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

type Search = { category?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["category"] === "string" ? { category: search["category"] } : {},
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

type Product = {
  slug: string;
  name_ar: string;
  name_en: string;
  price: number;
  sale_price: number | null;
  main_image: string | null;
  category_id: string;
};

function Shop() {
  const { t, pick, locale } = useI18n();
  const { category } = Route.useSearch();
  const { data } = useSuspenseQuery(catalogQuery);
  const categories = data.categories as { id: string; slug: string; name_ar: string; name_en: string }[];
  const active = categories.find((c) => c.slug === category);
  const products = (data.products as unknown as Product[]).filter((p) =>
    active ? p.category_id === active.id : true,
  );

  return (
    <div className="container-salam py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t("shop.title")}</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          to="/shop"
          search={{}}
          className={`rounded-sm border px-4 py-1.5 text-sm ${!active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
        >
          {t("shop.all")}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/shop"
            search={{ category: c.slug }}
            className={`rounded-sm border px-4 py-1.5 text-sm ${active?.slug === c.slug ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
          >
            {pick(c.name_ar, c.name_en)}
          </Link>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {products.length} {t("shop.results")}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <div key={p.slug} className="group block">
            {p.main_image && (
              <img
                src={p.main_image}
                alt={pick(p.name_ar, p.name_en)}
                loading="lazy"
                className="aspect-[3/4] w-full rounded-sm object-cover"
                width={900}
                height={1200}
              />
            )}
            <div className="mt-3 text-sm">{pick(p.name_ar, p.name_en)}</div>
            <div className="mt-1 text-sm text-primary">
              {formatPrice(p.sale_price ?? p.price, locale)}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">{t("shop.empty")}</p>
      )}
    </div>
  );
}
