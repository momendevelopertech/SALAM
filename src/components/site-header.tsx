import { Link } from "@tanstack/react-router";
import { Heart, Languages, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const { t, locale, toggleLocale } = useI18n();
  const { count } = useCart();

  const links = [
    { to: "/shop", label: t("nav.shop") },
    { to: "/reels", label: t("nav.reels") },
    { to: "/style-finder", label: t("nav.styleFinder") },
    { to: "/about", label: t("nav.about") },
    { to: "/track", label: t("nav.track") },
    { to: "/contact", label: t("nav.contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="container-salam flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-6">
        <Link to="/" className="flex shrink-0 items-center">
          <img src="/logo.jpg" alt="SALAM" className="h-7 w-auto sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-4">
          <button
            onClick={toggleLocale}
            className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[11px] tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:px-2.5 sm:text-xs"
          >
            <Languages className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {locale === "ar" ? "EN" : "ع"}
          </button>
          <Link
            to="/wishlist"
            className="hidden items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-primary sm:flex"
          >
            <Heart className="h-4 w-4" />
            {t("nav.wishlist")}
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center text-foreground/80 transition-colors hover:text-primary"
          >
            <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-primary sm:flex"
          >
            <LayoutDashboard className="h-4 w-4" />
            {locale === "ar" ? "الإدارة" : "Admin"}
          </Link>
        </div>
      </div>
      <nav className="container-salam flex items-center gap-4 overflow-x-auto border-t border-border/40 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="whitespace-nowrap rounded-sm px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            activeProps={{ className: "bg-primary-soft text-primary" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
