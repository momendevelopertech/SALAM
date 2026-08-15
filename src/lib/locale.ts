import { createIsomorphicFn } from "@tanstack/react-start";

export type Locale = "ar" | "en";

export const LOCALE_STORAGE_KEY = "salam.locale";
export const LOCALE_COOKIE_KEY = "salam_locale";

const isLocale = (v: string | null | undefined): v is Locale => v === "ar" || v === "en";

/**
 * Resolves the initial locale per environment:
 * - Server (SSR): reads the `salam_locale` cookie so the very first HTML render
 *   is already in the right language and direction (no Arabic→English flicker).
 * - Client: reads the *same* cookie so hydration always matches what SSR
 *   produced. `localStorage` is never used for the initial value because it can
 *   diverge from the cookie (e.g. cookies cleared but storage kept) and would
 *   cause a hydration mismatch.
 */
export const resolveInitialLocale = createIsomorphicFn()
  .server(async () => {
    const { getCookies } = await import("@tanstack/react-start/server");
    const value = getCookies()[LOCALE_COOKIE_KEY];
    return isLocale(value) ? value : "ar";
  })
  .client(() => {
    const value = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${LOCALE_COOKIE_KEY}=`))
      ?.slice(LOCALE_COOKIE_KEY.length + 1);
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
