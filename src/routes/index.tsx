import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { useI18n } from "@/lib/i18n";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SALAM | سلام — عبايات وإسدالات وفساتين محتشمة" },
      {
        name: "description",
        content:
          "أزياء محتشمة راقية من سلام: عبايات وإسدالات وفساتين بأقمشة مختارة بعناية، مع توصيل لكل محافظات مصر.",
      },
      { property: "og:title", content: "SALAM | سلام — عبايات وإسدالات وفساتين محتشمة" },
      {
        property: "og:description",
        content:
          "أزياء محتشمة راقية من سلام: عبايات وإسدالات وفساتين بأقمشة مختارة بعناية، مع توصيل لكل محافظات مصر.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catalogQuery);
  },
  component: Home,
});

type Product = ProductCardData & {
  is_new: boolean;
  is_best_seller: boolean;
};

function Home() {
  const { t, pick } = useI18n();
  const { data } = useSuspenseQuery(catalogQuery);
  const products = data.products as unknown as Product[];
  const newArrivals = products.filter((p) => p.is_new).slice(0, 4);
  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 4);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-surface-muted">
        <img
          src="https://res.cloudinary.com/djseokhow/image/upload/v1786443226/salam/hero.jpg"
          alt="SALAM"
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={1000}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="container-salam relative flex min-h-[72vh] items-center">
          <div className="max-w-xl">
            <div className="eyebrow">{t("home.heroEyebrow")}</div>
            <h1 className="mt-4 whitespace-pre-line font-display text-5xl leading-[1.1] text-foreground md:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              {t("home.heroBody")}
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex rounded-sm bg-primary px-7 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("home.heroCta")}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-salam py-20">
        <SectionTitle title={t("home.categories")} />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {(
            data.categories as {
              slug: string;
              name_ar: string;
              name_en: string;
              image_url: string | null;
            }[]
          ).map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-sm bg-surface-muted"
            >
              {c.image_url && (
                <img
                  src={c.image_url}
                  alt={pick(c.name_ar, c.name_en)}
                  loading="lazy"
                  className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  width={900}
                  height={1200}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-6">
                <span className="font-display text-2xl text-background">
                  {pick(c.name_ar, c.name_en)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title={t("home.newArrivals")} items={newArrivals} />
      <ProductRow title={t("home.bestSellers")} items={bestSellers} />

      <section className="container-salam py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="gold-rule mx-auto" />
          <h2 className="mt-6 font-display text-4xl">{t("home.storyTitle")}</h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">{t("home.storyBody")}</p>
          <Link
            to="/about"
            className="mt-7 inline-flex border-b border-primary pb-1 text-sm text-primary"
          >
            {t("nav.about")}
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="font-display text-3xl">{title}</h2>
      <div className="hairline flex-1" />
    </div>
  );
}

function ProductRow({ title, items }: { title: string; items: Product[] }) {
  if (items.length === 0) return null;
  return (
    <section className="container-salam pb-20">
      <SectionTitle title={title} />
      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
