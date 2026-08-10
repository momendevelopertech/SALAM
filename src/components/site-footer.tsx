import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-surface-muted">
      <div className="container-salam grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl text-primary">SALAM</div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("brand.tagline")}
          </p>
        </div>
        <div>
          <div className="eyebrow">{t("footer.shopFooter")}</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/shop" className="text-muted-foreground hover:text-primary">
                {t("nav.all")}
              </Link>
            </li>
            <li>
              <Link to="/style-finder" className="text-muted-foreground hover:text-primary">
                {t("nav.styleFinder")}
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="text-muted-foreground hover:text-primary">
                {t("nav.wishlist")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="eyebrow">{t("footer.help")}</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/size-guide" className="text-muted-foreground hover:text-primary">
                {t("nav.sizeGuide")}
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="text-muted-foreground hover:text-primary">
                {t("nav.shipping")}
              </Link>
            </li>
            <li>
              <Link to="/track" className="text-muted-foreground hover:text-primary">
                {t("nav.track")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="eyebrow">{t("footer.brand")}</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-primary">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted-foreground hover:text-primary">
                {t("nav.contact")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="hairline" />
      <div className="container-salam py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} SALAM — {t("footer.rights")}
      </div>
    </footer>
  );
}
