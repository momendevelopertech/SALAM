import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ExternalLink, Facebook } from "lucide-react";
import { getReels } from "@/lib/reels.functions";
import { useI18n } from "@/lib/i18n";
import { ReelEmbed } from "@/components/reel-embed";

const reelsQuery = queryOptions({
  queryKey: ["reels"],
  queryFn: () => getReels(),
});

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "SALAM Reels — SALAM | سلام" },
      {
        name: "description",
        content: "شاهدي أحدث ريلز سلام على فيسبوك: إطلالات ومجموعات وقطع محتشمة.",
      },
      { property: "og:title", content: "SALAM Reels — SALAM" },
      {
        property: "og:description",
        content: "شاهدي أحدث ريلز سلام على فيسبوك: إطلالات ومجموعات وقطع محتشمة.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(reelsQuery);
  },
  component: ReelsPage,
});

type ReelRow = {
  id: string;
  url: string;
  title_ar: string | null;
  title_en: string | null;
  sort_order: number;
};

function ReelsPage() {
  const { t, pick } = useI18n();
  const { data } = useSuspenseQuery(reelsQuery);
  const reels = data.reels as ReelRow[];

  return (
    <div className="container-salam py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t("reels.title")}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {t("reels.body")}
      </p>

      {reels.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">{t("reels.empty")}</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {reels.map((reel) => {
            const title = pick(reel.title_ar, reel.title_en);
            return (
              <figure key={reel.id} className="flex flex-col">
                <ReelEmbed url={reel.url} title={title} />
                <figcaption className="mt-3 space-y-1.5">
                  {title && <p className="text-sm text-foreground/90">{title}</p>}
                  <a
                    href={reel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/70"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("reels.watch")}
                  </a>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      <div className="mt-16 flex flex-col items-start gap-3 rounded-sm border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl">{t("reels.follow")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("reels.followBody")}</p>
        </div>
        <a
          href="https://www.facebook.com/share/1Lhe8YTbLH/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Facebook className="h-4 w-4" />
          {t("reels.followCta")}
        </a>
      </div>
    </div>
  );
}
