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
      <div className="container-salam flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="logo-track font-display text-2xl leading-none text-primary">SALAM</span>
          <span className="text-xs text-muted-foreground">سلام</span>
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

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLocale}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-xs tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Languages className="h-3.5 w-3.5" />
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
            className="flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-primary"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.cart")}</span>
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] text-primary-foreground">
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
      <nav className="container-salam flex items-center gap-5 overflow-x-auto pb-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="whitespace-nowrap text-xs text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
