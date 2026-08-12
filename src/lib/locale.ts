import { createIsomorphicFn } from "@tanstack/react-start";

export type Locale = "ar" | "en";

export const LOCALE_STORAGE_KEY = "salam.locale";
export const LOCALE_COOKIE_KEY = "salam_locale";

const isLocale = (v: string | null | undefined): v is Locale => v === "ar" || v === "en";

/**
 * Resolves the initial locale per environment:
 * - Server (SSR): reads the `salam_locale` cookie so the very first HTML render
 *   is already in the right language and direction (no Arabic→English flicker).
 * - Client: reads `localStorage` so hydration matches what SSR produced.
 */
export const resolveInitialLocale = createIsomorphicFn()
  .server(async () => {
    const { getCookies } = await import("@tanstack/react-start/server");
    const value = getCookies()[LOCALE_COOKIE_KEY];
    return isLocale(value) ? value : "ar";
  })
  .client(() => {
    const value = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : "ar";
  });

/**
 * Client-only persistence. Keeps `localStorage` (instant reads) and the
 * `salam_locale` cookie (so the next SSR render uses the same language) in sync.
 */
export function persistLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // ignore storage/cookie write failures
  }
}
