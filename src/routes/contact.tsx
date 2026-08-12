import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { whatsappLink } from "@/lib/format";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SALAM — SALAM | سلام" },
      { name: "description", content: "Reach the SALAM team on WhatsApp or email." },
      { property: "og:title", content: "Contact SALAM — SALAM" },
      { property: "og:description", content: "Reach the SALAM team on WhatsApp or email." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useI18n();

  return (
    <div className="container-salam py-16">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t("contact.title")}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {t("contact.body")}
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <a
          href={whatsappLink(t("contact.askTitle"))}
          target="_blank"
          rel="noreferrer"
          className="group rounded-sm border border-border bg-surface p-6 transition-colors hover:border-primary"
        >
          <MessageCircle className="h-6 w-6 text-primary" />
          <h2 className="mt-4 font-display text-xl">{t("contact.whatsapp")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("contact.whatsappBody")}
          </p>
          <span className="mt-4 inline-block text-sm text-primary">{t("contact.whatsappCta")}</span>
        </a>

        <div className="rounded-sm border border-border bg-surface p-6">
          <Mail className="h-6 w-6 text-primary" />
          <h2 className="mt-4 font-display text-xl">{t("contact.email")}</h2>
          <a
            href="mailto:Salam.modest.wear@gmail.com"
            className="mt-2 block text-sm text-foreground hover:text-primary"
          >
            Salam.modest.wear@gmail.com
          </a>
        </div>

        <div className="rounded-sm border border-border bg-surface p-6">
          <Phone className="h-6 w-6 text-primary" />
          <h2 className="mt-4 font-display text-xl">{t("contact.phone")}</h2>
          <a
            href="tel:+201093132565"
            className="mt-2 block text-sm text-foreground hover:text-primary"
          >
            +20 10 93132565
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-border bg-surface p-6">
        <Instagram className="h-6 w-6 text-primary" />
        <h2 className="mt-4 font-display text-xl">{t("contact.social")}</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            href="https://instagram.com/salam_modest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Instagram className="h-4 w-4" />
            {t("contact.instagram")}
          </a>
          <a
            href="https://www.facebook.com/share/1Lhe8YTbLH/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Facebook className="h-4 w-4" />
            {t("contact.facebook")}
          </a>
          <a
            href={whatsappLink(t("contact.askTitle"))}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            {t("contact.whatsapp")}
          </a>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">{t("contact.hours")}</p>
    </div>
  );
}
