import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { resolveInitialLocale } from "./lib/locale";

export const getRouter = async () => {
  const queryClient = new QueryClient();
  const locale = await resolveInitialLocale();

  const router = createRouter({
    routeTree,
    context: { queryClient, locale },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
