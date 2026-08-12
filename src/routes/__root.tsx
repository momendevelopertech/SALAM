import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, Loader2, RotateCw, SearchX, TriangleAlert } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider, useI18n } from "../lib/i18n";
import type { Locale } from "../lib/locale";
import { CartProvider } from "../lib/cart";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <SearchX className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-warning" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RotateCw className="h-4 w-4" />
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  locale: Locale;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SALAM | سلام — عبايات وإسدالات وفساتين محتشمة" },
      {
        name: "description",
        content:
          "أزياء محتشمة راقية من سلام: عبايات وإسدالات وفساتين بأقمشة مختارة بعناية، مع توصيل لكل محافظات مصر.",
      },
      { property: "og:site_name", content: "SALAM" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "SALAM | سلام — عبايات وإسدالات وفساتين محتشمة" },
      { name: "twitter:title", content: "SALAM | سلام — عبايات وإسدالات وفساتين محتشمة" },
      {
        property: "og:description",
        content:
          "أزياء محتشمة راقية من سلام: عبايات وإسدالات وفساتين بأقمشة مختارة بعناية، مع توصيل لكل محافظات مصر.",
      },
      {
        name: "twitter:description",
        content:
          "أزياء محتشمة راقية من سلام: عبايات وإسدالات وفساتين بأقمشة مختارة بعناية، مع توصيل لكل محافظات مصر.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4eac6b64ded41006586b4705dffb1990/id-preview-cb2a40e5--388bcdca-4732-4d64-b864-713ef2d8ded2.lovable.app-1786355800929.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4eac6b64ded41006586b4705dffb1990/id-preview-cb2a40e5--388bcdca-4732-4d64-b864-713ef2d8ded2.lovable.app-1786355800929.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Amiri:wght@400;700&family=Jost:wght@300;400;500;600&family=Almarai:wght@300;400;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
  pendingMs: 80,
  pendingMinMs: 200,
});

function PendingComponent() {
  const { t } = useI18n();
  return (
    <div className="min-h-[60vh]">
      <div className="container-salam py-20">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] w-full rounded-sm bg-surface-muted" />
              <div className="mt-3 h-4 w-3/4 rounded-sm bg-surface-muted" />
              <div className="mt-2 h-4 w-1/2 rounded-sm bg-surface-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <Shell>{children}</Shell>
    </I18nProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { locale, dir } = useI18n();
  return (
    <html lang={locale} dir={dir}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}
