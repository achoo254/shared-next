/**
 * The switcher's list for one root domain, as plain data: no React, no DOM, so a
 * server or a test can build it too.
 */
import { hostsFor } from "@achoo254/brand/hosts";
import { APP_SWITCHER_APP_IDS, APP_SWITCHER_CATALOG, } from "./catalog.js";
/** `utm_medium` of every switcher link. */
export const APP_SWITCHER_UTM_MEDIUM = "app_switcher";
/**
 * The catalog locale for a BCP 47 tag, by its language, case-insensitively:
 * `vi`, `vi-*` -> `vi`; `zh`, `zh-*` -> `zh-CN`; anything else -> English
 * (labels never go missing).
 */
export function resolveAppSwitcherLocale(locale) {
    const tag = locale.toLowerCase();
    const isLanguage = (language) => tag === language || tag.startsWith(`${language}-`);
    if (isLanguage("vi"))
        return "vi";
    if (isLanguage("zh"))
        return "zh-CN";
    return "en";
}
/**
 * Links to the other apps under `domain`, then the account page, in catalog
 * order. Throws when `current` is not a catalog app or `domain` is not a
 * lowercase registrable domain (the IdP's domain rule).
 */
export function appSwitcherLinks(options) {
    const { current, domain } = options;
    if (!APP_SWITCHER_APP_IDS.includes(current)) {
        throw new Error(`app-switcher: "${current}" is not a catalog app`);
    }
    const locale = resolveAppSwitcherLocale(options.locale);
    return APP_SWITCHER_CATALOG.filter((entry) => entry.id !== current).map((entry) => {
        const { webOrigin } = hostsFor({ hostTemplates: { web: entry.hostTemplate } }, domain);
        const url = new URL(entry.path, webOrigin);
        url.searchParams.set("utm_source", current);
        url.searchParams.set("utm_medium", APP_SWITCHER_UTM_MEDIUM);
        return {
            id: entry.id,
            label: entry.label[locale],
            description: entry.description[locale],
            href: url.href,
        };
    });
}
