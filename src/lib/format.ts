import type { Locale } from "./i18n";

export function formatPrice(value: number | string | null | undefined, locale: Locale) {
  const n = Number(value ?? 0);
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
  return locale === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`;
}

export function formatDate(value: string | Date, locale: Locale) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function discountPercent(price: number, salePrice?: number | null) {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export const WHATSAPP_NUMBER = "201093132565";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
