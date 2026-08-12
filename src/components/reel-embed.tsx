import { reelEmbedSrc } from "@/lib/reel-url";

export function ReelEmbed({ url, title }: { url: string; title?: string }) {
  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-sm border border-border bg-black">
      <iframe
        src={reelEmbedSrc(url)}
        title={title ?? "Facebook Reel"}
        className="absolute inset-0 h-full w-full"
        style={{ border: "none", overflow: "hidden" }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      />
    </div>
  );
}
