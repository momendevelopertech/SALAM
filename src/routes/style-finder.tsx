import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, Palette, RotateCcw, Ruler, Sparkles } from "lucide-react";
import { getCatalog } from "@/lib/catalog.functions";
import { useI18n } from "@/lib/i18n";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { DirArrow } from "@/components/dir-arrow";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

type Occasion = { id: string; slug: string; name_ar: string; name_en: string };
type Product = ProductCardData & { occasion_id: string | null };

export const Route = createFileRoute("/style-finder")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catalogQuery);
  },
  head: () => ({
    meta: [
      { title: "Style Finder — SALAM | سلام" },
      { name: "description", content: "Answer three short questions and we suggest your pieces." },
      { property: "og:title", content: "Style Finder — SALAM" },
      {
        property: "og:description",
        content: "Answer three short questions and we suggest your pieces.",
      },
    ],
  }),
  component: StyleFinder,
});

type Fit = "relaxed" | "regular";

const STYLES = [
  { value: "minimal", labelKey: "finder.styleMinimal" as const },
  { value: "classic", labelKey: "finder.styleClassic" as const },
  { value: "detailed", labelKey: "finder.styleDetailed" as const },
];

const FITS: { value: Fit; labelKey: "finder.fitRelaxed" | "finder.fitRegular" }[] = [
  { value: "relaxed", labelKey: "finder.fitRelaxed" },
  { value: "regular", labelKey: "finder.fitRegular" },
];

function StyleFinder() {
  const { t, pick } = useI18n();
  const { data } = useSuspenseQuery(catalogQuery);
  const occasions = (data.occasions as Occasion[]).filter((o) => o.id);

  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [fit, setFit] = useState<Fit | null>(null);

  const results = (data.products as unknown as Product[])
    .filter((p) => (occasion ? p.occasion_id === occasion : true))
    .sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));

  const restart = () => {
    setStep(0);
    setOccasion(null);
    setStyle(null);
    setFit(null);
  };

  const finished = step === 3;

  return (
    <div className="container-salam py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t("finder.title")}</h1>

      {!finished ? (
        <div className="mt-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>

          {step === 0 && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 font-display text-2xl">
                <CalendarDays className="h-5 w-5 text-primary" />
                {t("finder.occasion")}
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {occasions.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setOccasion(o.id);
                      setStep(1);
                    }}
                    className="rounded-sm border border-border px-5 py-4 text-start transition-colors hover:border-primary hover:bg-primary-soft"
                  >
                    {pick(o.name_ar, o.name_en)}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 font-display text-2xl">
                <Palette className="h-5 w-5 text-primary" />
                {t("finder.style")}
              </h2>
              <div className="mt-5 grid gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      setStyle(s.value);
                      setStep(2);
                    }}
                    className={`rounded-sm border px-5 py-4 text-start transition-colors ${
                      style === s.value
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {t(s.labelKey)}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 font-display text-2xl">
                <Ruler className="h-5 w-5 text-primary" />
                {t("finder.fit")}
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {FITS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => {
                      setFit(f.value);
                      setStep(3);
                    }}
                    className={`rounded-sm border px-5 py-4 text-start transition-colors ${
                      fit === f.value
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {t(f.labelKey)}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step > 0 && (
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-2.5 text-sm transition-colors hover:border-primary"
              >
                <DirArrow forward={false} className="h-4 w-4" />
                {t("finder.back")}
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary"
              >
                <RotateCcw className="h-4 w-4" />
                {t("finder.restart")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("finder.results")} ({results.length})
            </h2>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary"
            >
              <RotateCcw className="h-4 w-4" />
              {t("finder.restart")}
            </button>
          </div>

          {results.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">{t("shop.empty")}</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
