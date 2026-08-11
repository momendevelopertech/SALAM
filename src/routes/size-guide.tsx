import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size guide — SALAM | سلام" },
      { name: "description", content: "Find your size across SALAM abayas, esdals and dresses." },
      { property: "og:title", content: "Size guide — SALAM" },
      {
        property: "og:description",
        content: "Find your size across SALAM abayas, esdals and dresses.",
      },
    ],
  }),
  component: SizeGuide,
});

const ROWS = [
  { size: "S", bust: "86–92", length: "135", hips: "92–100" },
  { size: "M", bust: "92–98", length: "137", hips: "98–106" },
  { size: "L", bust: "98–106", length: "139", hips: "106–114" },
  { size: "XL", bust: "106–114", length: "141", hips: "114–122" },
];

function SizeGuide() {
  const { t } = useI18n();

  return (
    <div className="container-salam py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t("size.title")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {t("size.intro")}
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-3 pr-4 font-medium">{t("size.sizes")}</th>
              <th className="py-3 pr-4 font-medium">{t("size.bust")} (cm)</th>
              <th className="py-3 pr-4 font-medium">{t("size.length")} (cm)</th>
              <th className="py-3 pr-4 font-medium">{t("size.hips")} (cm)</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.size} className="border-b border-border">
                <td className="py-3.5 pr-4 font-medium">{r.size}</td>
                <td className="py-3.5 pr-4">{r.bust}</td>
                <td className="py-3.5 pr-4">{r.length}</td>
                <td className="py-3.5 pr-4">{r.hips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-border bg-surface p-6">
          <h2 className="font-display text-xl">{t("size.measure")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("size.measureBody")}
          </p>
        </div>
        <div className="rounded-sm border border-border bg-surface p-6">
          <h2 className="font-display text-xl">{t("size.tips")}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>{t("size.tip1")}</li>
            <li>{t("size.tip2")}</li>
            <li>{t("size.tip3")}</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/shop"
          className="inline-flex rounded-sm bg-primary px-7 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("shop.title")}
        </Link>
        <Link
          to="/style-finder"
          className="inline-flex rounded-sm border border-border px-7 py-3 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {t("nav.styleFinder")}
        </Link>
      </div>
    </div>
  );
}
