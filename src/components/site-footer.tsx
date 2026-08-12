import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { whatsappLink } from "@/lib/format";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-surface-muted">
      <div className="container-salam grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="logo-track font-display text-2xl text-primary">SALAM</div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("brand.tagline")}
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
            <a
              href={whatsappLink(t("contact.askTitle"))}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 transition-colors hover:text-primary"
              dir="ltr"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              +20 10 93132565
            </a>
            <a
              href="mailto:Salam.modest.wear@gmail.com"
              className="inline-flex w-fit items-center gap-2 break-all transition-colors hover:text-primary"
              dir="ltr"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              Salam.modest.wear@gmail.com
            </a>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://instagram.com/salam_modest"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/share/1Lhe8YTbLH/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={whatsappLink(t("contact.askTitle"))}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
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
              <Link to="/reels" className="text-muted-foreground hover:text-primary">
                {t("nav.reels")}
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
