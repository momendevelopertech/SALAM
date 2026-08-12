import { createFileRoute, Link } from "@tanstack/react-router";
import { Feather, Gem, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { DirArrow } from "@/components/dir-arrow";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SALAM — SALAM | سلام" },
      { name: "description", content: "The story behind SALAM premium modest fashion." },
      { property: "og:title", content: "About SALAM — SALAM" },
      { property: "og:description", content: "The story behind SALAM premium modest fashion." },
    ],
  }),
  component: About,
});

const VALUES = [
  {
    key: "about.value1Title" as const,
    bodyKey: "about.value1Body" as const,
    icon: Feather,
  },
  {
    key: "about.value2Title" as const,
    bodyKey: "about.value2Body" as const,
    icon: Gem,
  },
  {
    key: "about.value3Title" as const,
    bodyKey: "about.value3Body" as const,
    icon: ShieldCheck,
  },
];

function About() {
  const { t, pick } = useI18n();

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-surface-muted">
        <img
          src="https://res.cloudinary.com/djseokhow/image/upload/v1786443226/salam/hero.jpg"
          alt={t("brand.name")}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          width={1600}
          height={1000}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="container-salam relative flex min-h-[60vh] items-end pb-16 pt-32">
          <div className="max-w-2xl">
            <div className="eyebrow">{t("brand.tagline")}</div>
            <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
              {t("about.title")}
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">{t("about.body")}</p>
          </div>
        </div>
      </section>

      <section className="container-salam py-20">
        <h2 className="text-center font-display text-4xl">{t("about.valuesTitle")}</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.key} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
                <v.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-5 font-display text-2xl">{t(v.key)}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{t(v.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-salam pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-sm">
            <img
              src="https://res.cloudinary.com/djseokhow/image/upload/v1786443235/salam/products/esdal-tuqa.jpg"
              alt={pick("إسدال من مجموعة سلام", "An esdal from the SALAM collection")}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
              width={800}
              height={1000}
            />
          </div>
          <div>
            <div className="eyebrow">{t("home.signature")}</div>
            <h2 className="mt-3 font-display text-4xl leading-tight">{t("home.storyTitle")}</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">{t("home.storyBody")}</p>
            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-sm bg-primary px-7 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("home.heroCta")}
              <DirArrow className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
