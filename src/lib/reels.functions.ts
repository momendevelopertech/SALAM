import { createServerFn } from "@tanstack/react-start";

type CacheEntry<T> = { data: T; at: number };

function ttlCache<T>(ttlMs: number) {
  const store = new Map<string, CacheEntry<T>>();
  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() - entry.at > ttlMs) {
        store.delete(key);
        return undefined;
      }
      return entry.data;
    },
    set(key: string, data: T) {
      store.set(key, { data, at: Date.now() });
    },
  };
}

const reelsCache = ttlCache<Awaited<ReturnType<typeof getReelsHandler>>>(60_000);

async function getReelsHandler() {
  const { prisma } = await import("@/lib/db");
  const reels = await prisma.reels.findMany({
    where: { is_active: true },
    orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
    select: { id: true, url: true, title_ar: true, title_en: true, sort_order: true },
  });
  return { reels };
}

export const getReels = createServerFn({ method: "GET" }).handler(async () => {
  const cached = reelsCache.get("reels");
  if (cached) return cached;
  const data = await getReelsHandler();
  reelsCache.set("reels", data);
  return data;
});
